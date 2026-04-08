import { createRoot } from 'react-dom/client'
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import { ThemeProvider } from "./context/ThemeContext";
import './index.css'
import App from './App.tsx'

const msalInstance = new PublicClientApplication(msalConfig);

// MSAL.js 3.0 requires initialize() to be called before use
msalInstance.initialize().then(() => {
  createRoot(document.getElementById('root')!).render(
    <MsalProvider instance={msalInstance}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </MsalProvider>
  );
}).catch(err => {
  console.error("MSAL Initialization failed:", err);
});

