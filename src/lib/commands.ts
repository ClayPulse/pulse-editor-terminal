import { ExtensionCommandInfo } from "@pulse-editor/shared-utils";

export const terminalAgentCommandInfo: ExtensionCommandInfo = {
  name: "execute-command",
  description: "Execute a command in the terminal",
  parameters: {
    userMessage: {
      name: "userMessage",
      type: "string",
      description: "The user's message that includes intent to execute a command",
    },
  },
};
