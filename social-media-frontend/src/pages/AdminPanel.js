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
        console.log("handleDeleteItem called with:", itemToDelete);
        if (!itemToDelete || !itemToDelete.type || !itemToDelete.id) {
            console.error("Invalid item to delete:", itemToDelete);
            alert("Invalid item to delete");
            return;
        }

        try {
            let response;
            if (itemToDelete.type === 'post') {
                console.log("Attempting to delete post:", itemToDelete.id);
                response = await axios.delete(`http://localhost:3000/api/posts/${itemToDelete.id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            } else if (itemToDelete.type === 'user') {
                console.log("Attempting to delete user:", itemToDelete.id);
                response = await axios.delete(`http://localhost:3000/api/users/${itemToDelete.id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            } else {
                throw new Error(`Unknown item type: ${itemToDelete.type}`);
            }
            console.log("Delete response:", response);
            setDeleteDialogOpen(false);
            setItemToDelete(null);
            fetchReports();
            alert(`${itemToDelete.type} with ID ${itemToDelete.id} deleted successfully`);
        } catch (error) {
            console.error('Error deleting item:', error);
            alert(`Error deleting ${itemToDelete.type}: ${error.response?.data?.message || error.message}`);
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
                                <TableCell>
                                    {report.Post ? `Post ${report.Post.id}` : (report.ReportedUser ? `User ${report.ReportedUser.id}` : 'Unknown')}
                                </TableCell>
                                <TableCell>{report.Post ? 'post' : (report.ReportedUser ? 'user' : 'unknown')}</TableCell>
                                <TableCell>{report.reason || 'Unknown'}</TableCell>
                                <TableCell>{report.Reporter ? report.Reporter.username : 'Unknown'}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleReportAction(report.id, 'resolved')}>Resolve</Button>
                                    <Button onClick={() => handleReportAction(report.id, 'dismissed')}>Dismiss</Button>
                                    <Button color="error" onClick={() => {
                                        const itemType = report.Post ? 'post' : (report.ReportedUser ? 'user' : 'unknown');
                                        const itemId = report.Post ? report.Post.id : (report.ReportedUser ? report.ReportedUser.id : null);
                                        console.log("Setting item to delete:", { type: itemType, id: itemId });
                                        setItemToDelete({ type: itemType, id: itemId });
                                        setDeleteDialogOpen(true);
                                    }}>
                                        Delete {report.Post ? 'post' : (report.ReportedUser ? 'user' : 'item')}
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