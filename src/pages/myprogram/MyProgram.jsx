import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  FitnessCenter as ExerciseIcon,
  WaterDrop as WaterIcon,
  Today as TodayIcon,
} from "@mui/icons-material";

function MyProgram() {
  const [expandedDay, setExpandedDay] = useState(null);

  const program = {
    startDate: "2026-01-15",
    endDate: "2026-02-15",
    nutritionist: {
      name: "Dr.sara",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    weeklyPlan: [
      {
        day: "saturday",
        date: "2026-01-20",
        meals: [
          { name: "الإفطار", time: "8:00 ص", foods: "شوفان مع حليب لوز + موز", calories: 350, completed: true },
          { name: "وجبة خفيفة", time: "11:00 ص", foods: "تفاحة + 10 حبات لوز", calories: 150, completed: true },
          { name: "الغداء", time: "2:00 م", foods: "صدر دجاج مشوي + أرز بني + سلطة", calories: 550, completed: false },
          { name: "وجبة خفيفة", time: "5:00 م", foods: "زبادي يوناني", calories: 120, completed: false },
          { name: "العشاء", time: "8:00 م", foods: "سمك مشوي + خضار مشوية", calories: 400, completed: false },
        ],
        waterIntake: 3,
        waterGoal: 8,
        exercises: ["مشي 30 دقيقة", "تمارين إطالة"],
      },
      {
        day: "sunday",
        date: "2026-01-21",
        meals: [
          { name: "الإفطار", time: "8:00 ص", foods: "بيض مسلوق + توست أسمر", calories: 300, completed: false },
          { name: "وجبة خفيفة", time: "11:00 ص", foods: "برتقالة", calories: 80, completed: false },
          { name: "الغداء", time: "2:00 م", foods: "لحم مشوي + بطاطا حلوة", calories: 600, completed: false },
          { name: "وجبة خفيفة", time: "5:00 م", foods: "حفنة مكسرات", calories: 200, completed: false },
          { name: "العشاء", time: "8:00 م", foods: "سلطة تونة", calories: 350, completed: false },
        ],
        waterIntake: 0,
        waterGoal: 8,
        exercises: ["تمارين مقاومة 20 دقيقة"],
      },
    ],
    dailyGoal: {
      calories: 2500,
      protein: 120,
      carbs: 250,
      fats: 70,
    },
  };

  const handleAccordionChange = (day) => (event, isExpanded) => {
    setExpandedDay(isExpanded ? day : null);
  };

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
              برنامجي الغذائي
            </Typography>

            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              من {program.startDate} إلى {program.endDate}
            </Typography>
          </Box>

          <Chip
            avatar={<Avatar src={program.nutritionist.image} />}
            label={`مع: ${program.nutritionist.name}`}
            sx={{
              bgcolor: "#fff",
              color: "primary.main",
              fontWeight: "bold",
            }}
          />
        </Box>
      </Paper>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
          color: "text.primary",
          backgroundImage: "none",
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2}>
          الهدف اليومي
        </Typography>

        <Grid container spacing={2}>
          {[
            { value: program.dailyGoal.calories, label: "سعرة حرارية" },
            { value: `${program.dailyGoal.protein}g`, label: "بروتين" },
            { value: `${program.dailyGoal.carbs}g`, label: "كربوهيدرات" },
            { value: `${program.dailyGoal.fats}g`, label: "دهون" },
          ].map((item, index) => (
            <Grid key={index} item xs={6} sm={3}>
              <Card
                variant="outlined"
                sx={{
                  textAlign: "center",
                  p: 1,
                  bgcolor: "background.default",
                  color: "text.primary",
                  borderColor: "divider",
                }}
              >
                <Typography variant="h4" color="primary.main">
                  {item.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Typography variant="h6" fontWeight="bold" mb={2}>
        خطة الأسبوع
      </Typography>

      {program.weeklyPlan.map((day, index) => (
        <Accordion
          key={index}
          expanded={expandedDay === day.day}
          onChange={handleAccordionChange(day.day)}
          sx={{
            mb: 2,
            borderRadius: 2,
            bgcolor: "background.paper",
            color: "text.primary",
            backgroundImage: "none",
            border: "1px solid",
            borderColor: "divider",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
              <Avatar sx={{ bgcolor: "primary.main", color: "#fff" }}>
                <TodayIcon />
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {day.day}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {day.date}
                </Typography>
              </Box>

              <Chip
                size="small"
                label={`ماء: ${day.waterIntake}/${day.waterGoal}`}
                icon={<WaterIcon />}
                color={day.waterIntake >= day.waterGoal ? "success" : "default"}
              />
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">شرب الماء</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {day.waterIntake} / {day.waterGoal} كأس
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={(day.waterIntake / day.waterGoal) * 100}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Typography variant="subtitle2" fontWeight="bold" mb={2}>
              الوجبات
            </Typography>

            {day.meals.map((meal, mealIndex) => (
              <Card
                key={mealIndex}
                variant="outlined"
                sx={{
                  mb: 2,
                  bgcolor: "background.default",
                  color: "text.primary",
                  borderColor: "divider",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton size="small" color={meal.completed ? "success" : "default"}>
                        {meal.completed ? <CheckCircleIcon /> : <UncheckedIcon />}
                      </IconButton>

                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {meal.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {meal.time}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip label={`${meal.calories} سعرة`} size="small" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mr: 4 }}>
                    {meal.foods}
                  </Typography>
                </CardContent>
              </Card>
            ))}

            {day.exercises.length > 0 && (
              <>
                <Typography variant="subtitle2" fontWeight="bold" mb={2} mt={2}>
                  التمارين
                </Typography>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {day.exercises.map((exercise, exIndex) => (
                    <Chip
                      key={exIndex}
                      icon={<ExerciseIcon />}
                      label={exercise}
                      variant="outlined"
                      sx={{
                        borderColor: "divider",
                        color: "text.primary",
                      }}
                    />
                  ))}
                </Box>
              </>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

export default MyProgram;
