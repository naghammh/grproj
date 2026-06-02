import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Avatar
} from "@mui/material";
import axios from "axios";
import Specialist from './../specialist/Specialist';

function SpecialistDashboard() {
  const [nutritionists, setNutritionists] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileImg, setProfileImg] = useState(null);

  /* =========================
     🟢 API 1: allNutritionists
     مكانه: الكارد + السكجول + recent
  ========================= */
  useEffect(() => {
    const fetchNutritionists = async () => {
      try {
        const res = await axios.get(
          "https://nutrilife.runasp.net/api/Account/allNutritionists"
        );
        setNutritionists(res.data);
      } catch (err) {
        console.error("Nutritionists error:", err);
      }
    };

    fetchNutritionists();
  }, []);

  /* =========================
     🟢 API 2: GetProfileImg
     مكانه: الهيدر (صورة المستخدم)
  ========================= */
  useEffect(() => {
    const fetchProfileImg = async () => {
      try {
        const res = await axios.get(
          "https://nutrilife.runasp.net/api/Account/myprofileimg"
        );
        setProfileImg(res.data);
      } catch (err) {
        console.log("Profile image error:", err);
      }
    };

    fetchProfileImg();
  }, []);

  /* =========================
     🟢 localStorage user
     مكانه: Welcome message
  ========================= */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
  }, []);

  /* =========================
     🟢 API 3: ClientRegister
     مكانه: زر Add New Client
  ========================= */
  const handleAddClient = async () => {
    try {
      await axios.post("https://nutrilife.runasp.net/api/Account/Register ", {
        // data لاحقاً (name, email, etc)
      });

      alert("Client Added!");
    } catch (err) {
      console.log("Add client error:", err);
    }
  };

  return (
    <Box sx={{ display: "flex", bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Box sx={{ flexGrow: 1, p: 4 }}>

        {/* ================= HEADER ================= */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>

          {/* 🟢 user + profile image API هنا */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={profileImg} />

            <Box>
              <Typography variant="h5">
                Welcome back, {currentUser ? currentUser.fullName : "User"}
              </Typography>

              <Typography color="gray">
                Today is Monday, October 24th, 2023
              </Typography>
            </Box>
          </Box>

          <TextField size="small" placeholder="Search clients..." />
        </Box>

        {/* ================= CARDS ================= */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography>Total Nutritionists</Typography>
              <Typography variant="h5">{nutritionists.length}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography>Active Programs</Typography>
              <Typography variant="h5">18</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography>Appointments</Typography>
              <Typography variant="h5">6</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography>Pending Tasks</Typography>
              <Typography variant="h5">9</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ================= MIDDLE ================= */}
        <Grid container spacing={2} sx={{ mt: 2 }}>

          {/* 🟢 allNutritionists API هنا (schedule) */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Today’s Schedule</Typography>

              {nutritionists.slice(0, 3).map((n) => (
                <Box key={n.id} sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 2,
                  mt: 1,
                  bgcolor: "#f9f9f9"
                }}>
                  <Box>
                    <Typography>{n.specialization}</Typography>
                    <Typography fontWeight="bold">{n.fullName}</Typography>
                  </Box>

                  <Button variant="contained">View</Button>
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* 🟢 Subscription ممكن ينضاف هنا لاحقاً */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Quick Actions</Typography>

              {/* 🟢 ClientRegister API هنا */}
              <Button
                fullWidth
                variant="contained"
                sx={{ mb: 1 }}
                onClick={handleAddClient}
              >
                Add New Client
              </Button>

              <Button fullWidth sx={{ mb: 1 }}>
                Create Meal Plan
              </Button>

              <Button fullWidth>
                Broadcast Message
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* ================= BOTTOM ================= */}
        <Grid container spacing={2} sx={{ mt: 2 }}>

          {/* 🟢 allNutritionists API (recent section) */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Recent Nutritionists</Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                {nutritionists.slice(0, 2).map((n) => (
                  <Paper key={n.id} sx={{ p: 2, flex: 1 }}>
                    <Typography>{n.fullName}</Typography>
                    <Typography color="gray">
                      {n.yearsOfExperience} years exp
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Notifications (static حاليا) */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Notifications</Typography>

              <List>
                <ListItem>
                  <ListItemText primary="Client updated food log" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="Weekly report ready" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="Missing data from client" />
                </ListItem>
              </List>
            </Paper>
          </Grid>

        </Grid>

      </Box>
    </Box>
  );
}
 
export default SpecialistDashboard;