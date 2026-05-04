import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

export default function VerifyEmail() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const email = localStorage.getItem("email");

  const handleResend = async () => {
    try {
      await axios.post(
        "https://nutrilife.runasp.net/api/Account/resend-confirmation-email",
        { email }
      );

      setSnackbarMessage("Confirmation email sent again!");
      setSeverity("success");
      setOpenSnackbar(true);
    } catch (err) {
      console.log(err);
      setSnackbarMessage("Something went wrong");
      setSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
        color: "text.primary",
        p: 2,
      }}
    >
      <Card
        sx={{
          p: 3,
          width: 400,
          maxWidth: "100%",
          borderRadius: 3,
          bgcolor: "background.paper",
          color: "text.primary",
          backgroundImage: "none",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Verify Your Email 📩
          </Typography>

          <Typography color="text.secondary" mb={3}>
            We sent a confirmation link to:
          </Typography>

          <Typography fontWeight="bold" mb={3}>
            {email}
          </Typography>

          <Typography color="text.secondary" mb={3}>
            Please check your inbox and click the confirmation link.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={handleResend}
            sx={{
              mb: 2,
              bgcolor: "primary.main",
              color: "#fff",
              "&:hover": {
                bgcolor: "#15803d",
              },
            }}
          >
            Resend Confirmation Email
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => (window.location.href = "/login")}
            sx={{
              color: "primary.main",
              borderColor: "primary.main",
              "&:hover": {
                borderColor: "#15803d",
                color: "#15803d",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(22,163,74,0.12)"
                    : "rgba(22,163,74,0.05)",
              },
            }}
          >
            Continue to Login
          </Button>
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
