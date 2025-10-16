import React from "react";
import "./tailwind.css";
import TerminalPanel from "./components/terminal-panel";

export default function Main() {
  return (
    <div className="w-full h-full flex flex-col">
      <TerminalPanel />
    </div>
  );
}
