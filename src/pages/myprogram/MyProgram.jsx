import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";

import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  WaterDrop as WaterIcon,
  Today as TodayIcon,
} from "@mui/icons-material";

import axios from "axios";

export default function MyProgram() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [program, setProgram] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Safe token decode
        let decoded = {};

        try {
          decoded = JSON.parse(atob(token.split(".")[1]));
        } catch {
          throw new Error("Invalid token");
        }

        const clientId =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];

        if (!clientId) {
          throw new Error("Client ID not found in token");
        }

        // Fetch client plans
        const plansRes = await axios.get(
          `https://nutrilife.runasp.net/api/MealPlan/clientPlansS/${clientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Plans response:", plansRes.data);

        const plans = plansRes.data;

        // No plans yet
        if (!plans || plans.length === 0) {
          setProgram({
            startDate: null,
            endDate: null,
            nutritionist: {
              name: "No Nutritionist Yet",
              image:
                "https://cdn-icons-png.flaticon.com/512/2922/2922510.png",
            },
            weeklyPlan: [],
            dailyGoal: {
              calories: 0,
              protein: 0,
              carbs: 0,
              fats: 0,
            },
          });

          setLoading(false);
          return;
        }

        // Current plan
        const currentPlan = plans[0];
        const planId = currentPlan.id || currentPlan.planId;

        // Fetch plan details
        const planDetailsRes = await axios.get(
          `https://nutrilife.runasp.net/api/MealPlan/getplan/${planId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Plan details:", planDetailsRes.data);

        const planData = planDetailsRes.data;

        // Fetch nutritionist info
        let nutritionist = null;

        if (planData.nutritionistId) {
          try {
            const nutriRes = await axios.get(
              `https://nutrilife.runasp.net/api/NutritionistPlans/GetNutri/${planData.nutritionistId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            nutritionist = nutriRes.data;
          } catch (err) {
            console.warn("Could not fetch nutritionist:", err);
          }
        }

        const weeklyPlan = planData.weeklyPlan || planData.days || [];

        const dailyGoal = {
          calories:
            planData.goalCalories ||
            currentPlan.goalCalories ||
            2000,

          protein:
            planData.proteinGoal ||
            currentPlan.protein ||
            0,

          carbs:
            planData.carbsGoal ||
            currentPlan.carbs ||
            0,

          fats:
            planData.fatsGoal ||
            currentPlan.fats ||
            0,
        };

        setProgram({
          startDate:
            planData.startDate ||
            currentPlan.startDate ||
            null,

          endDate:
            planData.endDate ||
            currentPlan.endDate ||
            null,

          nutritionist: {
            name:
              nutritionist?.name ||
              nutritionist?.fullName ||
              "Your Nutritionist",

            image:
              nutritionist?.imageUrl ||
              "https://randomuser.me/api/portraits/women/1.jpg",
          },

          weeklyPlan: weeklyPlan.map((day) => ({
            day: day.dayName || day.day,

            date: day.date,

            meals: (day.meals || []).map((meal) => ({
              name: meal.mealType || meal.name,

              time: meal.mealTime,

              foods:
                meal.foods ||
                meal.description ||
                "No foods listed",

              calories: meal.calories || 0,

              completed: meal.completed || false,
            })),

            waterIntake: day.waterIntake || 0,

            waterGoal: day.waterGoal || 8,

            exercises: day.exercises || [],
          })),

          dailyGoal,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching program:", err);

        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load program data"
        );

        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle meal completion safely
  const handleToggleMealComplete = (dayIndex, mealIndex) => {
    setProgram((prev) => ({
      ...prev,

      weeklyPlan: prev.weeklyPlan.map((day, dIdx) =>
        dIdx === dayIndex
          ? {
              ...day,

              meals: day.meals.map((meal, mIdx) =>
                mIdx === mealIndex
                  ? {
                      ...meal,
                      completed: !meal.completed,
                    }
                  : meal
              ),
            }
          : day
      ),
    }));
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Empty state
  if (!program || program.weeklyPlan.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          textAlign: "center",
          p: 3,
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
          alt="No Plan"
          width={180}
        />

        <Typography variant="h5" fontWeight="bold" mt={3}>
          No Active Meal Plan Yet
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          mt={1}
        >
          Your nutritionist has not assigned a nutrition
          program yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        p: 3,
      }}
    >
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: "primary.main",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold">
              My Nutrition Program
            </Typography>

            <Typography
              variant="body2"
              sx={{ mt: 1, opacity: 0.9 }}
            >
              {program.startDate && program.endDate
                ? `${program.startDate} — ${program.endDate}`
                : "No active period"}
            </Typography>
          </Box>

          <Chip
            avatar={
              <Avatar src={program.nutritionist.image} />
            }
            label={`With: ${program.nutritionist.name}`}
            sx={{
              bgcolor: "#fff",
              color: "primary.main",
              fontWeight: "bold",
            }}
          />
        </Box>
      </Paper>

      {/* Daily Goals */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          mb={2}
        >
          Daily Goals
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Card
              variant="outlined"
              sx={{
                textAlign: "center",
                p: 1,
              }}
            >
              <Typography
                variant="h4"
                color="primary.main"
              >
                {program.dailyGoal.calories}
              </Typography>

              <Typography variant="body2">
                Calories
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card
              variant="outlined"
              sx={{
                textAlign: "center",
                p: 1,
              }}
            >
              <Typography
                variant="h4"
                color="primary.main"
              >
                {program.dailyGoal.protein}g
              </Typography>

              <Typography variant="body2">
                Protein
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card
              variant="outlined"
              sx={{
                textAlign: "center",
                p: 1,
              }}
            >
              <Typography
                variant="h4"
                color="primary.main"
              >
                {program.dailyGoal.carbs}g
              </Typography>

              <Typography variant="body2">
                Carbs
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card
              variant="outlined"
              sx={{
                textAlign: "center",
                p: 1,
              }}
            >
              <Typography
                variant="h4"
                color="primary.main"
              >
                {program.dailyGoal.fats}g
              </Typography>

              <Typography variant="body2">
                Fats
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Weekly Plan */}
      <Typography
        variant="h6"
        fontWeight="bold"
        mb={2}
      >
        Weekly Plan
      </Typography>

      {program.weeklyPlan.map((day, dayIdx) => (
        <Paper
          key={dayIdx}
          sx={{
            mb: 3,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {/* Day Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: "primary.light",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar
              sx={{
                bgcolor: "#fff",
                color: "primary.main",
              }}
            >
              <TodayIcon />
            </Avatar>

            <Typography
              variant="h6"
              sx={{ flex: 1 }}
            >
              {day.day}{" "}
              {day.date && `(${day.date})`}
            </Typography>

            <Chip
              size="small"
              label={`Water: ${day.waterIntake}/${day.waterGoal}`}
              icon={<WaterIcon />}
              color={
                day.waterIntake >= day.waterGoal
                  ? "success"
                  : "default"
              }
              sx={{ bgcolor: "#fff" }}
            />
          </Box>

          {/* Water Progress */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body2">
                Water Intake
              </Typography>

              <Typography
                variant="body2"
                fontWeight="bold"
              >
                {day.waterIntake} / {day.waterGoal} cups
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={
                day.waterGoal
                  ? (day.waterIntake /
                      day.waterGoal) *
                    100
                  : 0
              }
              sx={{
                height: 8,
                borderRadius: 4,
              }}
            />
          </Box>

          {/* Meals Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="5%">
                    Status
                  </TableCell>

                  <TableCell width="20%">
                    Meal
                  </TableCell>

                  <TableCell width="15%">
                    Time
                  </TableCell>

                  <TableCell width="40%">
                    Foods
                  </TableCell>

                  <TableCell width="10%">
                    Calories
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(day.meals || []).map(
                  (meal, mealIdx) => (
                    <TableRow key={mealIdx}>
                      <TableCell>
                        <IconButton
                          onClick={() =>
                            handleToggleMealComplete(
                              dayIdx,
                              mealIdx
                            )
                          }
                        >
                          {meal.completed ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <UncheckedIcon />
                          )}
                        </IconButton>
                      </TableCell>

                      <TableCell>
                        {meal.name}
                      </TableCell>

                      <TableCell>
                        {meal.time}
                      </TableCell>

                      <TableCell>
                        {meal.foods}
                      </TableCell>

                      <TableCell>
                        {meal.calories}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Exercises */}
          {day.exercises &&
            day.exercises.length > 0 && (
              <Box
                sx={{
                  p: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  mb={1}
                >
                  Exercises
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {day.exercises.map((ex, idx) => (
                    <Chip
                      key={idx}
                      label={ex}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
        </Paper>
      ))}
    </Box>
  );
}