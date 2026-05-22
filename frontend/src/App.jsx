import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DeploymentDetails from './pages/DeploymentDetails';
import History from './pages/History';

/**
 * App — root component with routing.
 * Three routes: Dashboard, Deployment Details, and History.
 */
function App() {
  return (
    <BrowserRouter>
      {/* Persistent top navigation bar */}
      <Navbar />

      {/* Page routes */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/deployment/:id" element={<DeploymentDetails />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
