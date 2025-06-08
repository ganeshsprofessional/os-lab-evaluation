import React, { useState } from "react";
import TerminalModal from "./TerminalModal";
import AnimatedButton from "./AnimatedButton";
import Notification from "./Notification";
import Loader from "./Loader";
import axiosInstance from "../api/axiosInstance";
import "./observationForm.css";

const initialForm = {
  weekNumber: "",
  date: "",
  topic: "",
  description: "",
  numQuestions: "",
  questions: [{ text: "", requireTerminal: false, commands: [], enforceOrder: false }],
};

function ObservationForm({ onBack }) {
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
    if (!form.weekNumber.trim() || !form.date.trim() || !form.topic.trim() || !form.description.trim()) {
      setNotification({ show: true, type: "error", message: "All fields are required." });
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
      await axiosInstance.post("/teacher/observations", form);
      setNotification({ show: true, type: "success", message: "Observation created successfully!" });
      setForm(initialForm);
    } catch (error) {
      setNotification({ show: true, type: "error", message: "Failed to create observation." });
    }
    setLoading(false);
  };

  return (
    <div className="observation-form-root">
      <div className="observation-form-header">
        <h1 className="observation-form-title">Observation</h1>
        <AnimatedButton
          text="← Back to Dashboard"
          onClick={onBack}
          className="back-button"
        />
      </div>

      <form className="observation-form-container" onSubmit={handleSubmit}>
        <div className="form-section">
          <label className="form-label">
            <span className="label-text">WEEK NUMBER</span>
            <input
              type="number"
              name="weekNumber"
              value={form.weekNumber}
              onChange={handleChange}
              placeholder="Enter week number"
              className="form-input"
              min="1"
              required
            />
          </label>

          <label className="form-label">
            <span className="label-text">DATE</span>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="form-input"
              required
            />
          </label>

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
              placeholder="Describe the observation"
              className="form-input textarea"
              required
            />
          </label>

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
            text={loading ? <Loader /> : "Create Observation"}
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

export default ObservationForm;
