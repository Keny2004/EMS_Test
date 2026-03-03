import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import BatteryStatus from './components/BatteryStatus';
import DataExport from './components/DataExport';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Navigation><Dashboard /></Navigation>} />
        <Route path="/battery-status" element={<Navigation><BatteryStatus /></Navigation>} />
        <Route path="/export" element={<Navigation><DataExport /></Navigation>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;