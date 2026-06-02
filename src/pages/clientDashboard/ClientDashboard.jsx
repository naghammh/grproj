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
  const [progress, setProgress] = useState([]);
  const [weightChange, setWeightChange] = useState(null);
  const [nextMeal, setNextMeal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // حساب أقرب وجبة قادمة
  const calculateNextMeal = (meals) => {
    if (!meals || meals.length === 0) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const sorted = meals
      .map((meal) => {
        if (!meal.mealTime) return null;
        const [hours, minutes] = meal.mealTime.split(":").map(Number);
        const mealMinutes = hours * 60 + minutes;
        return { ...meal, mealMinutes };
      })
      .filter((m) => m !== null)
      .sort((a, b) => a.mealMinutes - b.mealMinutes);

    const upcoming = sorted.find((m) => m.mealMinutes > currentMinutes);
    if (upcoming) {
      const diffMinutes = upcoming.mealMinutes - currentMinutes;
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      let timeStr = "";
      if (hours > 0) timeStr += `${hours}h `;
      if (minutes > 0) timeStr += `${minutes}m`;
      return {
        name: upcoming.mealName || upcoming.mealType,
        time: upcoming.mealTime,
        minutesLeft: diffMinutes,
        display: `${upcoming.mealType || "Meal"} in ${timeStr}`,
      };
    }
    return null;
  };

  // حساب التغير في الوزن
  const calculateWeightChange = (progressData) => {
    if (!progressData || progressData.length < 2) return null;
    const sorted = [...progressData].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastWeight = sorted[0].weight;
    const prevWeight = sorted[1].weight;
    const change = lastWeight - prevWeight;
    return { change, lastWeight, prevWeight };
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      console.log("Decoded token:", decoded); // لمعرفة الحقول المتوفرة

      // محاولة استخراج الاسم من عدة حقول محتملة
      const userName =
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        decoded["name"] ||
        decoded["unique_name"] ||
        decoded["email"] ||
        decoded["given_name"] ||
        decoded["fullName"] ||
        "User";
      const clientId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

      if (!clientId) {
        setError("Client ID not found in token");
        setLoading(false);
        return;
      }

      setUser({ userName, id: clientId });

      // 1. جلب الخطة الحالية
      axios
        .get(`https://nutrilife.runasp.net/api/MealPlan/clientPlans-Summary/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log("PLAN ✅", res.data);
          setPlan(res.data);
          if (res.data?.meals) {
            setNextMeal(calculateNextMeal(res.data.meals));
          }
        })
        .catch((err) => {
          console.log("PLAN ERROR ❌", err.response);
          // لا نضع error عام هنا حتى لا نوقف عرض باقي العناصر
        });

      // 2. جلب تقدم الوزن (مع التأكد من المسار الصحيح)
      // ملاحظة: إذا كان الـ API يحتاج nutritionistId فيجب توفيره. حالياً نستخدم المسار الأصلي.
      axios
        .get(`https://nutrilife.runasp.net/api/Progress/clientProgress/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log("PROGRESS ✅", res.data);
          setProgress(res.data);
          setWeightChange(calculateWeightChange(res.data));
        })
        .catch((err) => {
          console.log("PROGRESS ERROR ❌", err.response);
          if (err.response?.status === 404) {
            console.warn("Progress endpoint may require nutritionistId. Using fallback.");
          }
        });

      setLoading(false);
    } catch (err) {
      console.error("Token decoding error:", err);
      setError("Invalid token");
      setLoading(false);
    }
  }, []);

  const totalPlannedCalories = plan?.meals?.reduce((sum, meal) => sum + (meal.calories || 0), 0) || 0;
  const goalCalories = plan?.goalCalories || 2500;
  const calorieProgressPercent = goalCalories > 0 ? (totalPlannedCalories / goalCalories) * 100 : 0;

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* الترحيب */}
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Welcome back, {user?.userName} 👋
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Your health journey is looking great this week.
      </Typography>

      <Grid container spacing={3}>
        {/* 1. السعرات اليومية */}
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography>Daily Calories</Typography>
              {plan ? (
                <>
                  <Typography variant="h4" fontWeight="bold">
                    {totalPlannedCalories} / {goalCalories}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(calorieProgressPercent, 100)}
                    sx={{ my: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {calorieProgressPercent.toFixed(0)}% of goal
                  </Typography>
                </>
              ) : (
                <Typography color="warning.main" variant="body2">
                  No active meal plan
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 2. الوزن الأسبوعي */}
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography>Weight Progress</Typography>
              {weightChange ? (
                <>
                  <Typography variant="h4" fontWeight="bold">
                    {weightChange.lastWeight} kg
                  </Typography>
                  <Typography
                    color={weightChange.change < 0 ? "success.main" : "error.main"}
                  >
                    {weightChange.change > 0 ? `+${weightChange.change.toFixed(1)}` : `${weightChange.change.toFixed(1)}`} kg this week
                  </Typography>
                </>
              ) : (
                <Typography color="text.secondary">Not enough data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 3. أقرب وجبة */}
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography>Next Meal</Typography>
              {nextMeal ? (
                <>
                  <Typography variant="h6">{nextMeal.name}</Typography>
                  <Typography variant="body2" color="primary">
                    {nextMeal.display}
                  </Typography>
                </>
              ) : (
                <Typography color="text.secondary">No upcoming meals</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 4. الماكروز */}
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography>Macros</Typography>
              {plan ? (
                <>
                  <Typography fontSize={14}>Protein: {plan?.protein || 0}g</Typography>
                  <Typography fontSize={14}>Carbs: {plan?.carbs || 0}g</Typography>
                  <Typography fontSize={14}>Fats: {plan?.fats || 0}g</Typography>
                </>
              ) : (
                <Typography color="text.secondary">No data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}