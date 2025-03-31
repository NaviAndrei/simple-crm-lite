import React from 'react';
import SalesPipeline from './SalesPipeline';
import { Container, Box, Typography } from '@mui/material';

export default function SalesPipelinePage() {
  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <Typography variant="h4" gutterBottom>Sales Pipeline</Typography>
        <SalesPipeline />
      </Box>
    </Container>
  );
} 