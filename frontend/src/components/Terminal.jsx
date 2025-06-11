import React, { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import "xterm/css/xterm.css";
import styles from "./Terminal.module.css";
import axios from "../api/axiosInstance";

const Terminal = () => {
  let [questionsToTrack, setQuestionsToTrack] = useState([]);
  const [userId, setUserId] = useState(null);
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const socketRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [progressQuestion, setProgressQuestion] = useState([]);

  useEffect(() => {
    const getQuestions = async () => {
      const response = await axios.get("/questions");
      setQuestionsToTrack(response.data);
    };
    getQuestions();
  }, []);

  useEffect(() => {
    if (!userId) {
      const id = prompt("Enter your user ID:");
      if (id) {
        setUserId(id);
      }
      return;
    }
    const xterm = new XTerm({
      cursorBlink: true,
      theme: {
        background: "#1a1a1a",
        foreground: "#ffffff",
      },
    });

    xterm.open(terminalRef.current);
    xterm.focus();
    xtermRef.current = xterm;

    const socket = new WebSocket(
      `ws://localhost:3001/ws?userId=${encodeURIComponent(userId)}`
    );
    socketRef.current = socket;

    socket.onopen = () => {
      xterm.write("Connected to secure terminal...\r\n");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "output") {
          xterm.write(data.data.toString());
        } else if (data.type === "progress") {
          setProgress(((data.matched.length * 100) / data.total).toFixed(2));
        } else if (data.type === "matched") {
          setProgressQuestion((prev) => {
            console.log(prev);
            return [...prev, data.question];
          });
        }
      } catch (err) {
        // xterm.write(event.data);
      }
    };

    xterm.onData((data) => {
      socket.send(JSON.stringify({ type: "input", data }));
    });

    return () => {
      socket.close();
      xterm.dispose();
    };
  }, [userId]);

  return (
    <div className={styles.container}>
      <div ref={terminalRef} className={styles.terminalBox} />
      <div className={styles.progressWrapper}>
        <div className={styles.progressLabel}>Progress: {progress}%</div>
        <div className={styles.progressBarBackground}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className={styles.progress}>
          <ul>
            {questionsToTrack.map((qs) => (
              <li
                key={qs}
                className={progressQuestion.includes(qs) ? styles.done : ""}
              >
                {qs}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
