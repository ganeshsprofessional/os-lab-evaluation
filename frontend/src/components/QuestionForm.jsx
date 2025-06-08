import React, { useState } from 'react';
import TerminalModal from './TerminalModal';
import AnimatedButton from './AnimatedButton';
import Notification from './Notification';
import Loader from './Loader';
import axiosInstance from '../api/axiosInstance';
import '../styles/form.css';

const initialForm = {
  title: '',
  description: '',
  requireTerminal: false,
  commands: [],
  enforceOrder: false,
};

function QuestionForm() {
  const [form, setForm] = useState(initialForm);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleTerminalCheck = (e) => {
    setForm({ ...form, requireTerminal: e.target.checked });
    if (e.target.checked) setShowModal(true);
    else setForm({ ...form, commands: [] });
  };

  const handleCommandsUpdate = (commands, enforceOrder) => {
    setForm({ ...form, commands, enforceOrder });
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!form.title.trim() || !form.description.trim()) {
      setNotification({ show: true, type: 'error', message: 'Title and description are required.' });
      return;
    }
    if (form.requireTerminal && form.commands.length === 0) {
      setNotification({ show: true, type: 'error', message: 'Please add at least one command.' });
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/teacher/questions', form);
      setNotification({ show: true, type: 'success', message: 'Question posted successfully!' });
      setForm(initialForm);
    } catch (error) {
      setNotification({ show: true, type: 'error', message: 'Failed to post question.' });
    }
    setLoading(false);
  };

  return (
    <form className="question-form" onSubmit={handleSubmit}>
      <label>
        Question Title:
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter question title"
          required
        />
      </label>
      <label>
        Question Description:
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the question in detail"
          required
        />
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          name="requireTerminal"
          checked={form.requireTerminal}
          onChange={handleTerminalCheck}
        />
        Requires Terminal Tracking?
      </label>
      {form.requireTerminal && (
        <div className="command-list-preview">
          <strong>Commands to Track:</strong>
          <ul>
            {form.commands.map((cmd, i) => <li key={i}>{cmd}</li>)}
          </ul>
          <span>Order Enforced: {form.enforceOrder ? 'Yes' : 'No'}</span>
          <button type="button" className="edit-btn" onClick={() => setShowModal(true)}>
            Edit Commands
          </button>
        </div>
      )}
      <div className="form-actions">
        <AnimatedButton type="submit" text={loading ? <Loader /> : "Post Question"} />
        <AnimatedButton type="button" text="Reset" onClick={() => setForm(initialForm)} />
      </div>
      {showModal && (
        <TerminalModal
          initialCommands={form.commands}
          initialOrder={form.enforceOrder}
          onClose={() => setShowModal(false)}
          onSave={handleCommandsUpdate}
        />
      )}
      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
    </form>
  );
}

export default QuestionForm;
