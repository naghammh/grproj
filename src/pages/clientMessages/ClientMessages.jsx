import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Badge,
  Paper,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  Image as ImageIcon,
  Mic as MicIcon,
  Delete as DeleteIcon,
  Report as ReportIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const ChatBubble = styled(Paper)(({ theme, isclient }) => ({
  padding: theme.spacing(1.5, 2),
  maxWidth: "70%",
  borderRadius:
    isclient === "true" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
  backgroundColor:
    isclient === "true"
      ? theme.palette.primary.main
      : theme.palette.mode === "dark"
      ? theme.palette.background.paper
      : theme.palette.grey[100],
  color:
    isclient === "true"
      ? theme.palette.common.white
      : theme.palette.text.primary,
  border:
    isclient === "true"
      ? "none"
      : `1px solid ${theme.palette.divider}`,
  backgroundImage: "none",
}));

function ClientMessages() {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const menuOpen = Boolean(anchorEl);

  const emojiList = [
    "😀",
    "😊",
    "😂",
    "❤️",
    "👍",
    "😍",
    "🥺",
    "😢",
    "🎉",
    "🙏",
    "💪",
    "🍎",
    "🥗",
    "💧",
    "⭐",
    "🔥",
    "💯",
    "✅",
  ];

  const specialist = {
    id: 1,
    name: "د. أحمد محمد",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    specialty: "أخصائي تغذية",
    online: true,
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "مرحباً دكتور، كيف يمكنني تحسين نظامي الغذائي؟",
      sender: "client",
      time: "10:00 ص",
      read: true,
      type: "text",
    },
    {
      id: 2,
      text: "وعليكم السلام! سعيد بتواصلك. أخبرني ماذا تأكل عادة في اليوم؟",
      sender: "specialist",
      time: "10:05 ص",
      read: true,
      type: "text",
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: "حجم الصورة يجب أن أقل من 5MB",
          severity: "error",
        });
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        const imageMessage = {
          id: messages.length + 1,
          text: reader.result,
          type: "image",
          sender: "client",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          read: true,
        };

        setMessages((prev) => [...prev, imageMessage]);

        setSnackbar({
          open: true,
          message: "تم إرسال الصورة بنجاح",
          severity: "success",
        });

        setTimeout(() => {
          setIsTyping(true);

          setTimeout(() => {
            setIsTyping(false);

            const reply = {
              id: messages.length + 2,
              text: "شكراً لمشاركتك الصورة",
              sender: "specialist",
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              read: false,
              type: "text",
            };

            setMessages((prev) => [...prev, reply]);
          }, 2000);
        }, 500);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: "حجم الملف يجب أن أقل من 10MB",
          severity: "error",
        });
        return;
      }

      const fileMessage = {
        id: messages.length + 1,
        text: file.name,
        type: "file",
        fileSize: (file.size / 1024).toFixed(2) + " KB",
        sender: "client",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: true,
      };

      setMessages((prev) => [...prev, fileMessage]);

      setSnackbar({
        open: true,
        message: `تم رفع الملف: ${file.name}`,
        severity: "success",
      });
    }
  };

  const handleVoiceRecord = () => {
    setSnackbar({
      open: true,
      message: "المكتبة لازم انزلها",
      severity: "info",
    });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleClearChat = () => {
    setOpenClearDialog(true);
    handleMenuClose();
  };

  const confirmClearChat = () => {
    setMessages([]);
    setSnackbar({
      open: true,
      message: "تم مسح المحادثة",
      severity: "warning",
    });
    setOpenClearDialog(false);
  };

  const handleReport = () => {
    setSnackbar({
      open: true,
      message: "تم إبلاغ الإدارة عن المشكلة",
      severity: "info",
    });
    handleMenuClose();
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const clientMessage = {
      id: messages.length + 1,
      text: newMessage,
      type: "text",
      sender: "client",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: true,
    };

    setMessages((prev) => [...prev, clientMessage]);
    setNewMessage("");

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      const reply = {
        id: messages.length + 2,
        text: "شكراً لتواصلك، سأرد عليك قريباً",
        sender: "specialist",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: false,
        type: "text",
      };

      setMessages((prev) => [...prev, reply]);
    }, 2000);
  };

  const renderMessageContent = (msg) => {
    if (msg.type === "image") {
      return (
        <img
          src={msg.text}
          alt="مرفوع"
          style={{
            maxWidth: "200px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => window.open(msg.text, "_blank")}
        />
      );
    }

    if (msg.type === "file") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AttachFileIcon fontSize="small" />

          <Box>
            <Typography variant="body2">{msg.text}</Typography>
            <Typography variant="caption" color="text.secondary">
              {msg.fileSize}
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
        {msg.text}
      </Typography>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: "calc(100vh - 100px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: 2,
        bgcolor: "background.default",
        color: "text.primary",
        border: "1px solid",
        borderColor: "divider",
        backgroundImage: "none",
      }}
    >
      <AppBar
        position="static"
        elevation={1}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundImage: "none",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
              color="success"
              invisible={!specialist.online}
            >
              <Avatar src={specialist.image} sx={{ width: 48, height: 48 }} />
            </Badge>

            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {specialist.name}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {specialist.specialty}
              </Typography>

              {isTyping && (
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ display: "block" }}
                >
                  يكتب...
                </Typography>
              )}
            </Box>
          </Box>

          <IconButton onClick={handleMenuOpen} sx={{ color: "text.primary" }}>
            <MoreVertIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
        <MenuItem onClick={handleClearChat}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>مسح المحادثة</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleReport}>
          <ListItemIcon>
            <ReportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>إبلاغ عن مشكلة</ListItemText>
        </MenuItem>
      </Menu>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 3,
          bgcolor: "background.default",
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: "flex",
              justifyContent:
                msg.sender === "client" ? "flex-end" : "flex-start",
              mb: 2,
            }}
          >
            {msg.sender !== "client" && (
              <Avatar
                src={specialist.image}
                sx={{ width: 32, height: 32, mr: 1 }}
              />
            )}

            <ChatBubble isclient={(msg.sender === "client").toString()}>
              {renderMessageContent(msg)}

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.5,
                  color:
                    msg.sender === "client"
                      ? "rgba(255,255,255,0.75)"
                      : "text.secondary",
                }}
              >
                {msg.time}
                {msg.sender === "client" && msg.read && " ✓✓"}
              </Typography>
            </ChatBubble>

            {msg.sender === "client" && (
              <Avatar
                src="https://randomuser.me/api/portraits/women/1.jpg"
                sx={{ width: 32, height: 32, ml: 1 }}
              />
            )}
          </Box>
        ))}

        {isTyping && (
          <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
            <Avatar src={specialist.image} sx={{ width: 32, height: 32, mr: 1 }} />

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "background.paper",
                color: "text.primary",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CircularProgress size={20} />

              <Typography variant="caption" sx={{ ml: 1 }}>
                يكتب...
              </Typography>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Paper
        elevation={2}
        sx={{
          p: 2,
          bgcolor: "background.paper",
          color: "text.primary",
          borderTop: "1px solid",
          borderColor: "divider",
          backgroundImage: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />

          <IconButton
            size="small"
            onClick={() => fileInputRef.current?.click()}
            sx={{ color: "text.secondary" }}
          >
            <AttachFileIcon />
          </IconButton>

          <input
            type="file"
            ref={imageInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageUpload}
          />

          <IconButton
            size="small"
            onClick={() => imageInputRef.current?.click()}
            sx={{ color: "text.secondary" }}
          >
            <ImageIcon />
          </IconButton>

          <Box sx={{ position: "relative" }}>
            <IconButton
              size="small"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              sx={{ color: "text.secondary" }}
            >
              <EmojiEmotionsIcon />
            </IconButton>

            {showEmojiPicker && (
              <Paper
                sx={{
                  position: "absolute",
                  bottom: "100%",
                  left: 0,
                  zIndex: 1000,
                  p: 1.5,
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: 1,
                  width: 280,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                {emojiList.map((emoji, index) => (
                  <IconButton
                    key={index}
                    size="small"
                    onClick={() => handleEmojiClick(emoji)}
                    sx={{ fontSize: 28 }}
                  >
                    {emoji}
                  </IconButton>
                ))}
              </Paper>
            )}
          </Box>

          <IconButton
            size="small"
            onClick={handleVoiceRecord}
            sx={{ color: "text.secondary" }}
          >
            <MicIcon />
          </IconButton>

          <TextField
            size="small"
            placeholder="اكتب رسالتك..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            variant="outlined"
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "grey.50",
              },
            }}
          />

          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{
              bgcolor: newMessage.trim() ? "primary.main" : "action.disabledBackground",
              color: newMessage.trim() ? "#fff" : "text.disabled",
              "&:hover": {
                bgcolor: newMessage.trim()
                  ? "primary.dark"
                  : "action.disabledBackground",
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>

      <Dialog open={openClearDialog} onClose={() => setOpenClearDialog(false)}>
        <DialogTitle>مسح المحادثة</DialogTitle>

        <DialogContent>
          <Typography>هل أنت متأكد من رغبتك في مسح كل الرسائل؟</Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenClearDialog(false)}>إلغاء</Button>
          <Button onClick={confirmClearChat} color="error" variant="contained">
            مسح
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default ClientMessages;
