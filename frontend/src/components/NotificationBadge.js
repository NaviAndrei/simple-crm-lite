import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationBadge = () => {
    const { unreadCount, loading } = useNotifications();

    return (
        <Link to="/notifications" className="position-relative nav-link">
            <i className="fas fa-bell"></i>
            {!loading && unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadCount > 99 ? '99+' : unreadCount}
                    <span className="visually-hidden">notificări necitite</span>
                </span>
            )}
        </Link>
    );
};

export default NotificationBadge; 