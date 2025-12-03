import React, { useState } from "react";
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
  const [ws, setWs] = useState<string | undefined>(undefined);
  const [loadWSPromise, setLoadWSPromise] = useState<
    | {
        resolve: (value: unknown) => void;
        reject: (reason?: unknown) => void;
      }
    | undefined
  >(undefined);

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
    [projectHomePath, ws]
  );

  useRegisterAction(
    preRegisteredActions["remote-terminal"],
    async ({ websocketUrl }: { websocketUrl: string }) => {
      setWs(() => websocketUrl);
      return new Promise((resolve, reject) => {
        setLoadWSPromise(() => ({
          resolve,
          reject,
        }));
      });
    },
    []
  );

  const { runAgentMethod } = useAgents();
  const { toggleLoading, isReady } = useLoading();

  const [isWebsocketAvailable, setIsWebsocketAvailable] = useState(false);

  const terminalDivRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal>(null);
  const fitAddonRef = useRef<FitAddon>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (isReady) {
      toggleLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    if (websocketUrl) {
      setWs(websocketUrl);
    }
  }, [websocketUrl]);

  // Handle WebSocket connection
  useEffect(() => {
    if (ws) {
      try {
        const terminal = new Terminal({
          fontFamily: "monospace",
          scrollOnEraseInDisplay: true,
        });
        terminalRef.current = terminal;

        // Attach WS addon
        attachWS(terminal, ws);

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
        observerRef.current = observer;

        if (terminalDivRef.current) {
          observer.observe(terminalDivRef.current);
        }

        if (loadWSPromise) {
          loadWSPromise.resolve("Terminal connected");
        }

        setIsWebsocketAvailable(true);
      } catch (error) {
        console.error("Failed to attach WebSocket to terminal:", error);
        if (loadWSPromise) {
          loadWSPromise.reject(new Error("Failed to connect to WebSocket"));
        }
      }

      return () => {
        terminalRef.current?.dispose();
        observerRef.current?.disconnect();
        if (reconnectTimeoutRef.current)
          clearTimeout(reconnectTimeoutRef.current);
        websocketRef.current?.close();
      };
    }
  }, [ws, projectHomePath]);

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isReconnectionRef = useRef(false);

  function scheduleReconnect(terminal: Terminal, wsUrl: string) {
    // Exponential backoff with a cap
    const delay = Math.min(5000, 1000 * 2 ** reconnectAttemptsRef.current);
    console.log(`Attempting to reconnect in ${delay / 1000}s...`);

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current += 1;
      attachWS(terminal, wsUrl);
    }, delay);
  }

  function attachWS(terminal: Terminal, ws: string) {
    if (!ws) {
      throw new Error("No WebSocket URL provided.");
    }

    // Clear previous reconnect timer
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

    // Attach addon
    const webSocket = new WebSocket(ws);
    websocketRef.current = webSocket;
    webSocket.onopen = () => {
      // Run only if this is opened for the first time
      // Cd to project home path and then clear the terminal
      if (!isReconnectionRef.current) {
        console.log("WebSocket connection established.");
        webSocket.send(
          JSON.stringify({
            type: "input",
            payload: `cd ${projectHomePath} && clear\r`,
          })
        );
      } else {
        console.log("WebSocket reconnected.");
        reconnectAttemptsRef.current = 0;
      }

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
    webSocket.onclose = (event) => {
      console.warn("⚠️ WebSocket closed:", event.reason || event.code);
      if (!event.wasClean) {
        isReconnectionRef.current = true;
        scheduleReconnect(terminal, ws);
      } else {
        console.log("WebSocket connection closed cleanly.");
        isReconnectionRef.current = false;
      }
    };

    terminal.onData((data) => {
      if (webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(
          JSON.stringify({
            type: "input",
            payload: data,
          })
        );
      }
    });

    terminal.onResize(({ cols, rows }) => {
      if (webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(
          JSON.stringify({
            type: "resize",
            payload: { cols, rows },
          })
        );
      }
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
    <>
      <div
        className="h-full py-0.5 px-1 bg-black overflow-hidden hidden data-[is-loaded=true]:block"
        id="terminal"
        ref={terminalDivRef}
        onClick={() => {
          terminalRef.current?.focus();
        }}
        data-is-loaded={isWebsocketAvailable}
      />

      {!isWebsocketAvailable &&
        (ws ? (
          <div className="bg-black h-full">
            <p className="text-white p-4">Loading terminal </p>
          </div>
        ) : (
          <div className="bg-black h-full">
            <p className="text-white p-4">No terminal is connected.</p>
          </div>
        ))}
    </>
  );
}
