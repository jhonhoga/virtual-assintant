// Constantes para Google Sheets
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Nombres exactos de las hojas en el documento
export const SHEET_NAMES = {
  CASOS: 'Hoja 1',
  EVENTOS: 'Hoja3'
};

// Mapeo de nombres de columnas
export const COLUMN_MAPPING = {
  'Radicado': 'radicado',
  'Nombre del asunto': 'nombredelasunto',
  'Estado': 'estado',
  'Asignado a': 'asignadoa',
  'Fecha': 'fecha',
  'Fecha estimada respuesta': 'fechaestimadarespuesta',
  'Respuesta': 'respuesta',
  'Enlace': 'enlace',
  'Actividad': 'actividad',
  'Hora de inicio': 'horadeinicio',
  'Ubicación': 'ubicacion',
  'Notas': 'notas',
  'Teléfono': 'telefono'
};

export async function fetchSheetData(sheetName) {
  try {
    // Primero, obtener información sobre las hojas para verificar el nombre correcto
    const metadataResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`
    );

    if (!metadataResponse.ok) {
      throw new Error('No se pudo obtener la información de la hoja de cálculo');
    }

    const metadata = await metadataResponse.json();
    
    // Mostrar los nombres de todas las hojas disponibles
    const availableSheets = metadata.sheets.map(s => s.properties.title);
    console.log('Hojas disponibles:', availableSheets);

    // Encontrar la hoja correcta
    const sheet = metadata.sheets.find(s => s.properties.title === sheetName);
    if (!sheet) {
      throw new Error(`No se encontró la hoja "${sheetName}". Hojas disponibles: ${availableSheets.join(', ')}`);
    }

    // Usar el ID de la hoja encontrada
    const range = `${sheet.properties.title}!A1:Z1000`;
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error detallado:', errorData);
      throw new Error(`Error al obtener datos de Google Sheets: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    const rows = result.values;

    if (!rows || rows.length === 0) {
      return [];
    }

    const headers = rows[0];
    console.log('Encabezados encontrados:', headers);

    const data = rows.slice(1).map(row => {
      const item = {};
      headers.forEach((header, index) => {
        const mappedKey = COLUMN_MAPPING[header] || header.toLowerCase().replace(/ /g, '');
        item[mappedKey] = row[index] || '';
      });
      return item;
    });

    return data;
  } catch (error) {
    console.error('Error al obtener datos de Google Sheets:', error);
    throw error;
  }
}
