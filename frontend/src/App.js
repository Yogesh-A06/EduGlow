// frontend/src/App.js

import React, { useState } from 'react';
import Onboarding from './Onboarding';
import DataUpload from './DataUpload';
import Dashboard from './Dashboard';
import StudentProfile from './StudentProfile'; // Import the new Profile page
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('onboarding');
  const [processedData, setProcessedData] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null); // To store which student was clicked

  const handleRegister = () => setCurrentPage('upload');

  const handleProcessComplete = (data) => {
    setProcessedData(data);
    setCurrentPage('dashboard');
  };

  // When a student is clicked on the dashboard
  const handleStudentSelect = (studentId) => {
    setSelectedStudentId(studentId);
    setCurrentPage('profile'); // Switch to the profile page
  };

  // To go back from profile page to dashboard
  const handleBackToDashboard = () => {
    setSelectedStudentId(null);
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'onboarding':
        return <Onboarding onRegister={handleRegister} />;
      case 'upload':
        return <DataUpload onProcessComplete={handleProcessComplete} />;
      case 'dashboard':
        // Pass the handleStudentSelect function to the Dashboard
        return <Dashboard data={processedData} onStudentSelect={handleStudentSelect} />;
      case 'profile':
        // Pass the studentId and the back function to the Profile page
        return <StudentProfile studentId={selectedStudentId} onBack={handleBackToDashboard} />;
      default:
        return <Onboarding onRegister={handleRegister} />;
    }
  };

  return <div className="App">{renderPage()}</div>;
}

export default App;