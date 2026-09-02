import React from 'react';

export default function StatusBox({ type, message }) {
    if (!type || type === 'clear' || !message) return null;

    let boxClass = 'status-box';
    let icon = null;

    if (type === 'loading') {
        boxClass += ' loading';
        icon = <div className="spinner"></div>;
    } else if (type === 'empty') {
        boxClass += ' empty';
        icon = (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        );
    } else if (type === 'error') {
        boxClass += ' error';
        icon = (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        );
    } else if (type === 'success') {
        boxClass += ' success';
        icon = (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        );
    }

    return (
        <div className="status-container" aria-live="polite">
            <div className={boxClass}>
                {icon}
                <span>{message}</span>
            </div>
        </div>
    );
}
