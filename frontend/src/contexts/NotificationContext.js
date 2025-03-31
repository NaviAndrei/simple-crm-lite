import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getUnreadNotificationsCount } from '../services/notificationService';

// Creăm contextul pentru notificări
const NotificationContext = createContext();

// Hook pentru a facilita utilizarea contextului
export const useNotifications = () => useContext(NotificationContext);

// Provider pentru context
export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Funcție pentru a obține numărul de notificări necitite
    const fetchUnreadCount = useCallback(async () => {
        try {
            setLoading(true);
            const count = await getUnreadNotificationsCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread notifications count:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Funcție pentru a actualiza manual contorul
    const updateUnreadCount = (newCount) => {
        setUnreadCount(newCount);
    };

    // Inițial obținem datele la încărcarea componentului
    useEffect(() => {
        fetchUnreadCount();

        // Setăm un interval pentru a actualiza contorul periodic
        const intervalId = setInterval(fetchUnreadCount, 60000); // Actualizează la fiecare minut

        // Curățăm intervalul
        return () => clearInterval(intervalId);
    }, [fetchUnreadCount]);

    // Valorile și funcțiile expuse prin context
    const value = {
        unreadCount,
        loading,
        fetchUnreadCount,
        updateUnreadCount
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext; 