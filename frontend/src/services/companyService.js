import api from './api';
import { handleError } from './errorHandler';

export const getAllCompanies = async () => {
  try {
    const response = await api.get('/companies');
    // Ensure we're returning an array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error in getAllCompanies:', error);
    // Don't return the error, throw it
    throw handleError(error);
  }
};

export const getCompany = async (id) => {
  try {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createCompany = async (companyData) => {
  try {
    const response = await api.post('/companies', companyData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateCompany = async (id, companyData) => {
  try {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteCompany = async (id) => {
  try {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};