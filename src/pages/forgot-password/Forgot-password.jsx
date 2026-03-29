import React, { useState } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  Alert,
  Snackbar
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import LockResetIcon from "@mui/icons-material/LockReset";

import { Link as RouterLink, useNavigate } from "react-router-dom";

// ✅ Email validation
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  // ✅ Send Code
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email");
      setSeverity("error");
      setOpen(true);
      return;
    }

    // ✅ تحقق من صيغة الإيميل
    if (!isValidEmail(email)) {
      setMessage("Please enter a valid email address");
      setSeverity("error");
      setOpen(true);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://nutrilife.runasp.net/api/Account/sendCode",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");

      setMessage("Code sent successfully!");
      setSeverity("success");
      setOpen(true);

      // ✅ انتظر يشوف الرسالة ثم انتقل
      setTimeout(() => {
        navigate("/verify-and-reset", { state: { email } });
      }, 1500);

    } catch (error) {
      setMessage(error.message || "Something went wrong");
      setSeverity("error");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        py: 8,
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f5f5f5"
      }}
    >
      <Container maxWidth="sm">

        <Card
          sx={{
            borderRadius: 4,
            boxShadow: 3,
            p: 3,
            textAlign: "center"
          }}
        >
          <CardContent>

            {/* Icon */}
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "#e8f5e9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px"
              }}
            >
              <LockResetIcon color="success" />
            </Box>

            {/* Title */}
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Forgot Your Password?
            </Typography>

            <Typography color="text.secondary" mb={3}>
              Enter your email address and we'll send you a recovery code to reset your account.
            </Typography>

            {/* Form */}
            <form onSubmit={handleSubmit}>

              <TextField
                fullWidth
                label="Email Address"
                placeholder="e.g. alex@example.com"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="success" />
                    </InputAdornment>
                  )
                }}
              />

              {/* Send Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.3,
                  fontWeight: "bold",
                  backgroundColor: "#16a34a"
                }}
              >
                {loading ? "Sending..." : "Send Code"}
              </Button>

            </form>

            {/* Back to login */}
            <Box mt={2}>
              <Link
                component={RouterLink}
                to="/login"
                underline="hover"
                color="success.main"
              >
                ← Back to Login
              </Link>
            </Box>

          </CardContent>
        </Card>

     

        {/* Snackbar */}
        <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={() => setOpen(false)}
        >
          <Alert severity={severity} variant="filled">
            {message}
          </Alert>
        </Snackbar>

      </Container>
    </Box>
  );
}