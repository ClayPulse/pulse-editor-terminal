import React from "react";
import { useEffect, useRef } from "react";

import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import "../styles/xterm-style-override.css";

import { FitAddon } from "@xterm/addon-fit";
import { AttachAddon } from "@xterm/addon-attach";
import { useAgents, useExtCommand, useTerminal } from "@pulse-editor/react-api";
import { terminalAgentCommandInfo } from "../lib/commands";

export default function TerminalPanel() {
  const terminalDivRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal>(null);
  const { websocketUrl, projectHomePath } = useTerminal();
  const websocketRef = useRef<WebSocket | null>(null);

  const { updateHandler } = useExtCommand(terminalAgentCommandInfo);

  const { runAgentMethod } = useAgents();

  // Handle WebSocket connection
  useEffect(() => {
    console.log("WebSocket URL: ", websocketUrl);
    if (websocketUrl) {
      const terminal = new Terminal({
        theme: {},
        rows: 0,
        fontFamily: "monospace",
      });
      terminalRef.current = terminal;

      // Fit addon
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);

      addWSAttachAddon(terminal, websocketUrl);

      // Open terminal
      terminal.open(terminalDivRef.current as HTMLDivElement);
      fitAddon.fit();

      // Re-fit terminal on window resize
      window.addEventListener("resize", () => {
        fitAddon.fit();
      });

      // Update command handlers
      updateHandler(handleWriteCommand);

      return () => {
        terminal.dispose();
        window.removeEventListener("resize", () => {
          fitAddon.fit();
        });
      };
    }
  }, [websocketUrl, projectHomePath]);

  function addWSAttachAddon(terminal: Terminal, websocketUrl: string) {
    if (!websocketUrl) {
      throw new Error("No WebSocket URL provided.");
    }
    // Attach addon
    const webSocket = new WebSocket(websocketUrl);
    websocketRef.current = webSocket;
    webSocket.onopen = () => {
      console.log("WebSocket connection established.");
      // Cd to project home path and then clear the terminal
      webSocket.send(`cd ${projectHomePath} && clear\r`);
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

  async function handleWriteCommand({ userMessage }: { userMessage: string }) {
    const { script }: { script: string } = await runAgentMethod(
      "terminal-agent",
      "executeCommand",
      {
        userMessage,
      }
    );

    if (websocketRef.current) {
      websocketRef.current.send(script + "\r");
    } else {
      console.error("Terminal not initialized");
      return "failed";
    }

    return "success";
  }

  return (
    <div
      className="h-full overflow-hidden bg-black pt-0.5 px-1"
      id="terminal"
      ref={terminalDivRef}
      onClick={() => {
        terminalRef.current?.focus();
      }}
    ></div>
  );
}
