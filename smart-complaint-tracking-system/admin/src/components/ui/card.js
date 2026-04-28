import React from "react";

export function Card({ children }) {
  return <div className="rounded-lg shadow-md bg-white p-4">{children}</div>;
}

export function CardContent({ children }) {
  return <div className="mt-2">{children}</div>;
}
