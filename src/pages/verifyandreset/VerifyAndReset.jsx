import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  Snackbar,
  Divider,
} from "@mui/material";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";
import LockResetIcon from "@mui/icons-material/LockReset";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function VerifyAndReset() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const email = state?.email;

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [resendTimer, setResendTimer] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  useEffect(() => {
    if (!resendDisabled) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setResendDisabled(false);
          return 30;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendDisabled]);

  if (!email) {
    return (
      <Box
        sx={{
          py: 8,
          minHeight: "80vh",
          textAlign: "center",
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        <Typography color="error">
          Session expired. Please start again.
        </Typography>

        <Button
          component={RouterLink}
          to="/forgot-password"
          sx={{ mt: 2, color: "primary.main" }}
        >
          Go to Forgot Password
        </Button>
      </Box>
    );
  }

  const validate = () => {
    if (!code) return "Please enter the verification code";
    if (!/^\d{4}$/.test(code)) return "Code must be exactly 4 digits";
    if (!password) return "Please enter a new password";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirm) return "Passwords do not match";
    return null;
  };

  const handleReset = async () => {
    const error = validate();

    if (error) {
      setMessage(error);
      setSeverity("error");
      setOpen(true);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://nutrilife.runasp.net/api/Account/ResetPassword",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Email: email,
            Code: code,
            NewPassword: password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Reset failed");

      setMessage("Password reset successfully!");
      setSeverity("success");
      setOpen(true);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setMessage(err.message || "Something went wrong");
      setSeverity("error");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);

      const res = await fetch(
        "https://nutrilife.runasp.net/api/Account/sendCode",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error");

      setMessage("Code resent! Check your inbox.");
      setSeverity("success");
      setOpen(true);

      setResendDisabled(true);
      setResendTimer(30);
    } catch (err) {
      setMessage(err.message || "Failed to resend. Try again.");
      setSeverity("error");
      setOpen(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box
      sx={{
        py: 8,
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: 3,
            p: 3,
            textAlign: "center",
            bgcolor: "background.paper",
            color: "text.primary",
            backgroundImage: "none",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(22, 163, 74, 0.18)"
                    : "#e8f5e9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <LockResetIcon color="success" />
            </Box>

            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Reset Your Password
            </Typography>

            <Typography sx={{ color: "primary.main" }} mb={3}>
              Enter the code sent to <strong>{email}</strong> and your new
              password.
            </Typography>

            <Typography
              variant="subtitle2"
              color="text.secondary"
              textAlign="left"
              mb={1}
            >
              VERIFICATION CODE
            </Typography>

            <TextField
              fullWidth
              placeholder="Enter 4-digit code"
              value={code}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d{0,4}$/.test(val)) setCode(val);
              }}
              inputProps={{
                maxLength: 4,
                inputMode: "numeric",
                style: {
                  textAlign: "left",
                  fontSize: "20px",
                },
              }}
            />

            <Button
              onClick={handleResend}
              disabled={resendDisabled || resendLoading}
              sx={{
                mt: 1,
                fontSize: "13px",
                color: resendDisabled ? "text.disabled" : "primary.main",
              }}
            >
              {resendLoading
                ? "Sending..."
                : resendDisabled
                ? `Resend Code (${resendTimer}s)`
                : "Resend Code"}
            </Button>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="subtitle2"
              color="text.secondary"
              textAlign="left"
              mb={1}
            >
              NEW PASSWORD
            </Typography>

            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="success" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ color: "text.secondary" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              margin="normal"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="success" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm(!showConfirm)}
                      sx={{ color: "text.secondary" }}
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleReset}
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.3,
                fontWeight: "bold",
                bgcolor: "primary.main",
                color: "#fff",
                "&:hover": {
                  bgcolor: "#15803d",
                },
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>

            <Box mt={2}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                underline="hover"
                sx={{ color: "primary.main" }}
              >
                ← Back to Forgot Password
              </Link>
            </Box>
          </CardContent>
        </Card>

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
