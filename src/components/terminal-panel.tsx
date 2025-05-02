import React from "react";
import { useEffect, useRef } from "react";

import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import "../styles/xterm-style-override.css";

import { FitAddon } from "@xterm/addon-fit";
import { AttachAddon } from "@xterm/addon-attach";
import { useTerminal } from "@pulse-editor/react-api";

export default function TerminalPanel() {
  const terminalDivRef = useRef<HTMLDivElement>(null);
  const { websocketUrl } = useTerminal();

  // Handle WebSocket connection
  useEffect(() => {
    console.log("WebSocket URL: ", websocketUrl);
    if (websocketUrl) {
      const terminal = new Terminal({
        theme: {},
        rows: 0,
      });
      // Fit addon
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);

      addWSAttachAddon(terminal, websocketUrl);

      // Open terminal
      terminal.open(terminalDivRef.current as HTMLDivElement);
      fitAddon.fit();

      // Print welcome message
      terminal.write("Welcome to Pulse Terminal!\r\n");

      // Re-fit terminal on window resize
      window.addEventListener("resize", () => {
        fitAddon.fit();
      });

      return () => {
        terminal.dispose();
        window.removeEventListener("resize", () => {
          fitAddon.fit();
        });
      };
    }
  }, [websocketUrl]);

  function addWSAttachAddon(terminal: Terminal, websocketUrl: string) {
    if (!websocketUrl) {
      throw new Error("No WebSocket URL provided.");
    }
    // Attach addon
    const webSocket = new WebSocket(websocketUrl);
    webSocket.onopen = () => {
      console.log("WebSocket connection established.");
    };
    webSocket.onmessage = (event) => {
      console.log(event);
    };
    webSocket.onerror = (error) => {
      console.error("WebSocket error: ", error);
    };

    const attachAddon = new AttachAddon(webSocket, {
      bidirectional: true,
    });
    terminal.loadAddon(attachAddon);
  }

  return (
    <div
      className="h-full overflow-hidden bg-black"
      id="terminal"
      ref={terminalDivRef}
    ></div>
  );
}
