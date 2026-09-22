import React from 'react';
import ReactDOM from 'react-dom/client';
import { TempUserProvider } from './context/TempUserContext';
import { DynamicThemeProvider } from './components/theme/DynamicThemeProvider';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TempUserProvider>
      <DynamicThemeProvider>
        <App />
      </DynamicThemeProvider>
    </TempUserProvider>
  </React.StrictMode>
);
