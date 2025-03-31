import api from './api';
import { handleError } from './errorHandler';

/**
 * Service for managing sales pipeline data
 */
export const salesService = {
  /**
   * Get the sales pipeline data - contacts grouped by stage
   * @returns {Promise<Object>} Sales pipeline data
   */
  getPipelineData: async () => {
    try {
      const response = await api.get('/sales/pipeline');
      return response.data;
    } catch (error) {
      return handleError(error, 'Error fetching sales pipeline data');
    }
  },

  /**
   * Update a contact's sales stage
   * @param {number} contactId - Contact ID
   * @param {string} salesStage - New sales stage
   * @returns {Promise<Object>} Updated contact
   */
  updateContactStage: async (contactId, salesStage) => {
    try {
      const response = await api.put(`/contacts/${contactId}`, { sales_stage: salesStage });
      return response.data;
    } catch (error) {
      return handleError(error, `Error updating contact stage for ${contactId}`);
    }
  },
  
  /**
   * Update a contact's type
   * @param {number} contactId - Contact ID
   * @param {string} contactType - New contact type
   * @returns {Promise<Object>} Updated contact
   */
  updateContactType: async (contactId, contactType) => {
    try {
      const response = await api.put(`/contacts/${contactId}`, { contact_type: contactType });
      return response.data;
    } catch (error) {
      return handleError(error, `Error updating contact type for ${contactId}`);
    }
  }
}; 