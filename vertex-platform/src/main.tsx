import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './utils/i18n';
import './styles/globals.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root container #root not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
