import { Action } from "@pulse-editor/shared-utils";

export const preRegisteredActions: Record<string, Action> = {
  "example-action": {
    name: "Example action",
    description: "This is an example action.",
    parameters: {},
    returns: {
      response: {
        type: "string",
        description: "The result of the example action.",
      },
    },
  },
};
