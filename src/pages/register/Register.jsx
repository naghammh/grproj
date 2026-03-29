import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import WcIcon from "@mui/icons-material/Wc";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import HeightIcon from "@mui/icons-material/Height";
import HealingIcon from "@mui/icons-material/Healing";
import FlagIcon from "@mui/icons-material/Flag";
import BadgeIcon from "@mui/icons-material/Badge";
import WorkIcon from "@mui/icons-material/Work";
import InfoIcon from "@mui/icons-material/Info";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { useForm } from "react-hook-form";
import axios from "axios";
import { Link as RouterLink, useNavigate } from "react-router-dom";

// ✅ مساعد لتوليد InputProps بأيقونة
const withIcon = (icon) => ({
  startAdornment: (
    <InputAdornment position="start">
      {React.cloneElement(icon, { sx: { color: "#16a34a", fontSize: 20 } })}
    </InputAdornment>
  )
});

function Register() {
  const [type, setType] = useState("user");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  const validate = (data) => {
    if (!data.UserName) return "Username is required";
    if (!data.Email || !data.Email.includes("@")) return "Valid email is required";
    if (!data.Password || data.Password.length < 8)
      return "Password must be at least 8 characters";
    return null;
  };

  const registerUser = async (values) => {
    const errorMsg = validate(values);

    if (errorMsg) {
      setMessage(errorMsg);
      setSeverity("error");
      setOpen(true);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://nutrilife.runasp.net/api/Account/Register",
        values
      );

      setMessage("Account created successfully!");
      setSeverity("success");
      setOpen(true);

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
      setSeverity("error");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ sx موحد لكل TextField
  const fieldSx = { width: "300px" };
  const fieldSxSm = { width: "200px" };

  return (
    <Box component="form" onSubmit={handleSubmit(registerUser)}>
      <Container maxWidth="sm" sx={{ py: 5 }}>
        <Typography variant="h4" textAlign="center" my={2} sx={{ fontWeight: 900 }}>
          Create Your Account
        </Typography>

        <Typography sx={{ color: "#22c55e" }} mb={5} textAlign="center">
          Join NutriLife and start your journey towards a healthier you.
        </Typography>

        <Paper sx={{ p: 4, backgroundColor: "white" }}>
          <Typography sx={{ color: "black" }} mb={2} textAlign="center" fontWeight={500}>
            I AM JOINING AS A...
          </Typography>

          {/* Toggle Buttons */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setType("user")}
              sx={{
                width: "200px",
                height: "100px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textTransform: "none",
                borderColor: type === "user" ? "#22c55e" : "#ccc",
                borderWidth: 3,
                backgroundColor: type === "user" ? "#e8f5e9" : "white",
                color: "#000"
              }}
            >
              <PersonIcon sx={{ fontSize: 30, color: "#22c55e" }} />
              <Typography variant="body2" fontWeight="bold" sx={{ my: 1 }}>
                User (Client)
              </Typography>
              <Typography variant="caption" color="#22c55e">
                Track diet and health
              </Typography>
            </Button>

            <Button
              variant="outlined"
              onClick={() => setType("specialist")}
              sx={{
                width: "200px",
                height: "100px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textTransform: "none",
                borderColor: type === "specialist" ? "#22c55e" : "#ccc",
                borderWidth: 3,
                backgroundColor: type === "specialist" ? "#e8f5e9" : "white",
                color: "#000"
              }}
            >
              <MedicalServicesIcon sx={{ fontSize: 30, color: "#22c55e" }} />
              <Typography variant="body2" fontWeight="bold" sx={{ my: 1 }}>
                Specialist
              </Typography>
              <Typography variant="caption" color="#22c55e">
                Consult and guide clients
              </Typography>
            </Button>
          </Box>

          <Box>
            {/* ===== USER FORM ===== */}
            {type === "user" && (
              <>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                  <TextField
                    {...register("UserName")}
                    label="UserName"
                    type="text"
                    autoComplete="username"
                    sx={fieldSx}
                    InputProps={withIcon(<BadgeIcon />)}
                  />
                  <TextField
                    {...register("FullName")}
                    label="Full Name"
                    type="text"
                    sx={fieldSx}
                    InputProps={withIcon(<PersonIcon />)}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                  <TextField
                    {...register("Email")}
                    label="Email"
                    type="email"
                    sx={fieldSx}
                    InputProps={withIcon(<EmailIcon />)}
                  />
                  <TextField
                    {...register("PhoneNumber")}
                    label="Phone Number"
                    type="tel"
                    sx={fieldSx}
                    InputProps={withIcon(<PhoneIcon />)}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                  <TextField
                    {...register("Gender")}
                    label="Gender"
                    type="text"
                    sx={fieldSx}
                    InputProps={withIcon(<WcIcon />)}
                  />
                  {/* ✅ Password مع show/hide */}
                  <TextField
                    {...register("Password")}
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#16a34a", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                  <TextField
                    {...register("DOF")}
                    label="Date of Birth"
                    type="date"
                    sx={fieldSxSm}
                    InputLabelProps={{ shrink: true }}
                    InputProps={withIcon(<CalendarTodayIcon />)}
                  />
                  <TextField
                    {...register("Weight")}
                    label="Weight (kg)"
                    type="number"
                    sx={fieldSxSm}
                    InputProps={withIcon(<MonitorWeightIcon />)}
                  />
                  <TextField
                    {...register("Height")}
                    label="Height (cm)"
                    type="number"
                    sx={fieldSxSm}
                    InputProps={withIcon(<HeightIcon />)}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                  <TextField
                    {...register("Disease")}
                    label="Disease"
                    type="text"
                    sx={fieldSx}
                    InputProps={withIcon(<HealingIcon />)}
                  />
                  <TextField
                    {...register("Goal")}
                    label="Goal"
                    type="text"
                    sx={fieldSx}
                    InputProps={withIcon(<FlagIcon />)}
                  />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", mt: 2 }}>
                  <TextField
                    {...register("Notes")}
                    label="Optional Health Conditions"
                    placeholder="List any allergies, dietary restrictions, or conditions..."
                    multiline
                    rows={4}
                    sx={{ width: "100%" }}
                    InputProps={withIcon(<InfoIcon />)}
                  />
                </Box>
              </>
            )}

            {/* ===== SPECIALIST FORM ===== */}
            {type === "specialist" && (
              <>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                  <TextField
                    {...register("UserName")}
                    label="UserName"
                    type="text"
                    autoComplete="username"
                    sx={fieldSx}
                    InputProps={withIcon(<BadgeIcon />)}
                  />
                  <TextField
                    {...register("FullName")}
                    label="Full Name"
                    type="text"
                    sx={fieldSx}
                    InputProps={withIcon(<PersonIcon />)}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                  <TextField
                    {...register("Email")}
                    label="Email"
                    type="email"
                    sx={fieldSx}
                    InputProps={withIcon(<EmailIcon />)}
                  />
                  <TextField
                    {...register("PhoneNumber")}
                    label="Phone Number"
                    type="tel"
                    sx={fieldSx}
                    InputProps={withIcon(<PhoneIcon />)}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                  <TextField
                    {...register("Gender")}
                    label="Gender"
                    type="text"
                    sx={fieldSx}
                    InputProps={withIcon(<WcIcon />)}
                  />
                  {/* ✅ Password مع show/hide */}
                  <TextField
                    {...register("Password")}
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#16a34a", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                  <TextField
                    {...register("DOF")}
                    label="Date of Birth"
                    type="date"
                    sx={fieldSx}
                    InputLabelProps={{ shrink: true }}
                    InputProps={withIcon(<CalendarTodayIcon />)}
                  />
                  <TextField
                    {...register("Specialization")}
                    label="Specialization"
                    type="text"
                    sx={fieldSx}
                    InputProps={withIcon(<WorkIcon />)}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                  <TextField
                    {...register("YearsOfExperience")}
                    label="Years of Experience"
                    type="number"
                    sx={fieldSxSm}
                    InputProps={withIcon(<WorkIcon />)}
                  />
                  <TextField
                    {...register("Bio")}
                    label="Bio"
                    type="text"
                    sx={fieldSxSm}
                    InputProps={withIcon(<InfoIcon />)}
                  />
                  <TextField
                    {...register("ConsultationFee")}
                    label="Consultation Fee"
                    type="number"
                    sx={fieldSxSm}
                    InputProps={withIcon(<AttachMoneyIcon />)}
                  />
                </Box>
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 5, backgroundColor: "#22c55e" }}
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>

            <Typography textAlign="center" mt={2}>
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/login"
                underline="hover"
                color="success.main"
                fontWeight="bold"
              >
                Log In
              </Link>
            </Typography>
          </Box>
        </Paper>

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

export default Register;