// frontend/src/Dashboard.js

import React from 'react';
import { 
  Container, Typography, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Grid, Box 
} from '@mui/material';

const SummaryCard = ({ title, value, color }) => ( /* ... (This component code is the same, no changes) ... */
  <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: color, color: '#fff' }}>
    <Typography component="h2" variant="h6" gutterBottom>{title}</Typography>
    <Typography component="p" variant="h4">{value}</Typography>
  </Paper>
);

// We now accept 'onStudentSelect' as a prop from App.js
function Dashboard({ data, onStudentSelect }) {
  
  if (!data) {
    return <Container><Typography variant="h5">Loading...</Typography></Container>;
  }

  const totalStudents = data.length;
  const highRiskStudents = data.filter(student => student.RiskPrediction === 1).length;
  const safeStudents = totalStudents - highRiskStudents;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h4" color="primary" gutterBottom>Mentor's Dashboard</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}><SummaryCard title="Total Students" value={totalStudents} color="#1976d2" /></Grid>
        <Grid item xs={12} sm={4}><SummaryCard title="High Risk Students" value={highRiskStudents} color="#d32f2f" /></Grid>
        <Grid item xs={12} sm={4}><SummaryCard title="Safe Students" value={safeStudents} color="#388e3c" /></Grid>
      </Grid>
      
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Student ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Attendance (%)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Average Marks</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Risk Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((student) => (
              <TableRow
                key={student.StudentID}
                // THIS IS THE NEW PART: The onClick event handler
                onClick={() => onStudentSelect(student.StudentID)}
                sx={{ 
                  backgroundColor: student.RiskPrediction === 1 ? '#ffebee' : 'inherit',
                  '&:hover': { backgroundColor: '#eeeeee', cursor: 'pointer' }
                }}
              >
                <TableCell>{student.StudentID}</TableCell>
                <TableCell>{student.Name}</TableCell>
                <TableCell>{student.Department}</TableCell>
                <TableCell>{student.AttendancePercentage.toFixed(2)}</TableCell>
                <TableCell>{student.AverageMarks.toFixed(2)}</TableCell>
                <TableCell>
                  <Box sx={{ color: student.RiskPrediction === 1 ? '#d32f2f' : '#388e3c', fontWeight: 'bold' }}>
                    {student.RiskPrediction === 1 ? 'High Risk' : 'Not At Risk'}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Dashboard;