// frontend/src/Dashboard.js

import React, { useState, useMemo } from 'react';
import {
  Container, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Grid, Box,
  TextField, Select, MenuItem, FormControl, InputLabel, Button,
  Menu,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

// NEW IMPORTS
// NEW, CORRECT WAY
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- Change this line // The table plugin
import * as XLSX from 'xlsx'; // For Excel export

const SummaryCard = ({ title, value, color }) => (
  <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: color, color: '#fff', height: '100%' }}>
    <Typography component="h2" variant="h6" gutterBottom>{title}</Typography>
    <Typography component="p" variant="h4">{value}</Typography>
  </Paper>
);

function Dashboard({ data = [], onStudentSelect }) {
  const [nameFilter, setNameFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  // State for the download menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const filteredData = useMemo(() => {
    return data.filter(student => {
      const nameMatch = student.Name.toLowerCase().includes(nameFilter.toLowerCase());
      const departmentMatch = departmentFilter === 'All' || student.Department === departmentFilter;
      const riskMatch = riskFilter === 'All' ||
                        (riskFilter === 'High Risk' && student.RiskPrediction === 1) ||
                        (riskFilter === 'Not At Risk' && student.RiskPrediction === 0);
      return nameMatch && departmentMatch && riskMatch;
    });
  }, [data, nameFilter, departmentFilter, riskFilter]);

  if (!data || data.length === 0) {
    return <Container><Typography variant="h5" sx={{ mt: 5 }}>Dashboard is empty. Please process data first.</Typography></Container>;
  }

  const totalStudents = filteredData.length;
  const highRiskStudents = filteredData.filter(student => student.RiskPrediction === 1).length;
  const safeStudents = totalStudents - highRiskStudents;

  // --- Download Menu Handlers ---
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const tableHeaders = ['StudentID', 'Name', 'Department', 'Attendance Percentage', 'Average Marks', 'Risk Status'];
  const tableData = filteredData.map(student => ({
    StudentID: student.StudentID,
    Name: student.Name,
    Department: student.Department,
    AttendancePercentage: student.AttendancePercentage.toFixed(2),
    AverageMarks: student.AverageMarks.toFixed(2),
    RiskStatus: student.RiskPrediction === 1 ? 'High Risk' : 'Not At Risk'
  }));
  
  const handleDownload = (format) => {
    handleMenuClose();
    if (format === 'csv') {
      const csvRows = [
        tableHeaders.join(','),
        ...tableData.map(row => Object.values(row).join(','))
      ];
      const csvString = csvRows.join('\n');
      downloadFile(new Blob([csvString], { type: 'text/csv' }), 'student_risk_data.csv');
    }
    else if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(tableData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      XLSX.writeFile(workbook, "student_risk_data.xlsx");
    }
    // NEW, CORRECT WAY
else if (format === 'pdf') {
  const doc = new jsPDF();
  // Call autoTable as a function and pass 'doc' to it
  autoTable(doc, { 
    head: [tableHeaders],
    body: tableData.map(row => Object.values(row)),
  });
  doc.save('student_risk_data.pdf');
}
  };

  const downloadFile = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const departments = ['All', ...new Set(data.map(item => item.Department))];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h4" color="primary" gutterBottom>Mentor's Dashboard</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* --- UNCOMMENTED: Summary Cards --- */}
        <Grid item xs={12} sm={4}>
          <SummaryCard title="Total Students" value={totalStudents} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="High Risk" value={highRiskStudents} color="#d32f2f" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="Not At Risk" value={safeStudents} color="#2e7d32" />
        </Grid>
      </Grid>
      
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* --- UNCOMMENTED: Filter Controls --- */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Filter by Name"
              variant="outlined"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                label="Department"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                {departments.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Risk Status</InputLabel>
              <Select
                value={riskFilter}
                label="Risk Status"
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="High Risk">High Risk</MenuItem>
                <MenuItem value="Not At Risk">Not At Risk</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            {/* --- NEW DOWNLOAD BUTTON WITH MENU --- */}
            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleMenuClick}
              sx={{ height: '56px' }}
            >
              Download
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleDownload('csv')}>Download as CSV</MenuItem>
              <MenuItem onClick={() => handleDownload('excel')}>Download as Excel</MenuItem>
              <MenuItem onClick={() => handleDownload('pdf')}>Download as PDF</MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          {/* --- UNCOMMENTED: Table Head --- */}
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Student ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Attendance (%)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Average Marks</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Risk Status</TableCell>
            </TableRow>
          </TableHead>
          {/* --- UNCOMMENTED: Table Body --- */}
          <TableBody>
            {filteredData.map((student) => (
              <TableRow
                key={student.StudentID}
                hover
                onClick={() => onStudentSelect(student.StudentID)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{student.StudentID}</TableCell>
                <TableCell>{student.Name}</TableCell>
                <TableCell>{student.Department}</TableCell>
                <TableCell align="right">{student.AttendancePercentage.toFixed(2)}</TableCell>
                <TableCell align="right">{student.AverageMarks.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <Box
                    component="span"
                    sx={{
                      color: student.RiskPrediction === 1 ? '#d32f2f' : '#2e7d32',
                      fontWeight: 'bold',
                    }}
                  >
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