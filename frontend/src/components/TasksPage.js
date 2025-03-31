import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import TaskList from './TaskList';
import { 
  Box, Typography, Paper, Container, Grid, Card, 
  CardContent, CircularProgress, Divider 
} from '@mui/material';

export default function TasksPage() {
  const [taskCounts, setTaskCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadTaskCounts = async () => {
    setIsLoading(true);
    try {
      const data = await taskService.getTasksCount();
      console.log("Task counts received:", data); // Add logging for debugging
      setTaskCounts(data);
    } catch (error) {
      console.error('Error loading task counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTaskCounts = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  useEffect(() => {
    loadTaskCounts();
  }, [refreshKey]);

  const getTotalTasks = () => {
    if (!taskCounts) return 0;
    return Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
  };

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        <Typography variant="h4" gutterBottom>Task Management</Typography>

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: 'warning.light' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Pending</Typography>
                    <Typography variant="h3">{taskCounts.PENDING || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: 'primary.light' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>In Progress</Typography>
                    <Typography variant="h3">{taskCounts.IN_PROGRESS || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: 'success.light' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Completed</Typography>
                    <Typography variant="h3">{taskCounts.COMPLETED || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: 'error.light' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Overdue</Typography>
                    <Typography variant="h3">{taskCounts.OVERDUE || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper elevation={2} sx={{ p: 2 }}>
              <TaskList onTaskChange={refreshTaskCounts} />
            </Paper>
          </>
        )}
      </Box>
    </Container>
  );
} 