// src/components/CreateTestForm.jsx
import React, { useState } from "react";
import TerminalModal from "./TerminalModal";
import AnimatedButton from "./AnimatedButton";
import Notification from "./Notification";
import Loader from "./Loader";
import axiosInstance from "../api/axiosInstance";
import "./createTestForm.css";

const initialForm = {
  topic: "",
  description: "",
  testDate: "",
  startTime: "",
  duration: "",
  numQuestions: "",
  questions: [{ text: "", requireTerminal: false, commands: [], enforceOrder: false }],
};

function CreateTestForm({ onBack }) {
  const [form, setForm] = useState(initialForm);
  const [showModal, setShowModal] = useState(null); // which question index
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "numQuestions") {
      const num = value === "" ? "" : Math.max(1, parseInt(value) || 1);
      setForm((prev) => ({
        ...prev,
        numQuestions: value,
        questions:
          value === ""
            ? []
            : Array(num)
                .fill({})
                .map((_, i) => prev.questions[i] || { text: "", requireTerminal: false, commands: [], enforceOrder: false }),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleQuestionChange = (i, value) => {
    const questions = [...form.questions];
    questions[i].text = value;
    setForm((prev) => ({ ...prev, questions }));
  };

  const handleQuestionTerminal = (i, checked) => {
    const questions = [...form.questions];
    questions[i].requireTerminal = checked;
    setForm((prev) => ({ ...prev, questions }));
  };

  const handleCommandsUpdate = (questionIndex, commands, enforceOrder) => {
    const questions = [...form.questions];
    questions[questionIndex].commands = commands;
    questions[questionIndex].enforceOrder = enforceOrder;
    setForm((prev) => ({ ...prev, questions }));
    setShowModal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.topic.trim() || !form.description.trim()) {
      setNotification({ show: true, type: "error", message: "Topic and description are required." });
      return;
    }
    if (
      !form.questions.length ||
      form.questions.some((q) => !q.text.trim())
    ) {
      setNotification({ show: true, type: "error", message: "All questions must be filled." });
      return;
    }
    for (const q of form.questions) {
      if (q.requireTerminal && q.commands.length === 0) {
        setNotification({ show: true, type: "error", message: "Please add at least one command for each question requiring terminal tracking." });
        return;
      }
    }
    setLoading(true);
    try {
      await axiosInstance.post("/teacher/tests", form);
      setNotification({ show: true, type: "success", message: "Test created successfully!" });
      setForm(initialForm);
    } catch (error) {
      setNotification({ show: true, type: "error", message: "Failed to create test." });
    }
    setLoading(false);
  };

  return (
    <div className="test-form-root">
      <div className="test-form-header">
        <h1 className="test-form-title">Create Test</h1>
        <AnimatedButton
          text="← Back to Dashboard"
          onClick={onBack}
          className="back-button"
        />
      </div>

      <form className="test-form-container" onSubmit={handleSubmit}>
        <div className="form-section">
          <label className="form-label">
            <span className="label-text">TOPIC</span>
            <input
              type="text"
              name="topic"
              value={form.topic}
              onChange={handleChange}
              placeholder="Enter the Topic"
              className="form-input"
              required
            />
          </label>

          <label className="form-label">
            <span className="label-text">DESCRIPTION</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the test"
              className="form-input textarea"
              required
            />
          </label>

          <div className="form-row">
            <label className="form-label">
              <span className="label-text">TEST DATE</span>
              <input
                type="date"
                name="testDate"
                value={form.testDate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label className="form-label">
              <span className="label-text">START TIME</span>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="form-input"
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label className="form-label">
              <span className="label-text">TEST DURATION (MINUTES)</span>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="form-input"
                min="1"
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label className="form-label">
              <span className="label-text">NUMBER OF QUESTIONS</span>
              <input
                type="number"
                name="numQuestions"
                value={form.numQuestions}
                onChange={handleChange}
                className="form-input"
                min="1"
                required
              />
            </label>
          </div>
        </div>

        <div className="questions-section">
          {form.questions.map((q, i) => (
            <div key={i} className="question-block">
              <label className="form-label">
                <span className="label-text">QUESTION {i + 1}</span>
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => handleQuestionChange(i, e.target.value)}
                  className="form-input"
                  placeholder={`Enter question ${i + 1}`}
                  required
                />
              </label>

              <label className="terminal-checkbox">
                <input
                  type="checkbox"
                  checked={q.requireTerminal}
                  onChange={(e) => handleQuestionTerminal(i, e.target.checked)}
                />
                <span>Requires Terminal Tracking for this question</span>
              </label>

              {q.requireTerminal && (
                <div className="terminal-section">
                  <div className="command-preview">
                    <span>Tracked Commands: {q.commands.join(", ")}</span>
                    <button
                      type="button"
                      className="edit-commands-btn"
                      onClick={() => setShowModal(i)}
                    >
                      {q.commands.length ? "Edit Commands" : "Add Commands"}
                    </button>
                  </div>
                  <div className="order-info">
                    Order Enforcement: {q.enforceOrder ? "Enabled" : "Disabled"}
                  </div>
                </div>
              )}

              {showModal === i && (
                <TerminalModal
                  initialCommands={q.commands}
                  initialOrder={q.enforceOrder}
                  onClose={() => setShowModal(null)}
                  onSave={(commands, order) => handleCommandsUpdate(i, commands, order)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="form-actions">
          <AnimatedButton
            type="submit"
            text={loading ? <Loader /> : "Create Test"}
            className="submit-button"
          />
          <AnimatedButton
            type="button"
            text="Reset Form"
            onClick={() => setForm(initialForm)}
            className="reset-button"
          />
        </div>
      </form>

      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
    </div>
  );
}

export default CreateTestForm;
