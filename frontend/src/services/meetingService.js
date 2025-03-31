import api from './api';

// Get all meetings
export const getMeetings = async () => {
  try {
    const response = await api.get('/meetings');
    
    // Validare răspuns
    if (!response || !Array.isArray(response.data)) {
      console.error('Invalid response from API:', response);
      return [];
    }
    
    // Procesăm datele pentru a ne asigura că sunt în formatul corect
    return response.data.map(meeting => {
      if (!meeting) return null;
      
      try {
        return {
          id: String(meeting.id || ''),
          title: String(meeting.title || ''),
          description: String(meeting.description || ''),
          start: meeting.start ? new Date(meeting.start) : new Date(),
          end: meeting.end ? new Date(meeting.end) : new Date(Date.now() + 3600000),
          status: String(meeting.status || 'scheduled')
        };
      } catch (err) {
        console.error('Error processing meeting data:', err, meeting);
        return null;
      }
    }).filter(Boolean); // Filtrăm valorile null
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
};

// Get a single meeting by ID
export const getMeeting = async (id) => {
  try {
    const response = await api.get(`/meetings/${id}`);
    
    // Validare răspuns
    if (!response || !response.data) {
      console.error('Invalid response from API:', response);
      throw new Error('Meeting not found');
    }
    
    const meeting = response.data;
    
    // Procesăm datele pentru a ne asigura că sunt în formatul corect
    return {
      id: String(meeting.id || ''),
      title: String(meeting.title || ''),
      description: String(meeting.description || ''),
      start: meeting.start ? new Date(meeting.start) : new Date(),
      end: meeting.end ? new Date(meeting.end) : new Date(Date.now() + 3600000),
      status: String(meeting.status || 'scheduled')
    };
  } catch (error) {
    console.error(`Error fetching meeting with id ${id}:`, error);
    throw error;
  }
};

// Create a new meeting
export const createMeeting = async (meetingData) => {
  try {
    // Asigurăm formatarea corectă a datelor
    const formattedData = {
      title: String(meetingData.title || ''),
      description: String(meetingData.description || ''),
      start: meetingData.start instanceof Date ? meetingData.start.toISOString() : new Date(meetingData.start).toISOString(),
      end: meetingData.end instanceof Date ? meetingData.end.toISOString() : new Date(meetingData.end).toISOString(),
      status: String(meetingData.status || 'scheduled')
    };
    
    const response = await api.post('/meetings', formattedData);
    
    // Validare răspuns
    if (!response || !response.data) {
      console.error('Invalid response from API:', response);
      throw new Error('Failed to create meeting');
    }
    
    const meeting = response.data;
    
    // Procesăm datele pentru a ne asigura că sunt în formatul corect pentru frontend
    return {
      id: String(meeting.id || ''),
      title: String(meeting.title || ''),
      description: String(meeting.description || ''),
      start: meeting.start ? new Date(meeting.start) : new Date(),
      end: meeting.end ? new Date(meeting.end) : new Date(Date.now() + 3600000),
      status: String(meeting.status || 'scheduled')
    };
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

// Update an existing meeting
export const updateMeeting = async (meetingData) => {
  try {
    // Verificăm dacă avem un ID valid
    if (!meetingData.id) {
      throw new Error('Meeting ID is required for update');
    }
    
    // Asigurăm formatarea corectă a datelor
    const formattedData = {
      title: String(meetingData.title || ''),
      description: String(meetingData.description || ''),
      start: meetingData.start instanceof Date ? meetingData.start.toISOString() : new Date(meetingData.start).toISOString(),
      end: meetingData.end instanceof Date ? meetingData.end.toISOString() : new Date(meetingData.end).toISOString(),
      status: String(meetingData.status || 'scheduled')
    };
    
    const response = await api.put(`/meetings/${meetingData.id}`, formattedData);
    
    // Validare răspuns
    if (!response || !response.data) {
      console.error('Invalid response from API:', response);
      throw new Error('Failed to update meeting');
    }
    
    const meeting = response.data;
    
    // Procesăm datele pentru a ne asigura că sunt în formatul corect pentru frontend
    return {
      id: String(meeting.id || ''),
      title: String(meeting.title || ''),
      description: String(meeting.description || ''),
      start: meeting.start ? new Date(meeting.start) : new Date(),
      end: meeting.end ? new Date(meeting.end) : new Date(Date.now() + 3600000),
      status: String(meeting.status || 'scheduled')
    };
  } catch (error) {
    console.error(`Error updating meeting with id ${meetingData.id}:`, error);
    throw error;
  }
};

// Delete a meeting
export const deleteMeeting = async (id) => {
  try {
    const response = await api.delete(`/meetings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting meeting with id ${id}:`, error);
    throw error;
  }
}; 