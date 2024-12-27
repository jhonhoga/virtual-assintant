import { VITE_GOOGLE_SHEETS_ID, VITE_GOOGLE_API_KEY } from '../config';

// Nombres exactos de las hojas en el documento
export const SHEET_NAMES = {
  RADICADOS: 'Hoja 1',
  EVENTOS: 'Hoja3'
};

const COLUMN_MAPPING = {
  // Mapeo para Hoja 1 (Chatbot)
  'Radicado': 'radicado',
  'Fecha': 'fecha',
  'Nombre del Asunto': 'nombredelasunto',
  'Asignado a': 'asignadoa',
  'Estado': 'estado',
  'Fecha estimada respuesta': 'fechaestimadarespuesta',
  'Respuesta': 'respuesta',
  'Enlace': 'enlace',
  // Mapeo para Hoja 3 (Eventos)
  'Actividad': 'actividad',
  'Tipo de actividad': 'tipodeactividad',
  'Hora de inicio': 'horadeinicio',
  'Hora de finalización': 'horadefinalizacion',
  'Ubicación': 'ubicacion',
  'Notas': 'notas',
  'Teléfono': 'telefono'
};

export const fetchSheetData = async (sheetName) => {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${VITE_GOOGLE_SHEETS_ID}/values/${sheetName}?key=${VITE_GOOGLE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Error al obtener datos de Google Sheets');
    }

    const data = await response.json();
    const rows = data.values || [];

    if (rows.length < 2) {
      return [];
    }

    const headers = rows[0].map(header => header.toLowerCase().trim());
    const result = rows.slice(1).map(row => {
      const item = {};
      headers.forEach((header, index) => {
        const mappedKey = COLUMN_MAPPING[header] || header;
        item[mappedKey] = row[index] || '';
      });
      return item;
    });

    console.log('Datos obtenidos de Google Sheets:', result);
    return result;

  } catch (error) {
    console.error('Error al obtener datos:', error);
    throw error;
  }
};
