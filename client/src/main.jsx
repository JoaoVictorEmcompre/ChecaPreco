import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/react";

Sentry.init({
  dsn: "https://6ca5482f9d9e34e42b416d957c608082@o4509803577147392.ingest.us.sentry.io/4509803577999360",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  enableLogs: true
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
