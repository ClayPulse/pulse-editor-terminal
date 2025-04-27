import React from "react";
import "./tailwind.css";
import config from "../pulse.config";
import TerminalPanel from "./components/terminal-panel";

export const Config = config;

export default function Main() {
  return (
    <div className="w-full h-full flex flex-col">
      <TerminalPanel />
    </div>
  );
}
