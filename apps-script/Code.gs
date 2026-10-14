/**
 * Portero Diario: servidor en Google Apps Script.
 *
 * Guarda el estado completo de la app en un archivo JSON de tu Google Drive
 * y escribe tus sesiones y tests en una hoja de cálculo que puedes consultar.
 *
 * ANTES DE IMPLEMENTAR: cambia CLAVE por una contraseña tuya (mínimo 6 caracteres).
 * Pon la misma clave en la app, en Perfil > Guardar en Google Sheets.
 * No subas tu clave real a GitHub: cámbiala solo aquí, en el editor de Apps Script.
 */
const CLAVE = 'cambia-esta-clave';

const NOMBRE_ARCHIVO = 'portero-diario-estado.json';
const NOMBRE_LIBRO = 'Portero Diario (datos)';

const TIPOS = {
  fuerza: 'Fuerza y potencia',
  tecnica: 'Técnica intensa',
  reaccion: 'Reacción y pies',
  activacion: 'Activación',
  recuperacion: 'Recuperación',
  base: 'Técnica base y prevención',
  equipo: 'Complemento al entreno',
  partido: 'Día de partido',
  descanso: 'Descanso'
};
const LUGARES = { campo: 'Campo', parque: 'Parque', gimnasio: 'Gimnasio', pared: 'Pared', casa: 'Casa' };
const TESTS = {
  salto: 'Salto vertical (cm)',
  tenis30: 'Atrapes de tenis en 30 s',
  w: 'Blocajes en W seguidos',
  agil: 'Test 5-10-5 (s)',
  plancha: 'Plancha lateral (s)',
  saque: 'Precisión de saque (de 10)'
};

function doGet() {
  return json_({ ok: true, app: 'Portero Diario' });
}

function doPost(e) {
  let peticion;
  try {
    peticion = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'Petición no válida' });
  }
  if (CLAVE === 'cambia-esta-clave') {
    return json_({ ok: false, error: 'Cambia la CLAVE en el script antes de usarlo' });
  }
  if (!peticion || peticion.clave !== CLAVE) {
    return json_({ ok: false, error: 'La clave no coincide con la del script' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (peticion.accion === 'leer') {
      return json_({ ok: true, estado: leerEstado_() });
    }
    if (peticion.accion === 'guardar') {
      const estado = peticion.estado;
      if (!estado || typeof estado !== 'object') return json_({ ok: false, error: 'No hay datos que guardar' });
      const actual = leerEstado_();
      // No pisar datos más recientes guardados desde otro dispositivo.
      if (actual && (actual.updatedAt || 0) > (estado.updatedAt || 0)) {
        return json_({ ok: true, ignorado: true });
      }
      guardarEstado_(estado);
      escribirHojas_(estado);
      return json_({ ok: true });
    }
    return json_({ ok: false, error: 'Acción desconocida' });
  } finally {
    lock.releaseLock();
  }
}

/** Ejecútala una vez desde el editor para autorizar los permisos de Drive y Hojas de cálculo. */
function probar() {
  const archivo = archivo_();
  const libro = libro_();
  Logger.log('Archivo de estado: ' + archivo.getUrl());
  Logger.log('Hoja de datos: ' + libro.getUrl());
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function archivo_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('ARCHIVO_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (err) { /* se creó de nuevo abajo */ }
  }
  const archivo = DriveApp.createFile(NOMBRE_ARCHIVO, '{}', MimeType.PLAIN_TEXT);
  props.setProperty('ARCHIVO_ID', archivo.getId());
  return archivo;
}

function libro_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('LIBRO_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (err) { /* se creó de nuevo abajo */ }
  }
  const libro = SpreadsheetApp.create(NOMBRE_LIBRO);
  props.setProperty('LIBRO_ID', libro.getId());
  return libro;
}

function leerEstado_() {
  const txt = archivo_().getBlob().getDataAsString('UTF-8');
  if (!txt || txt === '{}') return null;
  try { return JSON.parse(txt); } catch (err) { return null; }
}

function guardarEstado_(estado) {
  archivo_().setContent(JSON.stringify(estado));
}

/** Evita que un texto que empieza por =, +, - o @ se interprete como fórmula. */
function texto_(v) {
  const s = v == null ? '' : String(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function hoja_(libro, nombre, cabecera) {
  let hoja = libro.getSheetByName(nombre);
  if (!hoja) hoja = libro.insertSheet(nombre);
  hoja.clearContents();
  hoja.getRange(1, 1, 1, cabecera.length).setValues([cabecera]).setFontWeight('bold');
  hoja.setFrozenRows(1);
  return hoja;
}

function escribirHojas_(estado) {
  const libro = libro_();

  const sesiones = Object.keys(estado.log || {}).sort().map(function (fecha) {
    const s = estado.log[fecha] || {};
    const min = Number(s.mins) || 0;
    const rpe = Number(s.rpe) || 0;
    return [
      fecha,
      TIPOS[s.type] || s.type || '',
      min,
      rpe,
      min * rpe,
      texto_(s.feel),
      LUGARES[s.loc] || s.loc || '',
      s.mode === 'pareja' ? 'Sí' : 'No',
      texto_(s.note)
    ];
  });
  const hs = hoja_(libro, 'Sesiones', ['Fecha', 'Sesión', 'Minutos', 'Esfuerzo (1-10)', 'Carga (min × esfuerzo)', 'Sensación', 'Lugar', 'Con compañero', 'Nota']);
  if (sesiones.length) hs.getRange(2, 1, sesiones.length, sesiones[0].length).setValues(sesiones);

  const tests = [];
  Object.keys(estado.tests || {}).forEach(function (id) {
    (estado.tests[id] || []).forEach(function (r) {
      tests.push([r.d, TESTS[id] || id, Number(r.v)]);
    });
  });
  tests.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
  const ht = hoja_(libro, 'Tests', ['Fecha', 'Test', 'Resultado']);
  if (tests.length) ht.getRange(2, 1, tests.length, 3).setValues(tests);

  const def = libro.getSheetByName('Hoja 1') || libro.getSheetByName('Sheet1');
  if (def && libro.getSheets().length > 1) libro.deleteSheet(def);
}
