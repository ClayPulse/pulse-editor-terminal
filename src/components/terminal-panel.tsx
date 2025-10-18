import React from "react";
import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import "../lib/styles/xterm-style-override.css";
import { FitAddon } from "@xterm/addon-fit";
import {
  useAgents,
  useRegisterAction,
  useLoading,
  useTerminal,
} from "@pulse-editor/react-api";
import { preRegisteredActions } from "../../pregistered-actions";

export default function TerminalPanel() {
  const { websocketUrl, projectHomePath } = useTerminal();

  useRegisterAction(
    preRegisteredActions["terminal-agent"],
    handleWriteCommand,
    []
  );

  useRegisterAction(
    preRegisteredActions["execute-command"],
    async ({ command }: { command: string }) => {
      if (websocketRef.current) {
        const socket = websocketRef.current;
        socket.send(
          JSON.stringify({
            type: "input",
            payload: command + "\r",
          })
        );
        return {
          response: "success",
        };
      }
      return {
        response: "",
      };
    },
    [projectHomePath, websocketUrl]
  );

  const { runAgentMethod } = useAgents();

  const { toggleLoading, isReady } = useLoading();

  const terminalDivRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal>(null);
  const fitAddonRef = useRef<FitAddon>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (isReady && websocketUrl) {
      toggleLoading(false);
    }
  }, [websocketUrl, isReady]);

  // Handle WebSocket connection
  useEffect(() => {
    if (websocketUrl) {
      const terminal = new Terminal({
        fontFamily: "monospace",
        scrollOnEraseInDisplay: true,
      });
      terminalRef.current = terminal;

      // Attach WS addon
      attachWS(terminal, websocketUrl);

      // Fit addon
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      fitAddonRef.current = fitAddon;

      // Open terminal
      terminal.open(terminalDivRef.current as HTMLDivElement);
      fitAddon.fit();

      // Create a ResizeObserver instance
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === terminalDivRef.current) {
            fitAddon.fit();
          }
        }
      });

      if (terminalDivRef.current) {
        observer.observe(terminalDivRef.current);
      }

      return () => {
        terminal.dispose();
        observer.disconnect();
      };
    }
  }, [websocketUrl, projectHomePath]);

  function attachWS(terminal: Terminal, websocketUrl: string) {
    if (!websocketUrl) {
      throw new Error("No WebSocket URL provided.");
    }
    // Attach addon
    const webSocket = new WebSocket(websocketUrl);
    websocketRef.current = webSocket;
    webSocket.onopen = () => {
      console.log("WebSocket connection established.");
      // Cd to project home path and then clear the terminal
      webSocket.send(
        JSON.stringify({
          type: "input",
          payload: `cd ${projectHomePath} && clear\r`,
        })
      );
      const { cols, rows } = terminal;
      webSocket.send(
        JSON.stringify({
          type: "resize",
          payload: { cols, rows },
        })
      );
    };
    webSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "output") {
        terminal.write(message.payload);
      }
    };
    webSocket.onerror = (error) => {
      console.error("WebSocket error: ", error);
    };

    terminal.onData((data) => {
      webSocket.send(
        JSON.stringify({
          type: "input",
          payload: data,
        })
      );
    });
    terminal.onResize(({ cols, rows }) => {
      webSocket.send(
        JSON.stringify({
          type: "resize",
          payload: { cols, rows },
        })
      );
    });
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
      // script might contain multiple lines
      // split by new line and send each line separately
      const socket = websocketRef.current;
      script.split("\n").forEach((line) => {
        socket.send(line + "\r");
      });
    } else {
      console.error("Terminal not initialized");
      return "failed";
    }

    return "success";
  }

  return (
    <div
      className="h-full py-0.5 px-1 bg-black overflow-hidden"
      id="terminal"
      ref={terminalDivRef}
      onClick={() => {
        terminalRef.current?.focus();
      }}
    />
  );
}
