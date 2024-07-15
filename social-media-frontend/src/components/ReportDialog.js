import React, {useState} from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import axios from 'axios';

const ReportDialog = ({ open, onClose, itemId, itemType }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.stopPropagation();
    try {
      await axios.post('http://localhost:3000/api/reports', {
        [itemType === 'user' ? 'reportedUserId' : 'postId']: itemId,
        reason
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onClose(e);
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={(e) => { e.stopPropagation(); onClose(e); }}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle>Report {itemType}</DialogTitle>
      <DialogContent>
        <TextField
          select
          label="Reason"
          value={reason}
          onChange={(e) => { e.stopPropagation(); setReason(e.target.value); }}
          fullWidth
          margin="normal"
        >
          <MenuItem value="spam" onClick={(e) => e.stopPropagation()}>Spam</MenuItem>
          <MenuItem value="inappropriate" onClick={(e) => e.stopPropagation()}>Inappropriate content</MenuItem>
          <MenuItem value="harassment" onClick={(e) => e.stopPropagation()}>Harassment</MenuItem>
          <MenuItem value="other" onClick={(e) => e.stopPropagation()}>Other</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={(e) => { e.stopPropagation(); onClose(e); }}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;