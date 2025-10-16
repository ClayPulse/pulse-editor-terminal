import { Action } from "@pulse-editor/shared-utils";

export const preRegisteredActions: Record<string, Action> = {
  "execute-command": {
    name: "Execute Command",
    description: "Execute a command in the terminal",
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
};
