import React, { useState, useRef } from "react";
import "../styles/modal.css";

function TerminalModal({ initialCommands = [], initialOrder = false, onClose, onSave }) {
  const [commands, setCommands] = useState(initialCommands);
  const [commandInput, setCommandInput] = useState("");
  const [enforceOrder, setEnforceOrder] = useState(initialOrder);
  const dragItem = useRef();
  const dragOverItem = useRef();

  const addCommand = () => {
    if (commandInput.trim()) {
      setCommands([...commands, commandInput.trim()]);
      setCommandInput("");
    }
  };

  const removeCommand = (index) => {
    setCommands(commands.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
    const newList = [...commands];
    const draggedItemContent = newList[dragItem.current];
    newList.splice(dragItem.current, 1);
    newList.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = dragOverItem.current;
    dragOverItem.current = null;
    setCommands(newList);
  };

  return (
    <div className="terminal-modal-bg">
      <div className="terminal-modal-content">
        <h2>Track Commands</h2>
        <div className="command-input-group">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Enter command (e.g., ls, gcc, cat)"
            className="command-input"
            onKeyDown={e => e.key === "Enter" && addCommand()}
          />
          <button className="add-command-btn" type="button" onClick={addCommand}>Add</button>
        </div>
        <ul className="command-list">
          {commands.map((cmd, i) => (
            <li
              key={i}
              className="command-item"
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              title="Drag to reorder"
            >
              <span className="drag-handle">⠿</span>
              {cmd}
              <button className="remove-btn" onClick={() => removeCommand(i)}>✕</button>
            </li>
          ))}
        </ul>
        <label className="enforce-order-checkbox">
          <input
            type="checkbox"
            checked={enforceOrder}
            onChange={e => setEnforceOrder(e.target.checked)}
          />
          Enforce Order of Commands
        </label>
        <div className="modal-actions">
          <button className="save-btn" onClick={() => onSave(commands, enforceOrder)}>Save</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default TerminalModal;
