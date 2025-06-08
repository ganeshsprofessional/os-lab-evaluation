import React, { useRef } from "react";
import "./MovieCatalogue.css";

const osConcepts = [
  { title: "Process Management", description: "Handles creation, scheduling, and termination of processes.", img: "pic1" },
  { title: "Memory Management", description: "Allocates and manages RAM for programs and processes.", img: "pic2" },
  { title: "File Systems", description: "Organizes and stores files, manages access and permissions.", img: "pic3" },
  { title: "Device Management", description: "Controls and coordinates input/output devices.", img: "pic4" },
  { title: "Security & Protection", description: "Safeguards data and resources from unauthorized access.", img: "pic5" },
  { title: "User Interface", description: "Provides ways for users to interact with the system.", img: "pic6" },
  { title: "Networking", description: "Manages communication between devices and networks.", img: "pic7" },
  // Add more OS concepts as needed
];

function MovieCatalogue() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "right" ? 320 : -320,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="catalogue-section">
      <h2 className="catalogue-title">Key Concepts of Operating Systems</h2>
      <div className="catalogue-container">
        <button className="arrow left" onClick={() => scroll("left")}>{"<-"}</button>
        <div className="catalogue-scroll" ref={scrollRef}>
          {osConcepts.map((concept, idx) => (
            <div className="movie-card" key={idx}>
              <div className="movie-img">{concept.img}</div>
              <div className="movie-info">
                <h3>{concept.title}</h3>
                <p>{concept.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="arrow right" onClick={() => scroll("right")}>{"->"}</button>
      </div>
    </section>
  );
}

export default MovieCatalogue;
