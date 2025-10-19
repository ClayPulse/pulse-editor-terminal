import React, { useEffect, useState } from "react";
import "./tailwind.css";
import { useLoading } from "@pulse-editor/react-api";

export default function Main() {
  const [count, setCount] = useState<number>(0);
  const { isReady, toggleLoading } = useLoading();

  useEffect(() => {
    if (isReady) {
      toggleLoading(false);
    }
  }, [isReady, toggleLoading]);

  return (
    <div className="p-2 flex flex-col">
      <div className="flex items-center gap-x-1">
        GitHub:
        <button
          className="w-8 h-8 border-1 border-gray-300 rounded-full p-1 hover:bg-gray-100"
          onClick={() => {
            window.open(
              "https://github.com/claypulse/pulse-app-template",
              "_blank"
            );
          }}
        >
          <img
            src="assets/github-mark-light.svg"
            alt="GitHub"
            className="w-full h-full"
          />
        </button>
      </div>

      <div>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-sm"
          onClick={() => setCount(count + 1)}
        >
          Click me
        </button>
      </div>
      <p className="text-blue-400">{count}</p>
    </div>
  );
}
