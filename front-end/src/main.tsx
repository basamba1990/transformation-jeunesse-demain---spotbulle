// frontend/src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom"; // Importer BrowserRouter
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx"; // Importer AuthProvider
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router> {/* Envelopper App avec Router */} 
      <AuthProvider> {/* Envelopper App avec AuthProvider */} 
        <App />
      </AuthProvider>
    </Router>
  </StrictMode>
);

