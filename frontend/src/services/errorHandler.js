export const handleError = (error) => {
  if (error.response) {
    // Server responded with an error
    throw new Error(error.response.data.error || 'A server error occurred');
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('Could not contact server');
  } else {
    // Something else went wrong
    throw new Error('An unexpected error occurred');
  }
}; 