import { Action } from "@pulse-editor/shared-utils";

export const preRegisteredActions: Record<string, Action> = {
  "terminal-agent": {
    name: "Chat with Terminal Agent",
    description:
      "Engage in a conversation with the terminal agent to execute commands and retrieve outputs from the terminal environment.",
    parameters: {
      userMessage: {
        type: "string",
        description:
          "The user's message that includes intent to execute a command",
      },
    },
    returns: {
      response: {
        type: "string",
        description: "The result of the command execution.",
      },
    },
  },

  "execute-command": {
    name: "Execute Command in Terminal",
    description: "Execute a command in the terminal environment.",
    parameters: {
      command: {
        type: "string",
        description: "The command to be executed in the terminal.",
      },
    },
    returns: {
      response: {
        type: "string",
        description: "The output from the executed command.",
      },
    },
  },
  "remote-terminal": {
    name: "Open a remote terminal",
    description: "Open a remote terminal via web socket",
    parameters: {
      websocketUrl: {
        type: "string",
        description: "The WebSocket URL to connect to the remote terminal.",
      },
    },
    returns: {},
  },
};
