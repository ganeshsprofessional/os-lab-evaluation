import React, { useState } from "react";
import "./DashboardPage.css";
import CreateTestForm from "./CreateTestForm";
import ObservationForm from "./ObservationForm";

function DashboardPage() {
  const [activeForm, setActiveForm] = useState(null); // null, "test", or "observation"

  if (activeForm === "test") {
    return <CreateTestForm onBack={() => setActiveForm(null)} />;
  }
  if (activeForm === "observation") {
    return <ObservationForm onBack={() => setActiveForm(null)} />;
  }

  return (
    <div className="dashboard-root">
      {/* Fixed Top Bar */}
      <header className="dashboard-topbar">
        <h2>TEACHER DASHBOARD</h2>
      </header>
      {/* Body with two interactive boxes */}
      <div className="dashboard-body">
        <div
          className="dashboard-box test-box"
          onClick={() => setActiveForm("test")}
          tabIndex={0}
          style={{ cursor: "pointer" }}
        >
          <span>TEST</span>
        </div>
        <div
          className="dashboard-box observation-box"
          onClick={() => setActiveForm("observation")}
          tabIndex={0}
          style={{ cursor: "pointer" }}
        >
          <span>OBSERVATION</span>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
