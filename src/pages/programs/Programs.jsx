import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";

const ACTIVE_CLIENTS_KEY = "activeClientsCache";
const MEAL_PLAN_API = "https://nutrilife.runasp.net/api/MealPlan";
const CLIENTS_API = "https://nutrilife.runasp.net/api/Subscription/GetMyClients";

export default function Programs() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [programData, setProgramData] = useState([]);

  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("");

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);

  const [newPlan, setNewPlan] = useState({ title: "", StartDate: "" });
  const [newDay, setNewDay] = useState({ DayNumber: "", notes: "" });
  const [manualClientId, setManualClientId] = useState("");

  const [mealForm, setMealForm] = useState({
    MealType: "Breakfast",
    MealName: "",
    MealDescription: "",
    OrderIndex: 0,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const getToken = () => localStorage.getItem("token");

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const getClientId = (client) => {
    if (!client) return null;
    return client.clientId || 
           client.ClientId || 
           client.id || 
           client.Id || 
           client.userId || 
           client.UserId ||
           client.subscriptionId ||
           client.SubscriptionId ||
           null;
  };

  const getClientName = (client) => {
    if (!client) return "Unknown Client";
    return client.clientName ||
           client.ClientName ||
           client.fullName ||
           client.FullName ||
           client.name ||
           client.Name ||
           client.userName ||
           client.UserName ||
           "Unknown Client";
  };

  const getPlanId = (plan) => plan?.id || plan?.Id || plan?.mealPlanId || plan?.MealPlanId;
  const getPlanTitle = (plan) => plan?.title || plan?.Title || plan?.name || plan?.Name || "Nutrition Plan";
  const getPlanStatus = (plan) => plan?.status || plan?.Status || "Draft";
  const getPlanStartDate = (plan) => plan?.startDate || plan?.StartDate || plan?.createdAt || "-";
  
  const getDays = (plan) => plan?.days || plan?.Days || plan?.planOfDays || plan?.PlanOfDays || [];
  const getDayId = (day) => day?.id || day?.Id || day?.planOfDayId || day?.PlanOfDayId;
  const getDayNumber = (day) => day?.dayNumber || day?.DayNumber || "-";
  const getMeals = (day) => day?.meals || day?.Meals || day?.scheduledMeals || day?.ScheduledMeals || [];
  const getMealId = (meal) => meal?.id || meal?.Id || meal?.scheduledMealId || meal?.ScheduledMealId;

  const getStatusColor = (status) => {
    const lower = String(status || "").toLowerCase();
    if (lower === "active") return "primary";
    if (lower === "completed") return "success";
    if (lower === "draft" || lower === "pending") return "warning";
    return "default";
  };

  // ✅✅✅ جلب برامج العميل - النسخة الذكية ✅✅✅
  const fetchClientPrograms = async (clientId) => {
    console.log("🔍 fetchClientPrograms called with clientId:", clientId);
    if (!clientId) {
      console.warn("❌ No clientId provided");
      return;
    }
    setLoadingPlans(true);
    try {
      const token = getToken();
      if (!token) {
        showMessage("Please login again", "error");
        setLoadingPlans(false);
        return;
      }
      
      // قائمة بكل الروابط المحتملة
      const endpoints = [
        `${MEAL_PLAN_API}/MyclientPlansS/${clientId}`,
        `${MEAL_PLAN_API}/MyclientPlans/${clientId}`,
        `${MEAL_PLAN_API}/MyclientPlans-Summary/${clientId}`,
        `${MEAL_PLAN_API}/client/${clientId}/plans`,
        `${MEAL_PLAN_API}/GetPlansByClientId/${clientId}`,
        `${MEAL_PLAN_API}/GetClientPlans/${clientId}`,
        `${MEAL_PLAN_API}/plans/client/${clientId}`,
      ];
      
      let lastError = null;
      
      for (const url of endpoints) {
        try {
          console.log("🌐 Trying URL:", url);
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
          
          console.log("✅ SUCCESS with URL:", url);
          console.log("📦 Response status:", response.status);
          console.log("📦 Response data:", response.data);
          
          // استخراج البيانات
          const raw = response.data;
          let data = [];
          
          if (Array.isArray(raw)) {
            data = raw;
          } else if (raw?.$values && Array.isArray(raw.$values)) {
            data = raw.$values;
          } else if (raw?.data && Array.isArray(raw.data)) {
            data = raw.data;
          } else if (raw?.result && Array.isArray(raw.result)) {
            data = raw.result;
          } else if (raw?.items && Array.isArray(raw.items)) {
            data = raw.items;
          } else {
            data = [];
          }
          
          console.log("📋 Programs count:", data.length);
          setProgramData(data);
          return; // نجحنا, نخرج من الدالة
        } catch (err) {
          console.warn(`❌ Failed URL: ${url}`, err.response?.status);
          lastError = err;
        }
      }
      
      // لو كل الروابط فشلت
      throw lastError || new Error("All endpoints failed");
      
    } catch (err) {
      console.error("❌ All fetch attempts failed:", err);
      setProgramData([]);
      showMessage("Failed to load programs. Please check API connection.", "error");
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const token = getToken();
      if (!token) {
        showMessage("Please login again", "error");
        setLoadingClients(false);
        return;
      }
      const response = await axios.get(CLIENTS_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let apiClients = Array.isArray(response.data) ? response.data : [];
      if (apiClients.length > 0) {
        setClients(apiClients);
        const firstClient = apiClients[0];
        const firstClientId = getClientId(firstClient);
        setSelectedClient(firstClient);
        if (firstClientId) fetchClientPrograms(firstClientId);
      } else {
        const cachedClients = JSON.parse(localStorage.getItem(ACTIVE_CLIENTS_KEY)) || [];
        if (cachedClients.length > 0) {
          setClients(cachedClients);
          showMessage("Using cached clients data", "info");
        } else {
          setClients([]);
          showMessage("No active clients found.", "warning");
        }
      }
    } catch (err) {
      console.error("Get clients error:", err);
      const cachedClients = JSON.parse(localStorage.getItem(ACTIVE_CLIENTS_KEY)) || [];
      if (cachedClients.length > 0) {
        setClients(cachedClients);
        showMessage("Using cached clients data", "info");
      } else {
        setClients([]);
        showMessage("Failed to load clients", "error");
      }
    } finally {
      setLoadingClients(false);
    }
  };

  const refreshClients = () => fetchClients();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      showMessage("Please login first", "warning");
      setLoadingClients(false);
      return;
    }
    fetchClients();
  }, []);

  const handleSelectClient = (client) => {
    const clientId = getClientId(client);
    setSelectedClient(client);
    setProgramData([]);
    if (clientId) fetchClientPrograms(clientId);
  };

  const handleViewPlan = async (planId) => {
    try {
      const token = getToken();
      if (!token) {
        showMessage("Please login again", "error");
        return;
      }
      const res = await axios.get(`${MEAL_PLAN_API}/GetPlanById/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedPlan(res.data);
      setDialogMode("view");
      setOpenDialog(true);
    } catch (err) {
      console.error("Plan details error:", err);
      showMessage("Failed to load plan details", "error");
    }
  };

  // ✅✅✅ إضافة خطة ✅✅✅
  const handleAddPlan = async () => {
    const clientId = manualClientId || getClientId(selectedClient);
    
    console.log("🆔 CLIENT ID المستخدم للإضافة:", clientId);
    
    if (!clientId) {
      showMessage("Please enter Client ID or select a client.", "error");
      return;
    }
    if (!newPlan.title || !newPlan.StartDate) {
      showMessage("Please fill all fields", "warning");
      return;
    }
    const token = getToken();
    if (!token) {
      showMessage("Please login again", "error");
      return;
    }
    const planData = {
      clientId: clientId,
      title: newPlan.title,
      startDate: newPlan.StartDate,
    };
    
    try {
      console.log("🔄 Adding plan for client:", clientId);
      const response = await axios.post(MEAL_PLAN_API, planData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      console.log("✅ Add plan response:", response.data);
      showMessage("Plan added successfully");
      
      setNewPlan({ title: "", StartDate: "" });
      setManualClientId("");
      setOpenDialog(false);
      
      console.log("🔄 جلب البرامج بعد الإضافة...");
      await fetchClientPrograms(clientId);
      console.log("✅ تم جلب البرامج بنجاح");
      
    } catch (err) {
      console.error("Add plan error:", err);
      showMessage(`Failed to add plan: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  const handleActivatePlan = async (planId) => {
    try {
      const token = getToken();
      if (!token) {
        showMessage("Please login again", "error");
        return;
      }
      await axios.put(`${MEAL_PLAN_API}/activate/${planId}`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      showMessage("Plan activated successfully");
      const clientId = manualClientId || getClientId(selectedClient);
      if (clientId) await fetchClientPrograms(clientId);
    } catch (err) {
      console.error("Activate plan error:", err);
      showMessage("Failed to activate plan", "error");
    }
  };

  const handleAddDay = async () => {
    if (!selectedPlan) {
      showMessage("Please select a plan first", "warning");
      return;
    }
    if (!newDay.DayNumber) {
      showMessage("Please enter day number", "warning");
      return;
    }
    try {
      const token = getToken();
      if (!token) {
        showMessage("Please login again", "error");
        return;
      }
      console.log("🔄 Adding day to plan:", getPlanId(selectedPlan));
      await axios.post(`${MEAL_PLAN_API}/AddDay`, {
        mealPlanId: getPlanId(selectedPlan),
        DayNumber: Number(newDay.DayNumber),
        notes: newDay.notes,
      }, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      showMessage("Day added successfully");
      setNewDay({ DayNumber: "", notes: "" });
      setOpenDialog(false);
      await handleViewPlan(getPlanId(selectedPlan));
    } catch (err) {
      console.error("Add day error:", err);
      showMessage("Failed to add day", "error");
    }
  };

  const handleDeleteDay = async (dayId) => {
    try {
      const token = getToken();
      if (!token) {
        showMessage("Please login again", "error");
        return;
      }
      await axios.delete(`${MEAL_PLAN_API}/Deleteday/${dayId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      showMessage("Day deleted successfully");
      setOpenDialog(false);
      if (selectedPlan) await handleViewPlan(getPlanId(selectedPlan));
    } catch (err) {
      console.error("Delete day error:", err);
      showMessage("Failed to delete day", "error");
    }
  };

  const handleAddMeal = async () => {
    if (!selectedPlan || !selectedDay) {
      showMessage("Please select a day first", "warning");
      return;
    }
    if (!mealForm.MealName) {
      showMessage("Please fill meal name", "warning");
      return;
    }
    try {
      const token = getToken();
      if (!token) {
        showMessage("Please login again", "error");
        return;
      }
      console.log("🔄 Adding meal to day:", getDayId(selectedDay));
      await axios.post(`${MEAL_PLAN_API}/AddMeal`, {
        mealPlanId: getPlanId(selectedPlan),
        PlanOfDayId: getDayId(selectedDay),
        MealType: mealForm.MealType,
        MealName: mealForm.MealName,
        MealDescription: mealForm.MealDescription,
        OrderIndex: Number(mealForm.OrderIndex),
      }, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      showMessage("Meal added successfully");
      setMealForm({ MealType: "Breakfast", MealName: "", MealDescription: "", OrderIndex: 0 });
      setOpenDialog(false);
      if (selectedPlan) await handleViewPlan(getPlanId(selectedPlan));
    } catch (err) {
      console.error("Add meal error:", err);
      showMessage("Failed to add meal", "error");
    }
  };

  const handleUpdateMeal = async () => {
    if (!selectedMeal || !mealForm.MealName) {
      showMessage("Please fill meal name", "warning");
      return;
    }
    try {
      const token = getToken();
      if (!token) {
        showMessage("Please login again", "error");
        return;
      }
      await axios.put(`${MEAL_PLAN_API}/Updatemeal`, {
        ScheduledMealId: getMealId(selectedMeal),
        MealType: mealForm.MealType,
        MealName: mealForm.MealName,
        MealDescription: mealForm.MealDescription,
        OrderIndex: Number(mealForm.OrderIndex),
      }, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      showMessage("Meal updated successfully");
      setOpenDialog(false);
      if (selectedPlan) await handleViewPlan(getPlanId(selectedPlan));
    } catch (err) {
      console.error("Update meal error:", err);
      showMessage("Failed to update meal", "error");
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      const token = getToken();
      if (!token) {
        showMessage("Please login again", "error");
        return;
      }
      await axios.delete(`${MEAL_PLAN_API}/Deletemeal/${mealId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      showMessage("Meal deleted successfully");
      setOpenDialog(false);
      if (selectedPlan) await handleViewPlan(getPlanId(selectedPlan));
    } catch (err) {
      console.error("Delete meal error:", err);
      showMessage("Failed to delete meal", "error");
    }
  };

  const activePlans = programData.filter(
    (plan) => String(getPlanStatus(plan)).toLowerCase() === "active"
  ).length;

  if (loadingClients) {
    return (
      <Box sx={{ p: 6, textAlign: "center", bgcolor: "#f5f7fa", minHeight: "95vh" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading clients...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Typography variant="h3" fontWeight="bold">Programs</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Manage meal plans for your active clients</Typography>

      {clients.length === 0 ? (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography color="text.secondary">No active clients found.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 4, bgcolor: "#eef6ff", border: "1px solid #1976d2" }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: "#1976d2" }}>
                  {selectedClient ? getClientName(selectedClient).charAt(0) : clients[0] ? getClientName(clients[0]).charAt(0) : "?"}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedClient ? getClientName(selectedClient) : clients[0] ? getClientName(clients[0]) : "Select a client"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getClientId(selectedClient || clients[0]) ? "✓ Active client" : "Missing client ID"}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setDialogMode("addPlan");
                  setOpenDialog(true);
                }}
              >
                Add Plan
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Total Plans</Typography>
              <Typography variant="h4" fontWeight="bold">{programData.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Active Plans</Typography>
              <Typography variant="h4" fontWeight="bold">{activePlans}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loadingPlans ? (
        <Box sx={{ textAlign: "center", py: 5 }}><CircularProgress /></Box>
      ) : programData.length === 0 ? (
        <Card>
          <CardContent>
            <Typography textAlign="center" color="text.secondary" sx={{ py: 5 }}>
              No programs found. Click "Add Plan" to create one.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {programData.map((plan, index) => {
            const planId = getPlanId(plan);
            const status = getPlanStatus(plan);
            return (
              <Grid item xs={12} sm={6} md={4} key={planId || index}>
                <Card sx={{ border: "1px solid #e5e7eb" }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                        <Typography variant="h6" fontWeight="bold">{getPlanTitle(plan)}</Typography>
                        <Chip label={status} color={getStatusColor(status)} size="small" />
                      </Box>
                      <Typography color="text.secondary">Start Date: {getPlanStartDate(plan)}</Typography>
                      <Stack direction="row" spacing={1}>
                        <Button variant="contained" startIcon={<VisibilityIcon />} disabled={!planId} onClick={() => handleViewPlan(planId)}>View</Button>
                        {String(status).toLowerCase() !== "active" && (
                          <Button variant="outlined" startIcon={<CheckCircleIcon />} disabled={!planId} onClick={() => handleActivatePlan(planId)}>Activate</Button>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialog إضافة خطة */}
      <Dialog open={openDialog && dialogMode === "addPlan"} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New Plan
          <IconButton onClick={() => setOpenDialog(false)} sx={{ position: "absolute", right: 8, top: 8 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Client ID (GUID)"
              fullWidth
              placeholder="أدخل الـ Client ID الخاص بالعميل"
              value={manualClientId}
              onChange={(e) => setManualClientId(e.target.value)}
              helperText="اتركه فارغاً لاستخدام العميل المحدد"
            />
            <TextField label="Plan Title" fullWidth value={newPlan.title} onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })} />
            <TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={newPlan.StartDate} onChange={(e) => setNewPlan({ ...newPlan, StartDate: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPlan}>Create Plan</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog إضافة يوم */}
      <Dialog open={openDialog && dialogMode === "addDay"} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add Day
          <IconButton onClick={() => setOpenDialog(false)} sx={{ position: "absolute", right: 8, top: 8 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Day Number" type="number" fullWidth value={newDay.DayNumber} onChange={(e) => setNewDay({ ...newDay, DayNumber: e.target.value })} />
            <TextField label="Notes" fullWidth multiline rows={3} value={newDay.notes} onChange={(e) => setNewDay({ ...newDay, notes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddDay}>Add Day</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog إضافة/تعديل وجبة */}
      <Dialog open={openDialog && (dialogMode === "addMeal" || dialogMode === "editMeal")} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === "addMeal" ? "Add Meal" : "Edit Meal"}
          <IconButton onClick={() => setOpenDialog(false)} sx={{ position: "absolute", right: 8, top: 8 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField select label="Meal Type" fullWidth value={mealForm.MealType} onChange={(e) => setMealForm({ ...mealForm, MealType: e.target.value })}>
              <MenuItem value="Breakfast">Breakfast</MenuItem>
              <MenuItem value="Lunch">Lunch</MenuItem>
              <MenuItem value="Dinner">Dinner</MenuItem>
              <MenuItem value="Snack">Snack</MenuItem>
            </TextField>
            <TextField label="Meal Name" fullWidth value={mealForm.MealName} onChange={(e) => setMealForm({ ...mealForm, MealName: e.target.value })} />
            <TextField label="Meal Description" fullWidth multiline rows={3} value={mealForm.MealDescription} onChange={(e) => setMealForm({ ...mealForm, MealDescription: e.target.value })} />
            <TextField label="Order Index" type="number" fullWidth value={mealForm.OrderIndex} onChange={(e) => setMealForm({ ...mealForm, OrderIndex: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          {dialogMode === "addMeal" && <Button variant="contained" onClick={handleAddMeal}>Add Meal</Button>}
          {dialogMode === "editMeal" && <Button variant="contained" onClick={handleUpdateMeal}>Save Meal</Button>}
        </DialogActions>
      </Dialog>

      {/* Dialog عرض تفاصيل الخطة */}
      <Dialog open={openDialog && dialogMode === "view"} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Plan Details
          <IconButton onClick={() => setOpenDialog(false)} sx={{ position: "absolute", right: 8, top: 8 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">{getPlanTitle(selectedPlan)}</Typography>
                  <Typography color="text.secondary">Start Date: {getPlanStartDate(selectedPlan)}</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setDialogMode("addDay"); setOpenDialog(true); }}>
                  Add Day
                </Button>
              </Box>
              <Divider />
              {getDays(selectedPlan).length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>No days added yet. Click "Add Day" to start.</Typography>
              ) : (
                getDays(selectedPlan).map((day, index) => (
                  <Card key={getDayId(day) || index} sx={{ border: "1px solid #e5e7eb", mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">Day {getDayNumber(day)}</Typography>
                          <Typography color="text.secondary">{day.notes || day.Notes || "No notes"}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button 
                            size="small" 
                            variant="contained" 
                            startIcon={<AddIcon />} 
                            onClick={() => { 
                              setSelectedDay(day); 
                              setMealForm({ MealType: "Breakfast", MealName: "", MealDescription: "", OrderIndex: 0 }); 
                              setDialogMode("addMeal"); 
                              setOpenDialog(true); 
                            }}
                          >
                            Add Meal
                          </Button>
                          <IconButton color="error" onClick={() => handleDeleteDay(getDayId(day))}>
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      {getMeals(day).length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>No meals added. Click "Add Meal" to start.</Typography>
                      ) : (
                        <Stack spacing={1.5}>
                          {getMeals(day).map((meal, mealIndex) => (
                            <Card key={getMealId(meal) || mealIndex} sx={{ bgcolor: "#fafafa" }}>
                              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                    <Chip label={meal.mealType || meal.MealType || "Meal"} size="small" color="primary" variant="outlined" />
                                    <Typography variant="subtitle1" fontWeight="bold">
                                      {meal.mealName || meal.MealName}
                                    </Typography>
                                    {meal.orderIndex !== undefined && (
                                      <Typography variant="caption" color="text.secondary">
                                        Order: {meal.orderIndex}
                                      </Typography>
                                    )}
                                  </Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {meal.mealDescription || meal.MealDescription || "No description"}
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={0.5}>
                                  <IconButton 
                                    size="small"
                                    onClick={() => { 
                                      setSelectedMeal(meal); 
                                      setMealForm({ 
                                        MealType: meal.mealType || meal.MealType || "Breakfast", 
                                        MealName: meal.mealName || meal.MealName || "", 
                                        MealDescription: meal.mealDescription || meal.MealDescription || "", 
                                        OrderIndex: meal.orderIndex || meal.OrderIndex || 0 
                                      }); 
                                      setDialogMode("editMeal"); 
                                      setOpenDialog(true); 
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small"
                                    color="error" 
                                    onClick={() => handleDeleteMeal(getMealId(meal))}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </CardContent>
                            </Card>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}