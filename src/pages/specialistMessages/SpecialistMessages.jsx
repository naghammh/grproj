// src/pages/dashboardspecialist/Messages.jsx
import React, { useState } from "react";
import { Box, List, ListItemButton, ListItemAvatar, Avatar, ListItemText, Typography, TextField, Button, Paper } from "@mui/material";
import Specialist from './../specialist/Specialist';

const clientsData = [
  { id: 1, name: "أحمد علي", lastMessage: "مرحبا، ممكن موعد؟", avatar: "https://i.pravatar.cc/60?img=1" },
  { id: 2, name: "سارة محمد", lastMessage: "شكرا على النصائح", avatar: "https://i.pravatar.cc/60?img=2" },
  { id: 3, name: "ليلى خالد", lastMessage: "ممكن استشارة جديدة؟", avatar: "https://i.pravatar.cc/60?img=3" },
];

const initialMessages = {
  1: [
    { sender: "client", text: "مرحبا، ممكن موعد؟" },
    { sender: "specialist", text: "أكيد، متى يناسبك؟" },
  ],
  2: [
    { sender: "client", text: "شكرا على النصائح" },
    { sender: "specialist", text: "على الرحب والسعة!" },
  ],
  3: [
    { sender: "client", text: "ممكن استشارة جديدة؟" },
    { sender: "specialist", text: "بالطبع، سأحدد لك موعداً." },
  ],
};

export default function SpecialistMessages() {
  const [selectedClientId, setSelectedClientId] = useState(clientsData[0].id);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const handleSend = () => {
    if (!messageText.trim()) return;
    const updatedMessages = {
      ...messages,
      [selectedClientId]: [
        ...messages[selectedClientId],
        { sender: "specialist", text: messageText },
      ],
    };
    setMessages(updatedMessages);
    setMessageText("");
  };

  return (
    <Box sx={{ display: "flex", height: "90vh", bgcolor: "#f5f7fa" }}>
      
      {/* Sidebar - Clients (نص الشاشة تقريبًا) */}
      <Box sx={{ width: "50%", borderRight: "1px solid #ddd", bgcolor: "#fff", p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>المراجعين</Typography>
        <List>
          {clientsData.map((client) => (
            <ListItemButton
              key={client.id}
              selected={client.id === selectedClientId}
              onClick={() => setSelectedClientId(client.id)}
              sx={{ mb: 3, borderRadius: 3, minHeight: 80 }}
            >
              <ListItemAvatar>
                <Avatar src={client.avatar} sx={{ width: 70, height: 70 }} />
              </ListItemAvatar>
              <ListItemText
                primary={<Typography variant="h5" fontWeight="bold">{client.name}</Typography>}
                secondary={<Typography variant="h6" color="text.secondary">{client.lastMessage}</Typography>}
                sx={{ ml: 2 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 3 }}>
        <Paper sx={{ flex: 1, p: 4, mb: 3, overflowY: "auto", bgcolor: "#fff" }}>
          {messages[selectedClientId].map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: msg.sender === "specialist" ? "flex-end" : "flex-start",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: msg.sender === "specialist" ? "#1976d2" : "#e0e0e0",
                  color: msg.sender === "specialist" ? "#fff" : "#000",
                  maxWidth: "70%",
                  fontSize: "1.3rem",
                }}
              >
                <Typography variant="body1">{msg.text}</Typography>
              </Box>
            </Box>
          ))}
        </Paper>

        {/* Input Box */}
        <Box sx={{ display: "flex", gap: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="اكتب رسالة..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            sx={{ fontSize: "1.3rem" }}
          />
          <Button variant="contained" onClick={handleSend} sx={{ fontSize: "1.3rem", px: 5, py: 2 }}>
            إرسال
          </Button>
        </Box>
      </Box>
    </Box>
  );
}