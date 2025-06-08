import React, { useState } from "react";
import SidebarLayout from "./components/SidebarLayout";
import HomePage from "./components/HomePage";
import DashboardPage from "./components/DashboardPage";
import "./styles/main.css";

function App() {
  // 0: Home, 1: Dashboard (Test/Observation), ... (add more as needed)
  const [activeIndex, setActiveIndex] = useState(0);

  let content;
  if (activeIndex === 0) {
    content = <HomePage />;
  } else if (activeIndex === 1) {
    content = <DashboardPage />;
  } else {
    content = <div style={{ padding: "2rem" }}>Page under construction</div>;
  }

  return (
    <SidebarLayout activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
      {content}
    </SidebarLayout>
  );
}

export default App;
