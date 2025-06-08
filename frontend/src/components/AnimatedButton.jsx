import React from 'react';
import '../styles/button.css';

function AnimatedButton({ type = "button", text, onClick }) {
  return (
    <button className="animated-btn" type={type} onClick={onClick}>
      {text}
    </button>
  );
}

export default AnimatedButton;
