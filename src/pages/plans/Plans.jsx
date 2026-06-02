import { useEffect, useCallback, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
} from "@mui/material";
import { Add, CheckCircle, Edit, Delete as DeleteIcon } from "@mui/icons-material";
import axios from "axios";

const green = "#007A22";

const getArrayValue = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value];
  return [];
};

const decodeTokenPayload = (token) => {
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

    return JSON.parse(atob(padded));
  } catch (error) {
    console.log("Token decode error:", error);
    return null;
  }
};

export default function Plans() {
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    durationDays: "",
    features: ["custom meal plans", "unlimited messages", "supplement protocol"],
  });

  const token = localStorage.getItem("token");

  const getNutritionistId = useCallback(() => {
    const savedNutritionistId =
      localStorage.getItem("nutritionistId") ||
      localStorage.getItem("userId") ||
      localStorage.getItem("id");

    if (savedNutritionistId) return savedNutritionistId;

    const payload = decodeTokenPayload(token);

    return (
      payload?.[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      payload?.nameid ||
      payload?.userId ||
      payload?.id ||
      payload?.sub ||
      ""
    );
  }, [token]);

  const nutritionistId = getNutritionistId();

  const getPlanId = (plan) => plan.id ?? plan.planId ?? plan.PlanId;

  const fetchPlans = useCallback(async () => {
    if (!nutritionistId) {
      setPlans([]);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(
        `https://nutrilife.runasp.net/api/NutritionistPlans/MyPlans/${nutritionistId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("My plans error:", err.response || err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [nutritionistId, token]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      durationDays: "",
      features: ["custom meal plans", "unlimited messages", "supplement protocol"],
    });
    setEditingPlan(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setOpen(true);
  };

  const handleFeatureChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) => (i === index ? value : feature)),
    }));
  };

  const handleAddFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSavePlan = async () => {
    if (!nutritionistId) {
      alert("Nutritionist ID not found. Please login again.");
      return;
    }

    if (!formData.title.trim() || !formData.price || !formData.durationDays) {
      alert("Please fill all fields");
      return;
    }

    const data = {
      Title: formData.title.trim(),
      price: Number(formData.price),
      NumOfDays: Number(formData.durationDays),
      Description: formData.features
        .map((feature) => feature.trim())
        .filter((feature) => feature !== ""),
      nutritionistId,
    };

    try {
      if (editingPlan) {
        const planId = getPlanId(editingPlan);

        if (!planId) {
          alert("Plan ID not found");
          return;
        }

        await axios.put(
          `https://nutrilife.runasp.net/api/NutritionistPlans/editPlan/${planId}`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        alert("Plan updated successfully");
      } else {
        await axios.post(
          "https://nutrilife.runasp.net/api/NutritionistPlans/createPlan",
          data,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        alert("Plan added successfully");
      }

      await fetchPlans();
      setOpen(false);
      resetForm();
    } catch (err) {
      console.log("SAVE ERROR:", err.response || err);

      alert(
        "Failed to save plan\nStatus: " +
          (err.response?.status || "unknown") +
          "\nError: " +
          JSON.stringify(err.response?.data || err.message)
      );
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);

    setFormData({
      title: plan.Title ?? plan.title ?? "",
      price: plan.price ?? plan.Price ?? "",
      durationDays: plan.NumOfDays ?? plan.numOfDays ?? plan.durationDays ?? "",
      features: getArrayValue(plan.Description ?? plan.description),
    });

    setOpen(true);
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Delete this plan?")) return;

    try {
      await axios.delete(
        `https://nutrilife.runasp.net/api/NutritionistPlans/deletePlan/${id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      await fetchPlans();
    } catch (err) {
      console.log("Delete plan error:", err.response || err);
      alert("Failed to delete plan");
    }
  };

  return (
    <Box sx={{ p: 6 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 10 }}>
        <Box>
          <Typography variant="h3" fontWeight={800}>
            Subscription Plans
          </Typography>

          <Typography variant="h6" color="text.secondary">
            Manage your coaching plans and pricing tiers for your clients.
          </Typography>

          {!nutritionistId && (
            <Typography color="error" sx={{ mt: 1 }}>
              Nutritionist ID not found. Please login again.
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAdd}
          disabled={!nutritionistId}
          sx={{
            bgcolor: green,
            px: 4,
            borderRadius: 2,
            textTransform: "none",
            fontSize: 18,
            "&:hover": { bgcolor: "#00661d" },
          }}
        >
          Add New Plan
        </Button>
      </Box>

      {loading && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Loading plans...
        </Typography>
      )}

      {!loading && plans.length === 0 && (
        <Typography color="text.secondary">
          No plans found for this nutritionist.
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "stretch" }}>
        {plans.map((plan, index) => {
          const planId = getPlanId(plan) ?? index;
          const title = plan.Title ?? plan.title ?? "Subscription Plan";
          const days = plan.NumOfDays ?? plan.numOfDays ?? plan.durationDays;
          const price = plan.price ?? plan.Price ?? 0;
          const description = getArrayValue(plan.Description ?? plan.description);

          return (
            <Card
              key={planId}
              sx={{
                width: 430,
                minHeight: 320,
                border: "2px solid #007A22",
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(0, 122, 34, 0.12)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4">{title}</Typography>
                <Typography sx={{ color: green }}>{days} Days</Typography>
                <Typography fontSize={30}>${price}</Typography>

                <Stack spacing={1}>
                  {description.map((feature, i) => (
                    <Box key={i} sx={{ display: "flex", gap: 1 }}>
                      <CheckCircle sx={{ color: green }} />
                      <Typography>{feature}</Typography>
                    </Box>
                  ))}
                </Stack>

                <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => handleEditPlan(plan)}
                    sx={{
                      color: green,
                      borderColor: green,
                      textTransform: "none",
                      px: 3,
                    }}
                  >
                    Edit
                  </Button>

                  {getPlanId(plan) && (
                    <Button
                      variant="outlined"
                      onClick={() => handleDeletePlan(getPlanId(plan))}
                      sx={{
                        color: "red",
                        borderColor: "red",
                        textTransform: "none",
                        px: 3,
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editingPlan ? "Edit Plan" : "Add New Plan"}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
            />

            <TextField
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              fullWidth
            />

            <TextField
              label="Duration Days"
              type="number"
              value={formData.durationDays}
              onChange={(e) =>
                setFormData({ ...formData, durationDays: e.target.value })
              }
              fullWidth
            />

            <Typography fontWeight={700}>Features</Typography>

            {formData.features.map((feature, index) => (
              <Box key={index} sx={{ display: "flex", gap: 1 }}>
                <TextField
                  label={`Feature ${index + 1}`}
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  fullWidth
                />

                <IconButton
                  color="error"
                  onClick={() => handleRemoveFeature(index)}
                  disabled={formData.features.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddFeature}
              sx={{
                alignSelf: "flex-start",
                color: green,
                borderColor: green,
                textTransform: "none",
              }}
            >
              Add Feature
            </Button>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSavePlan}
            variant="contained"
            sx={{
              bgcolor: green,
              "&:hover": { bgcolor: "#00661d" },
            }}
          >
            {editingPlan ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}