import React from 'react';
import '../styles/modal.css';

function Notification({ type, message, onClose }) {
  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>✕</button>
    </div>
  );
}

export default Notification;
