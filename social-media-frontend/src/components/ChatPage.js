import React, { useState, useEffect, useContext, useRef, useCallback, } from "react";
import io from "socket.io-client"
import {
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import { format } from "date-fns";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "calc(100vh - 100px)",
  overflow: "hidden",
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "100%",
}));

const ConversationList = styled(Box)(({ theme }) => ({
  width: "300px",
  borderRight: `1px solid ${theme.palette.divider}`,
  overflowY: "auto",
}));

const ChatArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(2),
}));

const MessageList = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: "auto",
  marginBottom: theme.spacing(2),
}));

const ChatPage = () => {

	const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef();
  const typingTimeoutRef = useRef(null);
  const [searchUserDialogOpen, setSearchUserDialogOpen] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [searchUserResults, setSearchUserResults] = useState([]);

  const setupSocketConnection = useCallback(() => {
    socketRef.current = io("http://localhost:3000");
    socketRef.current.emit("join", user.id);

    socketRef.current.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socketRef.current.on("typing", ({ senderId }) => {
      if (senderId === selectedConversation?.id) {
        setIsTyping(true);
      }
    });

    socketRef.current.on("stopTyping", ({ senderId }) => {
      if (senderId === selectedConversation?.id) {
        setIsTyping(false);
      }
    });
  }, [user.id, selectedConversation?.id]);

  useEffect(() => {
    fetchConversations();
    setupSocketConnection();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user.id, setupSocketConnection]);

  useEffect(() => {
    setFilteredConversations(
      conversations.filter((conv) =>
        conv.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, conversations]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/messages/conversations",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setConversations(response.data);
      setFilteredConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/messages/${otherUserId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData = {
      senderId: user.id,
      receiverId: selectedConversation.id,
      content: newMessage,
      createdAt: new Date().toISOString(),
      status: "sent",
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/api/messages",
        messageData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setNewMessage("");
      socketRef.current.emit("sendMessage", response.data);
      setMessages((prevMessages) => [...prevMessages, response.data]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socketRef.current.emit("typing", {
      senderId: user.id,
      receiverId: selectedConversation.id,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stopTyping", {
        senderId: user.id,
        receiverId: selectedConversation.id,
      });
    }, 1000);
  };

  const handleSearchUser = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/users/search?query=${searchUserQuery}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSearchUserResults(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleStartNewConversation = async (selectedUser) => {
    try {
      const existingConversation = conversations.find(
        (conv) => conv.id === selectedUser.id
      );
      if (existingConversation) {
        handleSelectConversation(existingConversation);
      } else {
        const newConversation = {
          id: selectedUser.id,
          username: selectedUser.username,
          avatarUrl: selectedUser.avatarUrl,
        };
        setConversations((prevConversations) => [
          ...prevConversations,
          newConversation,
        ]);
        handleSelectConversation(newConversation);
      }
      setSearchUserDialogOpen(false);
      setSearchUserQuery("");
      setSearchUserResults([]);
    } catch (error) {
      console.error("Error starting new conversation:", error);
    }
  };

  return (
    <Container maxWidth="xl">
      <StyledPaper>
        <ChatContainer>
          <ConversationList>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => setSearchUserDialogOpen(true)}
                sx={{ ml: 1 }}
              >
                <AddIcon />
              </Button>
            </Box>
            <List>
              {filteredConversations.map((conversation) => (
                <ListItem
                  button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  selected={selectedConversation && selectedConversation.id === conversation.id}
                >
                  <ListItemAvatar>
                    <Avatar src={conversation.avatarUrl} alt={conversation.username} />
                  </ListItemAvatar>
                  <ListItemText primary={conversation.username} />
                </ListItem>
              ))}
            </List>
          </ConversationList>
          
          {selectedConversation ? (
            <ChatArea>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Chat with {selectedConversation.username}
              </Typography>
              <MessageList>
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 1,
                      textAlign: message.senderId === user.id ? "right" : "left",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        backgroundColor: message.senderId === user.id ? "#e3f2fd" : "#f5f5f5",
                        p: 1,
                        borderRadius: 1,
                        display: "inline-block",
                        maxWidth: "70%",
                      }}
                    >
                      {message.content}
                      <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: "right" }}>
                        {format(new Date(message.createdAt), "HH:mm")}
                        {message.senderId === user.id &&
                          (message.status === "sent" ? (
                            <AccessTimeIcon fontSize="small" sx={{ ml: 0.5 }} />
                          ) : (
                            <DoneAllIcon fontSize="small" sx={{ ml: 0.5 }} />
                          ))}
                      </Typography>
                    </Typography>
                  </Box>
                ))}
              </MessageList>
              {isTyping && (
                <Typography variant="body2" sx={{ fontStyle: "italic", mb: 1 }}>
                  {selectedConversation.username} is typing...
                </Typography>
              )}
              <Grid container spacing={2}>
                <Grid item xs={10}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleSendMessage}
                  >
                    Send
                  </Button>
                </Grid>
              </Grid>
            </ChatArea>
          ) : (
            <ChatArea>
              <Typography variant="h6">Select a conversation to start chatting</Typography>
            </ChatArea>
          )}
        </ChatContainer>
      </StyledPaper>

      <Dialog
        open={searchUserDialogOpen}
        onClose={() => setSearchUserDialogOpen(false)}
      >
        <DialogTitle>Start a new conversation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search users"
            type="text"
            fullWidth
            variant="outlined"
            value={searchUserQuery}
            onChange={(e) => setSearchUserQuery(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button onClick={handleSearchUser}>Search</Button>
                </InputAdornment>
              ),
            }}
          />
          <List>
            {searchUserResults.map((user) => (
              <ListItem
                button
                key={user.id}
                onClick={() => handleStartNewConversation(user)}
              >
                <ListItemAvatar>
                  <Avatar src={user.avatarUrl} alt={user.username} />
                </ListItemAvatar>
                <ListItemText primary={user.username} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchUserDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChatPage;