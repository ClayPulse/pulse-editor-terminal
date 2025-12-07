import { AppConfig, AppTypeEnum } from "@pulse-editor/shared-utils";
import packageJson from "./package.json" with { type: "json" };
import { preRegisteredActions } from "./pregistered-actions";

/**
 * Pulse Editor Extension Config
 *
 */
const config: AppConfig = {
  // Do not use hyphen character '-' in the id. 
  // The id should be the same as the package name in package.json.
  id: packageJson.name,
  version: packageJson.version,
  libVersion: packageJson.dependencies["@pulse-editor/shared-utils"],
  displayName: packageJson.displayName,
  description: packageJson.description,
  appType: AppTypeEnum.FileView,
  visibility: "unlisted",
  recommendedHeight: 640,
  recommendedWidth: 360,
  thumbnail: "assets/thumbnail.png",
  preRegisteredActions: Object.values(preRegisteredActions),
};

export default config;
