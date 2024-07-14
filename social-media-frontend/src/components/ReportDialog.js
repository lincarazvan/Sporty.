import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import axios from 'axios';

const ReportDialog = ({ open, onClose, itemId, itemType }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:3000/api/reports', {
        [itemType === 'user' ? 'reportedUserId' : 'postId']: itemId,
        reason
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Report {itemType}</DialogTitle>
      <DialogContent>
        <TextField
          select
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          margin="normal"
        >
          <MenuItem value="spam">Spam</MenuItem>
          <MenuItem value="inappropriate">Inappropriate content</MenuItem>
          <MenuItem value="harassment">Harassment</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;