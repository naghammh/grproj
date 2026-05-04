import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));

      setUser({
        userName:
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
          decoded["unique_name"] ||
          decoded["name"] ||
          decoded["email"] ||
          "User",
        id: decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
      });

      axios
        .get(
          "https://nutrilife.runasp.net/api/MealPlan/clientPlansS/2afec376-23fc-467f-8621-8e0ad752dd99",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => {
          setPlan(res.data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Failed to load meal plan");
          setLoading(false);
        });
    } catch (err) {
      setError("Invalid token");
      setLoading(false);
    }
  }, []);

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          p: 3,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Welcome back, {user?.userName} 👋
      </Typography>

      <Typography color="text.secondary" mb={3}>
        Your health journey is looking great this week.
      </Typography>

      <Card
        sx={{
          borderRadius: 3,
          mb: 4,
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <CardContent>
          <Typography fontWeight="bold" mb={2}>
            Weekly Snapshot
          </Typography>

          <Box display="flex" gap={2}>
            {[60, 80, 90, 50, 85, 30, 70].map((val, i) => (
              <Box
                key={i}
                sx={{
                  width: 30,
                  height: val,
                  bgcolor: i === 5 ? "#facc15" : "primary.main",
                  borderRadius: 2,
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              bgcolor: "background.paper",
              color: "text.primary",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography>Daily Calories</Typography>

              <Typography variant="h4" fontWeight="bold">
                {plan?.calories || 1850}
              </Typography>

              <Typography color="text.secondary">
                Goal: {plan?.goalCalories || 2500} kcal
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              bgcolor: "background.paper",
              color: "text.primary",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography mb={1}>Macros</Typography>

              <Typography fontSize={14}>Carbs</Typography>
              <LinearProgress
                variant="determinate"
                value={plan?.carbs || 60}
                sx={{ mb: 1 }}
              />

              <Typography fontSize={14}>Protein</Typography>
              <LinearProgress
                variant="determinate"
                value={plan?.protein || 40}
                sx={{ mb: 1 }}
              />

              <Typography fontSize={14}>Fats</Typography>
              <LinearProgress variant="determinate" value={plan?.fats || 30} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              bgcolor: "background.paper",
              color: "text.primary",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography>Water</Typography>
              <Typography variant="h5">5 / 8 glasses</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              bgcolor: "background.paper",
              color: "text.primary",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography mb={1}>Meal Plan</Typography>

              {plan?.meals?.length > 0 ? (
                plan.meals.map((meal, index) => (
                  <Typography key={index} fontSize={14}>
                    {meal.mealType}: {meal.mealName}
                  </Typography>
                ))
              ) : (
                <>
                  <Typography fontSize={14}>🍳 Breakfast: Oatmeal</Typography>
                  <Typography fontSize={14}>🥗 Lunch: Chicken Salad</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 3,
              bgcolor: "background.paper",
              color: "text.primary",
            }}
          >
            <CardContent>
              <Typography fontWeight="bold" mb={2}>
                Weight Progress
              </Typography>

              <Box
                sx={{
                  height: 120,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "#e5e7eb",
                  borderRadius: 2,
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              bgcolor: "background.paper",
              color: "text.primary",
            }}
          >
            <CardContent>
              <Typography fontWeight="bold" mb={2}>
                Recent Activity
              </Typography>

              <Typography fontSize={14}>✔ Logged Breakfast</Typography>
              <Typography fontSize={14}>✔ Updated Weight</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
