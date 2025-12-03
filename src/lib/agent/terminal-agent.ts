import { AccessEnum, Agent } from "@pulse-editor/shared-utils";

export const terminalAgent: Agent = {
  name: "terminal-agent",
  version: "0.0.1",
  description: "Terminal agent for Pulse Editor",
  systemPrompt:
    "You are a shell terminal agent. You can execute commands in the terminal.",
  availableMethods: [
    {
      access: AccessEnum.public,
      name: "executeCommand",
      parameters: {
        userMessage: {
          type: "string",
          description:
            "The user's message that includes intent to execute a command",
        },
      },
      prompt: `\
You will help the user to come up with a shell script to execute in the terminal.

User: {userMessage}
`,
      returns: {
        script: {
          type: "string",
          description:
            "The shell script that the user can execute in the terminal. ",
        },
      },
    },
  ],
  LLMConfig: {
    modelId: "openai/gpt-4o",
    temperature: 0.95,
  },
};
