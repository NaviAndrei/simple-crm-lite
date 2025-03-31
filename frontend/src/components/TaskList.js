import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { 
  Box, Typography, Button, Paper, Table, TableHead, TableBody, 
  TableRow, TableCell, Chip, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControl, 
  InputLabel, Select, MenuItem
} from '@mui/material';
import { Add, Edit, Delete, CheckCircle, Schedule, HourglassTop, Warning } from '@mui/icons-material';
import { format } from 'date-fns';

export default function TaskList({ contactId, companyId, onTaskChange }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'PENDING',
    contact_id: contactId || '',
    company_id: companyId || ''
  });

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      // Build filters based on props
      const filters = {};
      if (contactId) filters.contact_id = contactId;
      if (companyId) filters.company_id = companyId;
      
      const data = await taskService.getTasks(filters);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [contactId, companyId]);

  const handleOpenTaskDialog = (task = null) => {
    if (task) {
      // Format date for the form (if it exists)
      const formattedDate = task.due_date 
        ? new Date(task.due_date).toISOString().split('T')[0]
        : '';
        
      setFormData({
        title: task.title,
        description: task.description || '',
        due_date: formattedDate,
        status: task.status,
        contact_id: task.contact_id || contactId || '',
        company_id: task.company_id || companyId || ''
      });
      setCurrentTask(task);
    } else {
      // New task - set defaults
      setFormData({
        title: '',
        description: '',
        due_date: '',
        status: 'PENDING',
        contact_id: contactId || '',
        company_id: companyId || ''
      });
      setCurrentTask(null);
    }
    setOpenTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      if (currentTask) {
        // Update existing task
        await taskService.updateTask(currentTask.id, formData);
      } else {
        // Create new task
        await taskService.createTask(formData);
      }
      handleCloseTaskDialog();
      loadTasks();
      // Call the callback to update task counts
      if (onTaskChange) onTaskChange();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        loadTasks();
        // Call the callback to update task counts
        if (onTaskChange) onTaskChange();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle color="success" />;
      case 'IN_PROGRESS':
        return <HourglassTop color="primary" />;
      case 'OVERDUE':
        return <Warning color="error" />;
      default:
        return <Schedule color="disabled" />;
    }
  };

  const getStatusChip = (status) => {
    let color = 'default';
    
    switch (status) {
      case 'COMPLETED':
        color = 'success';
        break;
      case 'IN_PROGRESS':
        color = 'primary';
        break;
      case 'OVERDUE':
        color = 'error';
        break;
      case 'PENDING':
        color = 'warning';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status.replace('_', ' ')} 
        color={color} 
        size="small"
        icon={getStatusIcon(status)}
      />
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Tasks</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={() => handleOpenTaskDialog()}
        >
          Add Task
        </Button>
      </Box>

      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Related To</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Loading tasks...</TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No tasks found</TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{getStatusChip(task.status)}</TableCell>
                  <TableCell>
                    {task.due_date 
                      ? format(new Date(task.due_date), 'MMM d, yyyy')
                      : 'No deadline'
                    }
                  </TableCell>
                  <TableCell>
                    {task.contact_name && <div>{task.contact_name}</div>}
                    {task.company_name && <div>{task.company_name}</div>}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenTaskDialog(task)}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteTask(task.id)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Task Dialog */}
      <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentTask ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitTask} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Task Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="due_date"
              label="Due Date"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleInputChange}
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="OVERDUE">Overdue</MenuItem>
              </Select>
            </FormControl>
            
            {!contactId && (
              <FormControl fullWidth margin="normal">
                <TextField
                  id="contact_id"
                  label="Contact ID (optional)"
                  name="contact_id"
                  type="number"
                  value={formData.contact_id}
                  onChange={handleInputChange}
                />
              </FormControl>
            )}
            
            {!companyId && (
              <FormControl fullWidth margin="normal">
                <TextField
                  id="company_id"
                  label="Company ID (optional)"
                  name="company_id"
                  type="number"
                  value={formData.company_id}
                  onChange={handleInputChange}
                />
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog}>Cancel</Button>
          <Button onClick={handleSubmitTask} variant="contained" color="primary">
            {currentTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 