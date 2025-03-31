import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationAsRead } from '../services/notificationService';
import { format } from 'date-fns'; // Importăm format în loc de formatDistanceToNow
import { enUS } from 'date-fns/locale'; // Importăm localizarea în engleză
import { useNotifications } from '../contexts/NotificationContext';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { fetchUnreadCount } = useNotifications();

    // Function to fetch notifications
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getNotifications();
            // Sort notifications descending by creation date
            setNotifications(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        } catch (err) {
            setError('Error fetching notifications.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch notifications when the component mounts
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Function to mark a notification as read
    const handleMarkAsRead = async (notificationId) => {
        try {
            // Update local state immediately for a better experience
            setNotifications(prevNotifications =>
                prevNotifications.map(n =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                )
            );
            // Call API to mark notification as read in backend
            await markNotificationAsRead(notificationId);
            
            // Actualizăm contorul global de notificări necitite
            fetchUnreadCount();
        } catch (err) {
            setError(`Error marking notification ${notificationId} as read.`);
            console.error(err);
            // Revert local state if API fails
            fetchNotifications(); // Reload to revert to correct state
        }
    };

    // Helper function to generate links (if they exist)
    const renderNotificationLink = (notification) => {
        if (notification.link_contact_id) {
            return <Link to={`/contacts/edit/${notification.link_contact_id}`} className="text-primary fw-bold">View Contact</Link>;
        }
        if (notification.link_company_id) {
            return <Link to={`/companies/edit/${notification.link_company_id}`} className="text-primary fw-bold">View Company</Link>;
        }
        if (notification.link_interaction_id) {
             // Currently, we don't have a dedicated page for a single interaction,
             // but we could add a link to the interactions page of the contact/company
             // or simply not display a specific link for the interaction
             return null; 
        }
        return null;
    };

    // Display loading state
    if (loading) {
        return <div className="d-flex justify-content-center mt-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
    }

    // Display error
    if (error) {
        return <div className="alert alert-danger mt-3">{error}</div>;
    }

    return (
        <div className="container mt-4">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
                <p className="text-muted">No new notifications.</p>
            ) : (
                <ul className="list-group">
                    {notifications.map(notification => (
                        <li 
                            key={notification.id} 
                            className={`list-group-item d-flex justify-content-between align-items-start ${!notification.is_read ? 'list-group-item-warning' : ''}`}
                        >
                            <div className="ms-2 me-auto">
                                <div className={`${!notification.is_read ? 'fw-bold' : ''}`}>{notification.message}</div>
                                <small className="text-info">
                                    {format(new Date(notification.created_at), "MMM d, yyyy, h:mm a", { locale: enUS })}
                                </small>
                                <div className="mt-1">
                                    {renderNotificationLink(notification)}
                                </div>
                            </div>
                            {!notification.is_read && (
                                <button 
                                    className="btn btn-sm btn-outline-success" 
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    title="Mark as read"
                                >
                                    <i className="fas fa-check"></i>
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationsPage;
