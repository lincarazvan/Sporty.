import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { Container, Paper, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import io from "socket.io-client";
import ConversationList from "./ConversationList";
import ChatSidebar from "./ChatSidebar";
import SearchUserDialog from "./SearchUserDialog";
import { useLocation } from "react-router-dom";

const StyledContainer = styled(Container)(({ theme }) => ({
  height: "calc(100vh - 70px)", // Ajustează înălțimea bazată pe înălțimea header-ului aplicației
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  flexGrow: 1,
  display: "flex",
  overflow: "hidden",
  backgroundColor: theme.palette.background.default,
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
  const [showConversationList, setShowConversationList] = useState(true);
  const socketRef = useRef();
  const typingTimeoutRef = useRef(null);
  const [searchUserDialogOpen, setSearchUserDialogOpen] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [searchUserResults, setSearchUserResults] = useState([]);

  const location = useLocation();

  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    setShowConversationList(false);
  },[]);

  useEffect(() => {
    if (location.state?.openChat) {
      const { id, username } = location.state.openChat;
      handleSelectConversation({ id, username });
    }
  }, [location.state, handleSelectConversation]);

  const handleBackToList = () => {
    setShowConversationList(true);
    setSelectedConversation(null);
  };

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
      // Asigură-te că fiecare conversație este unică bazată pe ID
      const uniqueConversations = response.data.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      setConversations(uniqueConversations);
      setFilteredConversations(uniqueConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
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

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`http://localhost:3000/api/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessages(prevMessages => prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, isDeleted: true, content: 'This message has been deleted' } : msg
      ));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <StyledContainer maxWidth="xl">
      <StyledPaper elevation={3}>
        {showConversationList ? (
          <ConversationList
            conversations={filteredConversations}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?.id}
            onNewConversation={() => setSearchUserDialogOpen(true)}
          />
        ) : (
          <>
            <IconButton onClick={handleBackToList} sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <ChatSidebar
              selectedConversation={selectedConversation}
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              currentUserId={user.id}
              isTyping={isTyping}
              onDeleteMessage={handleDeleteMessage}
              onBackToList={handleBackToList}
            />
          </>
        )}
      </StyledPaper>

      <SearchUserDialog
        open={searchUserDialogOpen}
        onClose={() => setSearchUserDialogOpen(false)}
        searchUserQuery={searchUserQuery}
        setSearchUserQuery={setSearchUserQuery}
        searchUserResults={searchUserResults}
        onSearchUser={handleSearchUser}
        onStartNewConversation={handleStartNewConversation}
      />
    </StyledContainer>
  );
};

export default ChatPage;
