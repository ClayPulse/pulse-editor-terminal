import React from "react";
import { useEffect, useRef } from "react";

import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import "../styles/xterm-style-override.css";

import { FitAddon } from "@xterm/addon-fit";
import { AttachAddon } from "@xterm/addon-attach";

export default function TerminalPanel() {
  const terminalDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function promptUser() {
      terminal.write("$ ");
    }

    const terminal = new Terminal({
      theme: {},
      rows: 0,
    });
    // Fit addon
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    // Attach addon
    const webSocket = new WebSocket(
      "ws://localhost:2375/containers/a09dc305ba40836433ef55a89122b41a68573cc389b678b08d498b981da54ffe/attach/ws?stream=true&logs=true&stdin=true&stdout=true&stderr=true"
    );
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

    // Open terminal
    terminal.open(terminalDivRef.current as HTMLDivElement);
    fitAddon.fit();

    // Print welcome message
    terminal.write("Welcome to Pulse Terminal!\r\n");
    promptUser();

    // Handle terminal input
    // terminal.onData((data) => {
    //   terminal.write(data);
    // });

    // Handle attach data

    // // // Handle terminal key events
    // terminal.onKey((e) => {
    //   // Handle Enter key
    //   if (e.domEvent.key === "Enter") {
    //     // Input handling here
    //     terminal.input("\r\n$ ");
    //     return;
    //   }
    //   // Handle Backspace key
    //   else if (e.domEvent.key === "Backspace") {
    //     terminal.write("\b \b");
    //     return;
    //   }
    // });

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
  }, []);

  return (
    <div
      className="h-full overflow-hidden bg-black"
      id="terminal"
      ref={terminalDivRef}
    ></div>
  );
}
