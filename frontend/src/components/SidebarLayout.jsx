import React, { useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SchoolIcon from "@mui/icons-material/School";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "./SidebarLayout.css";

const SidebarLayout = ({ activeIndex, setActiveIndex, children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-container">
      <Sidebar
        width={collapsed ? "50px" : "80px"}
        backgroundColor="rgba(255,255,255,0.95)"
        rootStyles={{
          borderRight: "1px solid #e0e0e0",
          boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 100,
          transition: "width 0.2s"
        }}
      >
        {/* Top Menu */}
        <div>
          <Menu
            menuItemStyles={{
              button: ({ active }) => ({
                backgroundColor: active ? "#fda085" : undefined,
                color: active ? "#fff" : "#fda085",
                borderRadius: "10px",
                margin: "1.5rem 0",
                display: "flex",
                justifyContent: "center",
              }),
              icon: {
                fontSize: "2rem",
                color: "#fda085",
                transition: "color 0.2s",
              },
            }}
          >
            <MenuItem
              icon={<HomeIcon />}
              active={activeIndex === 0}
              onClick={() => setActiveIndex(0)}
              style={{ display: collapsed ? "none" : "flex" }}
            />
            <MenuItem
              icon={<DashboardIcon />}
              active={activeIndex === 1}
              onClick={() => setActiveIndex(1)}
              style={{ display: collapsed ? "none" : "flex" }}
            />
            <MenuItem
              icon={<AssessmentIcon />}
              active={activeIndex === 2}
              onClick={() => setActiveIndex(2)}
              style={{ display: collapsed ? "none" : "flex" }}
            />
            <MenuItem
              icon={<SchoolIcon />}
              active={activeIndex === 3}
              onClick={() => setActiveIndex(3)}
              style={{ display: collapsed ? "none" : "flex" }}
            />
          </Menu>
        </div>
        {/* Bottom Controls */}
        <div className="sidebar-bottom-controls">
          {/* Collapse/Expand Button */}
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ArrowForwardIosIcon /> : <ArrowBackIosNewIcon />}
          </button>
          {/* Exit Button */}
          {!collapsed && (
            <button
              className="sidebar-exit-btn"
              onClick={() => window.location.href = "/"} // Or your exit logic
              title="Get out of this module"
            >
              <ExitToAppIcon />
            </button>
          )}
        </div>
      </Sidebar>
      <main className="dashboard-main" style={{ marginLeft: collapsed ? "50px" : "80px" }}>
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;
