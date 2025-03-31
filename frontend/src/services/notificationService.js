import axios from 'axios';

const API_BASE_URL = '/api'; // Sau adresa completă dacă backend-ul rulează pe alt port/domeniu în dezvoltare

/**
 * Preia toate notificările de la backend.
 * @returns {Promise<Array>} O promisiune care rezolvă cu un array de obiecte notificare.
 */
export const getNotifications = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/notifications`);
        return response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error.response?.data || error.message);
        // Poți arunca eroarea mai departe sau returna un array gol/null pentru a o trata în componentă
        throw error; 
    }
};

/**
 * Marchează o notificare specifică drept citită.
 * @param {number} notificationId - ID-ul notificării de marcat.
 * @returns {Promise<Object>} O promisiune care rezolvă cu obiectul notificare actualizat.
 */
export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`);
        return response.data;
    } catch (error) {
        console.error(`Error marking notification ${notificationId} as read:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Calculează numărul de notificări necitite.
 * @returns {Promise<number>} O promisiune care rezolvă cu numărul de notificări necitite.
 */
export const getUnreadNotificationsCount = async () => {
    try {
        const notifications = await getNotifications();
        return notifications.filter(notification => !notification.is_read).length;
    } catch (error) {
        console.error("Error counting unread notifications:", error);
        // În caz de eroare, returnăm 0 în loc să aruncăm eroarea mai departe
        return 0;
    }
};