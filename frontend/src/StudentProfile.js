// frontend/src/StudentProfile.js (Final Polished Version)

import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Grid, Box, CircularProgress, Alert, Button, Divider } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// --- Polished SHAP Explanation Component ---
const ShapExplanation = ({ explanation }) => {
  const { base_value, shap_values, feature_names, feature_values } = explanation;

  const features = feature_names.map((name, index) => ({
    name: name.replace(/_/g, ' '),
    value: feature_values[index],
    shap: shap_values[index],
  })).sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap)); // Sort by impact

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
        AI predicts a final risk score of <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{(base_value + features.reduce((acc, f) => acc + f.shap, 0)).toFixed(2)}</Box>
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ pl: 2, pr: 2 }}>
        {features.filter(f => Math.abs(f.shap) > 0.01).map((feature) => ( // Show only impactful features
          <Grid container key={feature.name} alignItems="center" sx={{ mb: 1.5 }}>
            <Grid item xs={5}>
              <Typography variant="body2" align="right" sx={{ fontWeight: 'bold' }}>
                {feature.name} = {feature.value.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>
              {feature.shap > 0 ? 
                <ArrowForwardIcon sx={{ color: '#d32f2f' }} /> : 
                <ArrowBackIcon sx={{ color: '#1976d2' }} />}
            </Grid>
            <Grid item xs={5}>
              <Typography variant="body2" sx={{ color: feature.shap > 0 ? '#d32f2f' : '#1976d2' }}>
                {feature.shap > 0 ? 'Increases Risk' : 'Decreases Risk'}
              </Typography>
            </Grid>
          </Grid>
        ))}
      </Box>
    </Box>
  );
};


function StudentProfile({ studentId, onBack }) {
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentDetails = async () => {
      // ...(fetch logic remains the same)...
      try {
        setIsLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/api/student-details/${studentId}`);
        if (!response.ok) throw new Error('Student data could not be fetched.');
        const result = await response.json();
        setStudentData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudentDetails();
  }, [studentId]);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 5 }}>{error}</Alert>;

  const Metric = ({ title, value, unit = '' }) => (/* ... (Metric component is the same) ... */
    <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{value}{unit}</Typography>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button variant="outlined" onClick={onBack} sx={{ mb: 2 }}>&larr; Back to Dashboard</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>{studentData.main_data.Name}</Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          {studentData.main_data.Department} | Student ID: {studentData.main_data.StudentID}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* ...(Grid for metrics is the same)... */}
          <Grid item xs={12} sm={4}><Metric title="Attendance" value={studentData.main_data.AttendancePercentage.toFixed(2)} unit="%" /></Grid>
          <Grid item xs={12} sm={4}><Metric title="Average Marks" value={studentData.main_data.AverageMarks.toFixed(2)} /></Grid>
          <Grid item xs={12} sm={4}><Metric title="AI Predicted Risk" value={studentData.main_data.RiskPrediction === 1 ? 'High' : 'Low'} /></Grid>
        </Grid>

        <Typography variant="h5" sx={{ mb: 2 }}>Assessment Performance Trend</Typography>
        <Paper variant="outlined" sx={{ height: 300, p: 2 }}>
            {/* ...(LineChart component is the same)... */}
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={studentData.assessment_trend}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="TestName" /><YAxis /><Tooltip /><Legend />
              <Line type="monotone" dataKey="MarksObtained" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>AI Risk Explanation</Typography>
        <Paper variant="outlined" sx={{ p: 3, backgroundColor: '#fdfdfd' }}>
           <ShapExplanation explanation={studentData.shap_explanation} />
        </Paper>
      </Paper>
    </Container>
  );
}

export default StudentProfile;