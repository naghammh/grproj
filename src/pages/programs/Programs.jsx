import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Stack
} from "@mui/material";
import axios from "axios";

export default function Programs() {
  const [programData, setProgramData] = useState([]);
  const token = localStorage.getItem("token");

  /* =========================
     API: nutritionistPlans
  ========================= */
  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const res = await axios.get(
          "https://nutrilife.runasp.net/api/MealPlan/nutritionistPlans",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProgramData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log("Program error:", err);
      }
    };

    fetchProgram();
  }, []);

  /* =========================
     API: Get Plan By ID
  ========================= */
  const handleViewPlan = async (id) => {
    try {
      const res = await axios.get(
        `https://nutrilife.runasp.net/api/MealPlan/getplan/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Plan Details:", res.data);
    } catch (err) {
      console.log("Plan error:", err);
    }
  };

  const activePlans = programData.filter(
    (p) => p.status === "Active"
  ).length;

  const completedPlans = programData.filter(
    (p) => p.status === "Completed"
  ).length;

  const draftPlans = programData.filter(
    (p) => p.status === "Draft" || p.status === "Pending"
  ).length;

  const getPlanName = (item) =>
    item.name || item.planName || item.title || "Nutrition Plan";

  const getClientName = (item) =>
    item.clientName ||
    item.client?.fullName ||
    item.client?.name ||
    "Client";

  const getDate = (item) =>
    item.date || item.startDate || item.createdAt || "-";

  const getDescription = (item) =>
    item.description || item.notes || "No description added";

  const getStatusColor = (status) => {
    if (status === "Completed") return "success";
    if (status === "Active") return "primary";
    if (status === "Draft" || status === "Pending") return "warning";
    return "default";
  };

  return (
    <Box sx={{ p: 6, bgcolor: "#f5f7fa", minHeight: "95vh" }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" fontWeight="bold">
          Programs
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
          Manage meal plans and track your clients' nutrition programs
        </Typography>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, minHeight: 120 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Total Plans
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {programData.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, minHeight: 120 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Active Plans
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {activePlans}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, minHeight: 120 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Completed Plans
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {completedPlans}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, minHeight: 120 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Draft / Pending
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {draftPlans}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Program Cards */}
      {programData.length > 0 ? (
        <Grid container spacing={4}>
          {programData.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 3,
                  minHeight: 280,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          {getPlanName(item)}
                        </Typography>

                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                          {getClientName(item)}
                        </Typography>
                      </Box>

                      <Chip
                        label={item.status || "Active"}
                        color={getStatusColor(item.status || "Active")}
                        size="small"
                      />
                    </Box>

                    <Box>
                      <Typography color="text.secondary">
                        Start Date
                      </Typography>
                      <Typography fontWeight="bold">
                        {getDate(item)}
                      </Typography>
                    </Box>

                    <Typography>
                      {getDescription(item)}
                    </Typography>

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ fontSize: "1rem", py: 1.3, mt: 2 }}
                      onClick={() => handleViewPlan(item.id)}
                    >
                      View / Edit
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography
              color="text.secondary"
              textAlign="center"
              sx={{ py: 2 }}
            >
              No programs found
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}