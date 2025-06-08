import React, { useEffect, useRef } from "react";
import "./HomePage.css";
import MovieCatalogue from "./MovieCatalogue";

function HomePage() {
  // Animate the background text on scroll
  const scrollText = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      if (scrollText.current) {
        let pos = window.scrollY;
        scrollText.current.style.left = `-${pos / 2}px`;
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="oslab-home">
      {/* Animated horizontal background text */}
      <div className="scroll-text" ref={scrollText}>
        <span className="bg-text">OPERATING SYSTEM LAB</span>
      </div>

      {/* Hero Section */}
      <section className="oslab-hero">
        <div className="oslab-hero-content">
          <h1>OPERATING SYSTEM LAB</h1>
          <p>
            Welcome to the Operating System Lab! Dive into the world of process management, memory, scheduling, and more. Explore, experiment, and master the core concepts that power every computer.
          </p>
        </div>
        <div className="oslab-hero-img">
          <div className="oslab-pic" id="pic1">pic1</div>
        </div>
      </section>

      {/* Movie Catalogue Section */}
      <MovieCatalogue />

      {/* What is an Operating System */}
      <section className="oslab-section">
        <div className="oslab-section-img">
          <div className="oslab-pic" id="pic2">pic2</div>
        </div>
        <div className="oslab-section-content">
          <h2>What is an Operating System?</h2>
          <p>
            An operating system (OS) is system software that manages computer hardware, software resources, and provides common services for computer programs. It acts as an intermediary between users and the computer hardware.
          </p>
        </div>
      </section>

      {/* Core Functions */}
      <section className="oslab-section reverse">
        <div className="oslab-section-content">
          <h2>Core Functions of an OS</h2>
          <ul>
            <li>Process Management</li>
            <li>Memory Management</li>
            <li>File System Management</li>
            <li>Device Management</li>
            <li>Security and Access Control</li>
          </ul>
        </div>
        <div className="oslab-section-img">
          <div className="oslab-pic" id="pic3">pic3</div>
        </div>
      </section>

      {/* Why Study Operating Systems? */}
      <section className="oslab-section">
        <div className="oslab-section-img">
          <div className="oslab-pic" id="pic4">pic4</div>
        </div>
        <div className="oslab-section-content">
          <h2>Why Study Operating Systems?</h2>
          <p>
            Understanding operating systems is essential for computer scientists and engineers. It builds the foundation for learning about system-level programming, resource allocation, and security.
          </p>
        </div>
      </section>

      {/* Lab Activities */}
      <section className="oslab-section reverse">
        <div className="oslab-section-content">
          <h2>Lab Activities</h2>
          <p>
            In this lab, you will:
          </p>
          <ul>
            <li>Implement process scheduling algorithms</li>
            <li>Simulate memory allocation techniques</li>
            <li>Work with file systems</li>
            <li>Develop shell scripts and system utilities</li>
          </ul>
        </div>
        <div className="oslab-section-img">
          <div className="oslab-pic" id="pic5">pic5</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="oslab-footer">
        <p>© {new Date().getFullYear()} Operating System Lab. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
