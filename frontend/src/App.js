import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';
import Landing from './pages/Landing';
import Analysis from './pages/Analysis';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import { Toaster } from './components/ui/sonner';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.title = 'TruthLens';
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/analyze" element={<Analysis />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;
