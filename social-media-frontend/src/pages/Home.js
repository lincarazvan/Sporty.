import React, { useState, useEffect } from "react";
import axios from "axios";
import { Typography, Paper } from "@mui/material";
import CreatePost from "../components/CreatePost";
import Post from "../components/Post";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch posts", error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  return (
    <>
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <CreatePost onPostCreated={handleNewPost} />
      </Paper>
      <Typography variant="h6" gutterBottom>Latest Posts</Typography>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </>
  );
};

export default Home;