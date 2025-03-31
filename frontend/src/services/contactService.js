import axios from 'axios';

// Base API URL
const API_URL = '/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error handler helper
const handleError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response data:', error.response.data);
    console.error('Status code:', error.response.status);
    throw new Error(error.response.data.error || 'An error occurred with the API');
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Request was made but no response was received');
    throw new Error('No response received from server. Please check your network connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error in request setup:', error.message);
    throw new Error('Error in request setup: ' + error.message);
  }
};

// Get all contacts
export const getAllContacts = async () => {
  try {
    const response = await api.get('/contacts');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get a contact by ID
export const getContactById = async (id) => {
  try {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Create a new contact
export const createContact = async (contactData) => {
  try {
    const response = await api.post('/contacts', contactData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update an existing contact
export const updateContact = async (id, contactData) => {
  try {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Delete a contact
export const deleteContact = async (id) => {
  try {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};
