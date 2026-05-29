/**
 * Application entry point.
 *
 * In the Power Apps Code App deployment, the host runtime loads this via
 * the power.config.json manifest. During local development, Vite serves
 * this directly.
 *
 * Legacy equivalent: Program.cs (app bootstrap + DI configuration)
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
