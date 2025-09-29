// Onboarding.js

import React from 'react';
import { Container, Typography, TextField, Button, Box, Paper } from '@mui/material';

// We now accept 'onRegister' as a prop from App.js
function Onboarding({ onRegister }) {

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevents the browser from reloading the page
    onRegister();         // Calls the function from App.js to change the page
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <Typography component="h1" variant="h4" gutterBottom>
          Register Your Institution
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Welcome to Project VidyaRaksha
        </Typography>

        {/* When this form is submitted, handleSubmit will be called */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal" required fullWidth id="institutionName" label="Institution Name"
            name="institutionName" autoFocus defaultValue="SIH Demo College"
          />
          <TextField
            margin="normal" required fullWidth id="adminName" label="Admin Name (e.g., Principal)"
            name="adminName" defaultValue="SIH Judge"
          />
          <TextField
            margin="normal" required fullWidth name="email" label="Official Email Address"
            type="email" id="email" defaultValue="admin@sihcollege.edu"
          />
          
          <Button
            type="submit" fullWidth variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
          >
            Register & Proceed to Upload
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Onboarding;