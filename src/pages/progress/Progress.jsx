import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FitnessCenter as FitnessCenterIcon,
  WaterDrop as WaterIcon,
  LocalFireDepartment as CaloriesIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Progress() {
  const [openWeightDialog, setOpenWeightDialog] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newDate, setNewDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [weightData, setWeightData] = useState([
    { date: "01/01", weight: 75 },
    { date: "05/01", weight: 74.5 },
    { date: "10/01", weight: 74 },
    { date: "15/01", weight: 73.2 },
    { date: "20/01", weight: 72.8 },
  ]);

  const [dailyMeals, setDailyMeals] = useState([
    { id: 1, meal: "الإفطار", calories: 350, protein: 15, carbs: 45, fats: 10, completed: true },
    { id: 2, meal: "وجبة خفيفة", calories: 120, protein: 5, carbs: 18, fats: 4, completed: true },
    { id: 3, meal: "الغداء", calories: 550, protein: 35, carbs: 60, fats: 18, completed: false },
    { id: 4, meal: "وجبة خفيفة", calories: 150, protein: 8, carbs: 15, fats: 6, completed: false },
    { id: 5, meal: "العشاء", calories: 400, protein: 25, carbs: 35, fats: 12, completed: false },
  ]);

  const weeklyAchievements = {
    workouts: 3,
    workoutGoal: 5,
    waterIntake: 28,
    waterGoal: 56,
    mealsLogged: 18,
    mealGoal: 35,
    weightLost: 2.2,
    weightGoal: 5,
  };

  const totalCalories = dailyMeals.reduce(
    (sum, meal) => sum + (meal.completed ? meal.calories : 0),
    0
  );
  const goalCalories = 2500;
  const caloriesPercentage = (totalCalories / goalCalories) * 100;

  const handleAddWeight = () => {
    if (newWeight) {
      const newDateObj = { date: newDate, weight: parseFloat(newWeight) };
      setWeightData([...weightData, newDateObj]);
      setNewWeight("");
      setOpenWeightDialog(false);
    }
  };

  const handleToggleMeal = (id) => {
    setDailyMeals((prev) =>
      prev.map((meal) =>
        meal.id === id ? { ...meal, completed: !meal.completed } : meal
      )
    );
  };

  const macroData = [
    { name: "بروتين", value: 88, target: 120, color: "#4caf50" },
    { name: "كربوهيدرات", value: 158, target: 250, color: "#ff9800" },
    { name: "دهون", value: 50, target: 70, color: "#f44336" },
  ];

  const currentWeight = weightData[weightData.length - 1]?.weight || 0;
  const previousWeight =
    weightData[weightData.length - 2]?.weight || currentWeight;
  const firstWeight = weightData[0]?.weight || currentWeight;
  const weightDifference = (firstWeight - currentWeight).toFixed(1);

  const StatCard = ({ icon, label, value, progress, color = "primary.light" }) => (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: "background.paper",
        color: "text.primary",
        border: "1px solid",
        borderColor: "divider",
        backgroundImage: "none",
        height: "100%",
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: color, color: "#fff" }}>{icon}</Avatar>

          <Box>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5">{value}</Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mt: 2, height: 8, borderRadius: 4 }}
        />
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
      }}
    >
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: "primary.main",
          color: "#fff",
          backgroundImage: "none",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          تقدمي
        </Typography>

        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
          تابع تطورك وأنجز أهدافك الصحية
        </Typography>
      </Paper>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
          color: "text.primary",
          border: "1px solid",
          borderColor: "divider",
          backgroundImage: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            تقدم الوزن
          </Typography>

          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            onClick={() => setOpenWeightDialog(true)}
          >
            إضافة قياس
          </Button>
        </Box>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.35)" />
            <XAxis dataKey="date" stroke="currentColor" />
            <YAxis domain={["auto", "auto"]} stroke="currentColor" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#4caf50"
              strokeWidth={3}
              dot={{ fill: "#4caf50", r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            mt: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              الوزن السابق
            </Typography>
            <Typography variant="h6">{previousWeight} كجم</Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              الوزن الحالي
            </Typography>
            <Typography variant="h6" color="primary.main">
              {currentWeight} كجم
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              الفرق الكلي
            </Typography>

            <Typography
              variant="h6"
              color={currentWeight < firstWeight ? "success.main" : "error.main"}
            >
              {weightDifference} كجم
              {currentWeight < firstWeight ? (
                <TrendingDownIcon fontSize="small" sx={{ ml: 0.5 }} />
              ) : (
                <TrendingUpIcon fontSize="small" sx={{ ml: 0.5 }} />
              )}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Typography variant="h6" fontWeight="bold" mb={2}>
        إنجازات هذا الأسبوع
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<FitnessCenterIcon />}
            label="تمارين"
            value={`${weeklyAchievements.workouts} / ${weeklyAchievements.workoutGoal}`}
            progress={(weeklyAchievements.workouts / weeklyAchievements.workoutGoal) * 100}
            color="primary.light"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<WaterIcon />}
            label="شرب الماء"
            value={`${weeklyAchievements.waterIntake} / ${weeklyAchievements.waterGoal}`}
            progress={(weeklyAchievements.waterIntake / weeklyAchievements.waterGoal) * 100}
            color="info.light"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CaloriesIcon />}
            label="وجبات مسجلة"
            value={`${weeklyAchievements.mealsLogged} / ${weeklyAchievements.mealGoal}`}
            progress={(weeklyAchievements.mealsLogged / weeklyAchievements.mealGoal) * 100}
            color="warning.light"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<FitnessCenterIcon />}
            label="الوزن المفقود"
            value={`${weeklyAchievements.weightLost} / ${weeklyAchievements.weightGoal}`}
            progress={(weeklyAchievements.weightLost / weeklyAchievements.weightGoal) * 100}
            color="success.light"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              height: "100%",
              bgcolor: "background.paper",
              color: "text.primary",
              border: "1px solid",
              borderColor: "divider",
              backgroundImage: "none",
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>
              وجبات اليوم
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>الوجبة</TableCell>
                    <TableCell align="center">سعرات</TableCell>
                    <TableCell align="center">بروتين</TableCell>
                    <TableCell align="center">كارب</TableCell>
                    <TableCell align="center">دهون</TableCell>
                    <TableCell align="center">الحالة</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {dailyMeals.map((meal) => (
                    <TableRow key={meal.id} sx={{ opacity: meal.completed ? 1 : 0.6 }}>
                      <TableCell>{meal.meal}</TableCell>
                      <TableCell align="center">{meal.calories}</TableCell>
                      <TableCell align="center">{meal.protein}g</TableCell>
                      <TableCell align="center">{meal.carbs}g</TableCell>
                      <TableCell align="center">{meal.fats}g</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleToggleMeal(meal.id)}
                        >
                          <CheckIcon color={meal.completed ? "success" : "disabled"} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow
                    sx={{
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.06)"
                          : "grey.50",
                    }}
                  >
                    <TableCell>
                      <strong>المجموع</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>{totalCalories}</strong> / {goalCalories}
                    </TableCell>
                    <TableCell align="center">-</TableCell>
                    <TableCell align="center">-</TableCell>
                    <TableCell align="center">-</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <LinearProgress
              variant="determinate"
              value={Math.min(caloriesPercentage, 100)}
              sx={{ mt: 2, height: 10, borderRadius: 5 }}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              {totalCalories} من {goalCalories} سعرة حرارية
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "background.paper",
              color: "text.primary",
              border: "1px solid",
              borderColor: "divider",
              backgroundImage: "none",
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>
              الماكروز اليومية
            </Typography>

            {macroData.map((item) => (
              <Box key={item.name} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">{item.name}</Typography>
                  <Typography variant="body2">
                    {item.value}g / {item.target}g
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={Math.min((item.value / item.target) * 100, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.08)"
                        : "#e0e0e0",
                    "& .MuiLinearProgress-bar": { bgcolor: item.color },
                  }}
                />
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary" align="center">
              الهدف اليومي: {goalCalories} سعرة حرارية
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openWeightDialog}
        onClose={() => setOpenWeightDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle>إضافة قياس جديد</DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="الوزن (كجم)"
            type="number"
            fullWidth
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />

          <TextField
            label="التاريخ"
            type="date"
            fullWidth
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenWeightDialog(false)}>إلغاء</Button>
          <Button onClick={handleAddWeight} variant="contained">
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Progress;
