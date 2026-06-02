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
  IconButton,
  Stack,
  Chip,
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
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AddIcon from "@mui/icons-material/Add";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";

import axios from "axios";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const withIcon = (icon) => ({
  startAdornment: (
    <InputAdornment position="start">
      {React.cloneElement(icon, { sx: { color: "primary.main", fontSize: 20 } })}
    </InputAdornment>
  ),
});

function ArrayInput({ label, icon, value = [], onChange }) {
  const [inputVal, setInputVal] = useState("");

  const handleAdd = () => {
    const trimmed = inputVal.trim();

    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputVal("");
    }
  };

  const handleDelete = (item) => {
    onChange(value.filter((v) => v !== item));
  };

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          label={label}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          fullWidth
          InputProps={withIcon(icon)}
        />

        <IconButton
          onClick={handleAdd}
          sx={{
            bgcolor: "primary.main",
            color: "#fff",
            "&:hover": { bgcolor: "#16a34a" },
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
        {value.map((item) => (
          <Chip
            key={item}
            label={item}
            onDelete={() => handleDelete(item)}
            sx={{
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(34, 197, 94, 0.16)"
                  : "#e8f5e9",
              color: "primary.main",
              fontWeight: 600,
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}

function Register() {
  const [type, setType] = useState("user");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emptyForm = {
    UserName: "",
    FullName: "",
    Email: "",
    PhoneNumber: "",
    Gender: "",
    Password: "",
    DOF: "",
    Weight: "",
    Height: "",
    Disease: "",
    Goal: "",
    Specialization: "",
    YearsOfExperience: "",
    Location: "",
    Bio: "",
    OppeningTime: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const [languages, setLanguages] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [expertIn, setExpertIn] = useState([]);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const navigate = useNavigate();

  const resetForm = (nextType) => {
    setType(nextType);
    setFormData(emptyForm);
    setLanguages([]);
    setCertifications([]);
    setExpertIn([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setFormData((prev) => ({
      ...prev,
      [name]: typeof value === "string" ? value.trimStart() : value,
    }));
  };
  const handleCloseSnackbar = () => setOpen(false);

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/;

  const validateForm = () => {
    if (!formData.UserName.trim()) {
      setMessage("Username is required");
      setOpen(true);
      return false;
    }

    if (formData.UserName.length < 3) {
      setMessage("Username must be at least 3 characters");
      setOpen(true);
      return false;
    }
    if (formData.UserName.length < 3) {
      setMessage("Username must be at least 3 characters");
      setOpen(true);
      return false;
    }

    if (!formData.FullName.trim()) {
      setMessage("Full name is required");
      setOpen(true);
      return false;
    }

    if (!formData.Email.trim()) {
      setMessage("Email is required");
      setOpen(true);
      return false;
    }

    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;

    if (!emailRegex.test(formData.Email)) {
      setMessage("Please enter a valid email address");
      setOpen(true);
      return false;
    }

    if (!formData.PhoneNumber.trim()) {
      setMessage("Phone number is required");
      setOpen(true);
      return false;
    }

    if (!formData.Password) {
      setMessage("Password is required");
      setOpen(true);
      return false;
    }

    if (!strongPasswordRegex.test(formData.Password)) {
      setMessage(
        "Password must be at least 8 characters, contain one uppercase, one lowercase, one digit, and one special character."
      );
      setOpen(true);
      return false;
    }

    if (!formData.DOF) {
      setMessage("Date of birth is required");
      setOpen(true);
      return false;
    }

    if (type === "user") {
      if (!formData.Weight) {
        setMessage("Weight is required");
        setOpen(true);
        return false;
      }

      if (formData.Weight < 10 || formData.Weight > 500) {
        setMessage("Weight must be between 10kg and 500kg");
        setOpen(true);
        return false;
      }

      if (!formData.Height) {
        setMessage("Height is required");
        setOpen(true);
        return false;
      }

      if (formData.Height < 50 || formData.Height > 300) {
        setMessage("Height must be between 50cm and 300cm");
        setOpen(true);
        return false;
      }
    }

    if (type === "specialist") {
      if (!formData.Specialization.trim()) {
        setMessage("Specialization is required");
        setOpen(true);
        return false;
      }

      if (!formData.YearsOfExperience && formData.YearsOfExperience !== 0) {
        setMessage("Years of experience is required");
        setOpen(true);
        return false;
      }

      if (!formData.Location.trim()) {
        setMessage("Location is required");
        setOpen(true);
        return false;
      }

      if (!formData.Bio.trim()) {
        setMessage("Professional bio is required");
        setOpen(true);
        return false;
      }

      if (!formData.OppeningTime.trim()) {
        setMessage("Working hours are required");
        setOpen(true);
        return false;
      }

      if (languages.length === 0) {
        setMessage("Please add at least one language");
        setOpen(true);
        return false;
      }

      if (certifications.length === 0) {
        setMessage("Please add at least one certification");
        setOpen(true);
        return false;
      }

      if (expertIn.length === 0) {
        setMessage("Please add at least one area of expertise");
        setOpen(true);
        return false;
      }
    }

    return true;
  };

  const registerUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    let finalData = { ...formData };

    if (type === "specialist") {
      finalData = {
        UserName: finalData.UserName,
        FullName: finalData.FullName,
        Email: finalData.Email,
        PhoneNumber: finalData.PhoneNumber,
        Gender: finalData.Gender,
        Password: finalData.Password,
        DOF: finalData.DOF,
        Specialization: finalData.Specialization,
        YearsOfExperience: Number(finalData.YearsOfExperience),
        Bio: finalData.Bio,
        Location: finalData.Location,
        Languages: languages,
        OppeningTime: finalData.OppeningTime,
        Certifications: certifications,
        ExpertIn: expertIn,
      };
    } else {
      finalData = {
        UserName: finalData.UserName,
        FullName: finalData.FullName,
        Email: finalData.Email,
        PhoneNumber: finalData.PhoneNumber,
        Gender: finalData.Gender,
        Password: finalData.Password,
        DOF: finalData.DOF,
        Height: String(finalData.Height),
        Weight: String(finalData.Weight),
      };

      if (formData.Disease) finalData.Disease = formData.Disease;
      if (formData.Goal) finalData.Goal = formData.Goal;
    }

    Object.keys(finalData).forEach((key) => {
      if (
        finalData[key] === "" ||
        finalData[key] === null ||
        finalData[key] === undefined
      ) {
        delete finalData[key];
      }
    });

    try {
      setLoading(true);

      const url =
        type === "specialist"
          ? "https://nutrilife.runasp.net/api/Account/register/nutritionist"
          : "https://nutrilife.runasp.net/api/Account/Register";

          const response = await axios.post(url, finalData);

          console.log("API Response:", response.data);
          
          if (response.data.success === false) {
            setMessage(response.data.message || "Registration failed");
            setSeverity("error");
            setOpen(true);
            return;
          }
          
          setMessage("Account created successfully!");
          setSeverity("success");
          setOpen(true);
          
          if (type === "specialist") {
            localStorage.setItem(
              "justRegisteredSpecialist",
              JSON.stringify(finalData)
            );
          }
          
          setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Registration error:", error);

      let errorMsg = "Registration failed. Please check your data.";

      if (error.response?.data) {
        const data = error.response.data;

        if (data.errors) {
          const allErrors = Object.values(data.errors).flat();
          errorMsg = allErrors.join(" ");
        } else if (data.message) {
          errorMsg = data.message;
        } else if (data.title) {
          errorMsg = data.title;
        }
      }

      setMessage(errorMsg);
      setSeverity("error");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="sm" sx={{ py: 5 }}>
        <Typography
          variant="h4"
          textAlign="center"
          mb={1}
          sx={{ fontWeight: 900, color: "text.primary" }}
        >
          Create Your Account
        </Typography>

        <Typography
          sx={{ color: "primary.main", mb: 4 }}
          textAlign="center"
          fontWeight={500}
        >
          Join NutriLife and start your journey.
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            color: "text.primary",
            backgroundImage: "none",
          }}
        >
          <Typography
            mb={3}
            textAlign="center"
            fontWeight={700}
            color="text.secondary"
            variant="body2"
          >
            I AM JOINING AS A...
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4 }}>
            <Button
              variant="outlined"
              onClick={() => resetForm("user")}
              sx={{
                flex: 1,
                height: "90px",
                flexDirection: "column",
                borderColor: type === "user" ? "primary.main" : "divider",
                borderWidth: 2,
                bgcolor: (theme) =>
                  type === "user"
                    ? theme.palette.mode === "dark"
                      ? "rgba(34, 197, 94, 0.16)"
                      : "#f0fdf4"
                    : "transparent",
                color: "text.primary",
                "&:hover": {
                  borderWidth: 2,
                  borderColor: "primary.main",
                },
              }}
            >
              <PersonIcon sx={{ mb: 0.5, color: "primary.main" }} />
              <Typography variant="caption" fontWeight="bold">
                User (Client)
              </Typography>
            </Button>

            <Button
              variant="outlined"
              onClick={() => resetForm("specialist")}
              sx={{
                flex: 1,
                height: "90px",
                flexDirection: "column",
                borderColor:
                  type === "specialist" ? "primary.main" : "divider",
                borderWidth: 2,
                bgcolor: (theme) =>
                  type === "specialist"
                    ? theme.palette.mode === "dark"
                      ? "rgba(34, 197, 94, 0.16)"
                      : "#f0fdf4"
                    : "transparent",
                color: "text.primary",
                "&:hover": {
                  borderWidth: 2,
                  borderColor: "primary.main",
                },
              }}
            >
              <MedicalServicesIcon sx={{ mb: 0.5, color: "primary.main" }} />
              <Typography variant="caption" fontWeight="bold">
                Specialist
              </Typography>
            </Button>
          </Box>

          <form onSubmit={registerUser}>
            <Stack spacing={2.5}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  name="UserName"
                  value={formData.UserName}
                  onChange={handleChange}
                  label="Username"
                  InputProps={withIcon(<BadgeIcon />)}
                />

                <TextField
                  fullWidth
                  name="FullName"
                  value={formData.FullName}
                  onChange={handleChange}
                  label="Full Name"
                  InputProps={withIcon(<PersonIcon />)}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  label="Email Address"
                  type="email"
                  InputProps={withIcon(<EmailIcon />)}
                />

                <TextField
                  fullWidth
                  name="PhoneNumber"
                  value={formData.PhoneNumber}
                  onChange={handleChange}
                  label="Phone Number"
                  InputProps={withIcon(<PhoneIcon />)}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleChange}
                  label="Gender"
                  placeholder="e.g. Male/Female"
                  InputProps={withIcon(<WcIcon />)}
                />

                <TextField
                  fullWidth
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "primary.main", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ color: "text.secondary" }}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              <TextField
                fullWidth
                name="DOF"
                value={formData.DOF}
                onChange={handleChange}
                label="Birth Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                InputProps={withIcon(<CalendarTodayIcon />)}
              />

              {type === "user" ? (
                <>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      fullWidth
                      name="Weight"
                      value={formData.Weight}
                      onChange={handleChange}
                      label="Weight (kg)"
                      type="number"
                      InputProps={withIcon(<MonitorWeightIcon />)}
                      required
                    />

                    <TextField
                      fullWidth
                      name="Height"
                      value={formData.Height}
                      onChange={handleChange}
                      label="Height (cm)"
                      type="number"
                      InputProps={withIcon(<HeightIcon />)}
                      required
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      fullWidth
                      name="Disease"
                      value={formData.Disease}
                      onChange={handleChange}
                      label="Current Diseases"
                      placeholder="None if healthy"
                      InputProps={withIcon(<HealingIcon />)}
                    />

                    <TextField
                      fullWidth
                      name="Goal"
                      value={formData.Goal}
                      onChange={handleChange}
                      label="Your Goal"
                      placeholder="e.g. Weight Loss"
                      InputProps={withIcon(<FlagIcon />)}
                    />
                  </Stack>
                </>
              ) : (
                <>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      fullWidth
                      name="Specialization"
                      value={formData.Specialization}
                      onChange={handleChange}
                      label="Specialization"
                      placeholder="e.g. Clinical Nutrition"
                      InputProps={withIcon(<WorkIcon />)}
                      required
                    />

                    <TextField
                      fullWidth
                      name="YearsOfExperience"
                      value={formData.YearsOfExperience}
                      onChange={handleChange}
                      label="Years of Exp"
                      type="number"
                      InputProps={withIcon(<WorkIcon />)}
                      required
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      fullWidth
                      name="Location"
                      value={formData.Location}
                      onChange={handleChange}
                      label="Clinic Location"
                      placeholder="City, Street"
                      InputProps={withIcon(<InfoIcon />)}
                      required
                    />
                  </Stack>

                  <TextField
                    name="Bio"
                    value={formData.Bio}
                    onChange={handleChange}
                    label="Professional Bio"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Write a brief about your experience..."
                    InputProps={withIcon(<InfoIcon />)}
                    required
                  />

                  <TextField
                    name="OppeningTime"
                    value={formData.OppeningTime}
                    onChange={handleChange}
                    label="Working Hours"
                    placeholder="e.g. Sun-Thu 8:00-12:00"
                    fullWidth
                    InputProps={withIcon(<CalendarTodayIcon />)}
                    required
                  />

                  <ArrayInput
                    label="Languages (Press Enter to add)"
                    icon={<InfoIcon />}
                    value={languages}
                    onChange={setLanguages}
                  />

                  <ArrayInput
                    label="Certifications"
                    icon={<SchoolIcon />}
                    value={certifications}
                    onChange={setCertifications}
                  />

                  <ArrayInput
                    label="Expert In (Specialties)"
                    icon={<StarIcon />}
                    value={expertIn}
                    onChange={setExpertIn}
                  />
                </>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.8,
                  bgcolor: "primary.main",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "1rem",
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.25)",
                  "&:hover": { bgcolor: "#16a34a" },
                }}
              >
                {loading ? "Processing..." : "Create NutriLife Account"}
              </Button>

              <Typography textAlign="center" variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/login"
                  underline="none"
                  sx={{ color: "primary.main", fontWeight: 700 }}
                >
                  Sign In
                </Link>
              </Typography>
            </Stack>
          </form>
        </Paper>

        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity={severity}
            variant="filled"
            onClose={handleCloseSnackbar}
            sx={{ width: "100%" }}
          >
            {message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default Register;
