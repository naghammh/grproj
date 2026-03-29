import React, { useState } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Link,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import axios from "axios";



import { Link as RouterLink, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please fill in both email and password");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // ✅ axios POST request
      const bodyData = {
        Email: email.trim(),
        Password: password.trim()
      };

      const res = await axios.post(
        "https://nutrilife.runasp.net/api/Account/login",
        bodyData,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Response:", res.data);

      const result = res.data;
      localStorage.setItem("token", result.accessToken);
      const payload = JSON.parse(atob(result.accessToken.split(".")[1]));
      console.log("Payload:", payload);

      const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      if (role === "Client") navigate("/clientdashboard");
      else if (role === "Admin") navigate("/admindashboard");
      else if (role === "Specialist") navigate("/specialistdashboard");
      else navigate("/");

    } catch (error) {
      console.error(error);

      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || "Invalid email or password ❌");
      } else {
        setErrorMessage("Something went wrong 🚨");
      }

      setOpenSnackbar(true);
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
        <Card sx={{ borderRadius: 4, boxShadow: 3, p: 3 }}>
          <CardContent>
            <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
              Welcome Back
            </Typography>
            <Typography textAlign="center" color="text.secondary" mb={4}>
              Log in to continue your healthy journey.
            </Typography>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <TextField
                fullWidth
                label="Email address"
                placeholder="name@example.com"
                margin="normal"
                name="email"  // ✅ name لكل حقل
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="success" />
                    </InputAdornment>
                  )
                }}
              />

              {/* Password */}
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                margin="normal"
                name="password"  // ✅ name لكل حقل
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="success" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Box textAlign="right" mt={1}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  underline="hover"
                  color="success.main"
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ mt: 3, py: 1.4, fontWeight: "bold", backgroundColor: "#16a34a" }}
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>OR</Divider>

            <Typography textAlign="center">
              Don’t have an account?{" "}
              <Link
                component={RouterLink}
                to="/register"
                underline="hover"
                color="success.main"
                fontWeight="bold"
              >
                Sign Up
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>

      {/* Snackbar للأخطاء */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={handleCloseSnackbar}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}