/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FormPage from './pages/FormPage';
import PresentationPage from './pages/PresentationPage';
import { Sidebar } from './components/Sidebar';
import { DiagnosticoProvider } from './contexts/DiagnosticoContext';

function DiagnosticoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DiagnosticoProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main className="diagnostico-main flex-1 min-w-0">
          {children}
        </main>
      </div>
    </DiagnosticoProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route
          path="/diagnostico/:slug"
          element={
            <DiagnosticoLayout>
              <PresentationPage />
            </DiagnosticoLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
