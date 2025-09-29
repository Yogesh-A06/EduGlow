// frontend/src/StudentProfile.js (Corrected Version with Graph)

import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Paper, Grid, Box, CircularProgress, Alert, Button, Divider } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


const ShapExplanation = ({ explanation }) => {
  const { base_value, shap_values, feature_names, feature_values } = explanation;
  const features = feature_names.map((name, index) => ({
    name: name.replace(/_/g, ' '), value: feature_values[index], shap: shap_values[index],
  })).sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap));
  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
        AI predicts a final risk score of <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{(base_value + features.reduce((acc, f) => acc + f.shap, 0)).toFixed(2)}</Box>
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ pl: 2, pr: 2 }}>
        {features.filter(f => Math.abs(f.shap) > 0.01).map((feature) => (
          <Grid container key={feature.name} alignItems="center" sx={{ mb: 1.5 }}>
            <Grid item xs={5}><Typography variant="body2" align="right" sx={{ fontWeight: 'bold' }}>{feature.name} = {feature.value.toFixed(2)}</Typography></Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>{feature.shap > 0 ? <ArrowForwardIcon sx={{ color: '#d32f2f' }} /> : <ArrowBackIcon sx={{ color: '#1976d2' }} />}</Grid>
            <Grid item xs={5}><Typography variant="body2" sx={{ color: feature.shap > 0 ? '#d32f2f' : '#1976d2' }}>{feature.shap > 0 ? 'Increases Risk' : 'Decreases Risk'}</Typography></Grid>
          </Grid>
        ))}
      </Box>
    </Box>
  );
};
const Metric = ({ title, value, unit = '' }) => (
    <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{value}{unit}</Typography>
    </Paper>
);


function StudentProfile({ studentId, onBack }) {
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef();

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setIsLoading(true);
        // Use the environment variable for the API URL
        const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
        const response = await fetch(`${apiUrl}/api/student-details/${studentId}`);
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

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${studentId}_report.pdf`);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 5 }}>{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="outlined" onClick={onBack}>
          &larr; Back to Dashboard
        </Button>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadPdf}>
          Download PDF
        </Button>
      </Box>

      <Paper sx={{ p: 3 }} ref={printRef}>
        <Typography variant="h4" gutterBottom>{studentData.main_data.Name}</Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          {studentData.main_data.Department} | Student ID: {studentData.main_data.StudentID}
        </Typography>

        {/* --- FIX IS HERE: The Grid for metrics was missing content --- */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}><Metric title="Attendance" value={studentData.main_data.AttendancePercentage.toFixed(2)} unit="%" /></Grid>
          <Grid item xs={12} sm={4}><Metric title="Average Marks" value={studentData.main_data.AverageMarks.toFixed(2)} /></Grid>
          <Grid item xs={12} sm={4}><Metric title="AI Predicted Risk" value={studentData.main_data.RiskPrediction === 1 ? 'High' : 'Low'} /></Grid>
        </Grid>

        <Typography variant="h5" sx={{ mb: 2 }}>Assessment Performance Trend</Typography>
        <Paper variant="outlined" sx={{ height: 300, p: 2 }}>
          {/* --- FIX IS HERE: The LineChart was missing --- */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={studentData.assessment_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="TestName" />
              <YAxis />
              <Tooltip />
              <Legend />
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