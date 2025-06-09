import React, { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import "xterm/css/xterm.css";
import styles from "./Terminal.module.css";

const Terminal = () => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const socketRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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

    const socket = new WebSocket("ws://localhost:3001/ws");
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
  }, []);

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
      </div>
    </div>
  );
};

export default Terminal;
