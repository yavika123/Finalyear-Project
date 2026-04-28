import React from "react";

export function Badge({ children, color = "blue" }) {
  return (
    <span className={`px-2 py-1 text-sm font-semibold text-white bg-${color}-500 rounded`}>
      {children}
    </span>
  );
}
