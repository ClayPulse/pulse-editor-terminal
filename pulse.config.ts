import { ExtensionConfig, ExtensionTypeEnum } from "@pulse-editor/shared-utils";
import packageJson from "./package.json" with { type: "json" };
import { terminalAgent } from "./src/lib/agent/terminal-agent";
import { terminalAgentCommandInfo } from "./src/lib/commands";

/**
 * Pulse Editor Extension Config
 *
 */
const config: ExtensionConfig = {
  // Do not use hyphen character '-' in the id. 
  // The id should be the same as the package name in package.json.
  id: packageJson.name,
  displayName: packageJson.displayName,
  description: packageJson.description,
  version: packageJson.version,
  extensionType: ExtensionTypeEnum.ConsoleView,
  enabledPlatforms: {
    "web": true,
    "mobile": true,
    "desktop": true,
  },
  agents: [terminalAgent],
  commandsInfoList: [terminalAgentCommandInfo]
};

export default config;
