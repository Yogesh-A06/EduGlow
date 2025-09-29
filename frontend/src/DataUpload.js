// frontend/src/DataUpload.js

import React, { useState } from 'react';
import { Container, Typography, Button, Box, Paper, Stack, CircularProgress, Alert } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// We now accept 'onProcessComplete' as a prop from App.js
function DataUpload({ onProcessComplete }) {
  // State to hold the selected files
  const [files, setFiles] = useState({
    students: null,
    attendance: null,
    assessments: null,
    fees: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event, fileType) => {
    setFiles({ ...files, [fileType]: event.target.files[0] });
  };

  const handleSubmit = async () => {
    // Check if all files are selected
    if (!files.students || !files.attendance || !files.assessments || !files.fees) {
      setError('Please upload all 4 CSV files.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Use FormData to send files to the backend
    const formData = new FormData();
    formData.append('students_file', files.students);
    formData.append('attendance_file', files.attendance);
    formData.append('assessments_file', files.assessments);
    formData.append('fees_file', files.fees);

    try {
      // The API call to our FastAPI backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/process-files/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Something went wrong with the server.');
      }

      const result = await response.json();
      
      // Send the processed data back to App.js
      onProcessComplete(result.data);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <Typography component="h1" variant="h4" gutterBottom>
          Upload Student Data
        </Typography>

        <Stack spacing={2} sx={{ width: '80%', mt: 3 }}>
          {/* We add a file name display next to each button */}
          <Button variant="outlined" component="label" fullWidth startIcon={<UploadFileIcon />}>
            Students File: {files.students ? files.students.name : '(.csv)'}
            <input type="file" hidden accept=".csv" onChange={(e) => handleFileChange(e, 'students')} />
          </Button>
          {/* ... (similar buttons for other files) ... */}
          <Button variant="outlined" component="label" fullWidth startIcon={<UploadFileIcon />}>
            Attendance File: {files.attendance ? files.attendance.name : '(.csv)'}
            <input type="file" hidden accept=".csv" onChange={(e) => handleFileChange(e, 'attendance')} />
          </Button>
          <Button variant="outlined" component="label" fullWidth startIcon={<UploadFileIcon />}>
            Assessments File: {files.assessments ? files.assessments.name : '(.csv)'}
            <input type="file" hidden accept=".csv" onChange={(e) => handleFileChange(e, 'assessments')} />
          </Button>
          <Button variant="outlined" component="label" fullWidth startIcon={<UploadFileIcon />}>
            Fees File: {files.fees ? files.fees.name : '(.csv)'}
            <input type="file" hidden accept=".csv" onChange={(e) => handleFileChange(e, 'fees')} />
          </Button>
        </Stack>
        
        <Box sx={{ width: '80%', mt: 4 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Button
              onClick={handleSubmit}
              fullWidth
              variant="contained"
              sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              Process Data & Generate Insights
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2, width: '80%' }}>{error}</Alert>}
      </Paper>
    </Container>
  );
}

export default DataUpload;