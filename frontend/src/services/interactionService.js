import api from './api';
import { handleError } from './errorHandler';

/**
 * Creează o nouă interacțiune.
 * @param {object} interactionData - Datele interacțiunii (interaction_type, notes, contact_id?, company_id?).
 * @returns {Promise<object>} Interacțiunea creată.
 */
export const createInteraction = async (interactionData) => {
  try {
    const response = await api.post('/interactions', interactionData);
    return response.data;
  } catch (error) {
    console.error('Error creating interaction:', error);
    throw handleError(error);
  }
};

/**
 * Șterge o interacțiune specifică.
 * @param {number} interactionId - ID-ul interacțiunii de șters.
 * @returns {Promise<object>} Mesajul de confirmare.
 */
export const deleteInteraction = async (interactionId) => {
  try {
    const response = await api.delete(`/interactions/${interactionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting interaction ${interactionId}:`, error);
    throw handleError(error);
  }
};

/**
 * Preluare interacțiuni pentru o companie specifică.
 * @param {number} companyId - ID-ul companiei.
 * @returns {Promise<Array<object>>} Lista de interacțiuni pentru companie.
 */
export const getInteractionsForCompany = async (companyId) => {
  try {
    // Presupunem că API-ul suportă filtrarea prin query parameter `company_id`
    const response = await api.get('/interactions', {
      params: { company_id: companyId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching interactions for company ${companyId}:`, error);
    throw handleError(error);
  }
};

/**
 * Preluare numărul total de interacțiuni.
 * @returns {Promise<number>} Numărul total de interacțiuni.
 */
export const getTotalInteractionsCount = async () => {
  try {
    const response = await api.get('/interactions/count');
    return response.data.count; // Returnează direct numărul
  } catch (error) {
    console.error('Error fetching total interactions count:', error);
    throw handleError(error);
  }
};

/**
 * Preluare tuturor interacțiunilor.
 * @returns {Promise<Array<object>>} Lista tuturor interacțiunilor.
 */
export const getAllInteractions = async () => {
  try {
    const response = await api.get('/interactions');
    // Asigură-te că returnezi un array, chiar dacă API-ul returnează altceva din greșeală
    return Array.isArray(response.data) ? response.data : []; 
  } catch (error) {
    console.error('Error fetching all interactions:', error);
    throw handleError(error);
  }
}; 