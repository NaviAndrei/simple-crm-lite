import api from './api';
import { handleError } from './errorHandler';

/**
 * Preluare raport interacțiuni grupate după tip.
 * @returns {Promise<object>} Un obiect cu { 'TipInteracțiune': count }.
 */
export const getInteractionsByTypeReport = async () => {
  try {
    const response = await api.get('/reports/interactions-by-type');
    return response.data; // API-ul returnează deja obiectul formatat
  } catch (error) {
    console.error('Error fetching interactions by type report:', error);
    throw handleError(error);
  }
};

// More reports will be added here in the future