import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, 
  Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle 
} from '@mui/material';
import axios from 'axios';

const AdminPanel = () => {
  const [reports, setReports] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/reports', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleReportAction = async (id, status) => {
    try {
      await axios.put(`http://localhost:3000/api/reports/${id}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'post') {
        await axios.delete(`http://localhost:3000/api/posts/${itemToDelete.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else if (itemToDelete.type === 'user') {
        await axios.delete(`http://localhost:3000/api/users/${itemToDelete.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchReports();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Admin Panel</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reported Item</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Reporter</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.reportedItemType === 'post' ? `Post ${report.postId}` : `User ${report.reportedUserId}`}</TableCell>
                <TableCell>{report.reportedItemType}</TableCell>
                <TableCell>{report.reason}</TableCell>
                <TableCell>{report.userId}</TableCell>
                <TableCell>
                  <Button onClick={() => handleReportAction(report.id, 'resolved')}>Resolve</Button>
                  <Button onClick={() => handleReportAction(report.id, 'dismissed')}>Dismiss</Button>
                  <Button color="error" onClick={() => {
                    setItemToDelete({ 
                      id: report.reportedItemType === 'post' ? report.postId : report.reportedUserId, 
                      type: report.reportedItemType 
                    });
                    setDeleteDialogOpen(true);
                  }}>
                    Delete {report.reportedItemType}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteItem} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdminPanel;