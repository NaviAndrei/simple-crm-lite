import React, { useState, useEffect } from 'react';
import { salesService } from '../services/salesService';
import { 
  Box, Typography, Paper, Card, CardContent, CardActions, 
  IconButton, Chip, Grid, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControl, 
  InputLabel, Select, MenuItem, CircularProgress, Divider
} from '@mui/material';
import { 
  Edit, ArrowForward, ArrowBack, Add, Delete,
  PersonAdd, PersonOutline, Business, MonetizationOn, Cancel
} from '@mui/icons-material';

export default function SalesPipeline() {
  const [pipelineData, setPipelineData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    contact_type: 'LEAD',
    sales_stage: 'PROSPECTING',
    company_id: ''
  });

  // Stages in order
  const stages = [
    'PROSPECTING',
    'QUALIFICATION',
    'PROPOSAL',
    'NEGOTIATION',
    'CLOSED_WON',
    'CLOSED_LOST'
  ];

  const loadPipelineData = async () => {
    setIsLoading(true);
    try {
      const data = await salesService.getPipelineData();
      setPipelineData(data);
    } catch (error) {
      console.error('Error loading pipeline data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPipelineData();
  }, []);

  const getStageTitle = (stage) => {
    return stage.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const handleOpenContactDialog = () => {
    setContactFormData({
      name: '',
      email: '',
      phone: '',
      contact_type: 'LEAD',
      sales_stage: 'PROSPECTING',
      company_id: ''
    });
    setOpenContactDialog(true);
  };

  const handleOpenEditDialog = (contact) => {
    setSelectedContact(contact);
    setContactFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      contact_type: contact.contact_type,
      sales_stage: contact.sales_stage,
      company_id: contact.company_id || ''
    });
    setOpenEditDialog(true);
  };

  const handleCloseContactDialog = () => {
    setOpenContactDialog(false);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedContact(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMoveContact = async (contact, direction) => {
    const currentIndex = stages.indexOf(contact.sales_stage);
    if (
      (direction === 'forward' && currentIndex === stages.length - 1) ||
      (direction === 'back' && currentIndex === 0)
    ) {
      return;
    }

    const newStageIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    const newStage = stages[newStageIndex];

    try {
      await salesService.updateContactStage(contact.id, newStage);
      loadPipelineData();
    } catch (error) {
      console.error('Error moving contact:', error);
    }
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    try {
      if (selectedContact) {
        // Update existing contact
        await salesService.updateContactStage(selectedContact.id, contactFormData.sales_stage);
        // Could add more fields to update here via contactService
        handleCloseEditDialog();
      } else {
        // Create new contact via contactService
        // This would require importing contactService
        // await contactService.createContact(contactFormData);
        // For now, we'll just close the dialog
        handleCloseContactDialog();
      }
      loadPipelineData();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const getContactTypeIcon = (type) => {
    switch (type) {
      case 'LEAD':
        return <PersonAdd fontSize="small" />;
      case 'PROSPECT':
        return <PersonOutline fontSize="small" />;
      case 'CUSTOMER':
        return <Business fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Sales Pipeline</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleOpenContactDialog}
        >
          Add Lead
        </Button>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {stages.map((stage) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={stage}>
              <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box 
                  p={1} 
                  bgcolor={
                    stage === 'CLOSED_WON' ? 'success.main' : 
                    stage === 'CLOSED_LOST' ? 'error.main' : 
                    'primary.main'
                  } 
                  color="white"
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {getStageTitle(stage)} ({pipelineData[stage]?.length || 0})
                  </Typography>
                </Box>
                
                <Box p={1} sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '60vh' }}>
                  {pipelineData[stage]?.length > 0 ? (
                    pipelineData[stage].map((contact) => (
                      <Card key={contact.id} sx={{ mb: 1, backgroundColor: 'background.paper' }}>
                        <CardContent sx={{ p: 1, pb: 0 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" fontWeight="bold">
                              {contact.name}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={contact.contact_type}
                              icon={getContactTypeIcon(contact.contact_type)}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {contact.email}
                          </Typography>
                          {contact.company && (
                            <Typography variant="body2" color="text.secondary">
                              {contact.company.name}
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions sx={{ p: 0.5 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleMoveContact(contact, 'back')}
                            disabled={stage === stages[0]}
                            color="primary"
                          >
                            <ArrowBack fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenEditDialog(contact)}
                            color="primary"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleMoveContact(contact, 'forward')}
                            disabled={stage === stages[stages.length - 1]}
                            color="primary"
                          >
                            <ArrowForward fontSize="small" />
                          </IconButton>
                        </CardActions>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                      No contacts in this stage
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Contact Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Contact Stage</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Name"
              value={contactFormData.name}
              disabled
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="sales-stage-label">Sales Stage</InputLabel>
              <Select
                labelId="sales-stage-label"
                id="sales_stage"
                name="sales_stage"
                value={contactFormData.sales_stage}
                label="Sales Stage"
                onChange={handleInputChange}
              >
                {stages.map((stage) => (
                  <MenuItem key={stage} value={stage}>
                    {getStageTitle(stage)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSubmitContact} variant="contained" color="primary">
            Update Stage
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog open={openContactDialog} onClose={handleCloseContactDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Lead</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This would be connected to the Contact creation form.
            For now, use the Contacts page to create a new contact with a sales stage.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 