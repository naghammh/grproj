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
  TextField
} from "@mui/material";

function Dashboardspecialist() {
  const [nutritionists, setNutritionists] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ جلب الأخصائيين
  useEffect(() => {
    const fetchNutritionists = async () => {
      try {
        const response = await fetch("https://nutrilife.runasp.net/api/Account/allNutritionists");
        const data = await response.json();
        setNutritionists(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNutritionists();
  }, []);

  // ✅ جلب المستخدم من localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
  }, []);

  return (
    <Box sx={{ display: "flex", bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Box sx={{ flexGrow: 1, p: 4, minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography variant="h5">
              Welcome back, {currentUser ? currentUser.fullName : "nutritionist"}
            </Typography>
            <Typography color="gray">
              Today is Monday, October 24th, 2023
            </Typography>
          </Box>

          <TextField size="small" placeholder="Search clients..." />
        </Box>

        {/* Cards */}
        <Grid container spacing={2}>
          {[
            { title: "Total Nutritionists", value: nutritionists.length },
            { title: "Active Programs", value: "18" },
            { title: "Appointments", value: "6" },
            { title: "Pending Tasks", value: "9" },
          ].map((card) => (
            <Grid item xs={12} sm={6} md={3} lg={3} key={card.title}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Typography color="gray">{card.title}</Typography>
                <Typography variant="h5">{card.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Middle Section */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {/* Schedule */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" mb={2}>
                Today’s Schedule
              </Typography>

              {nutritionists.slice(0, 3).map((n) => (
                <Box
                  key={n.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: "#f9f9f9",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography>{n.specialization}</Typography>
                    <Typography fontWeight="bold">{n.fullName}</Typography>
                  </Box>

                  <Button variant="contained" color="success">
                    View
                  </Button>
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" mb={2}>
                Quick Actions
              </Typography>

              <Button
                fullWidth
                variant="contained"
                color="success"
                sx={{ mb: 1 }}
              >
                Add New Client
              </Button>

              <Button fullWidth sx={{ mb: 1 }}>
                Create Meal Plan
              </Button>

              <Button fullWidth>Broadcast Message</Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {/* Progress */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" mb={2}>
                Recent Nutritionists
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                {nutritionists.slice(0, 2).map((n) => (
                  <Paper key={n.id} sx={{ p: 3, flex: 1 }}>
                    <Typography>{n.fullName}</Typography>
                    <Typography color="gray">
                      {n.yearsOfExperience} years exp
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Notifications */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" mb={2}>
                Notifications
              </Typography>

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

export default Dashboardspecialist;