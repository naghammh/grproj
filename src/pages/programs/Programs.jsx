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

  // ✅ دالة محسنة لاستخراج clientId (تدعم الأرقام)
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

  // جلب برامج العميل
  const fetchClientPrograms = async (clientId) => {
    if (!clientId) return;

    setLoadingPlans(true);

    try {
      const token = getToken();
      if (!token) {
        showMessage("Please login again", "error");
        setLoadingPlans(false);
        return;
      }

      // ✅ استخدام clientId كما هو (رقم أو GUID)
      const url = `${MEAL_PLAN_API}/MyclientPlans-Summary?clientId=${clientId}`;
      console.log("Fetching programs from:", url);
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      
      const data = Array.isArray(response.data) ? response.data : [];
      setProgramData(data);
    } catch (err) {
      console.error("Fetch programs error:", err);
      setProgramData([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  // جلب العملاء من localStorage
  const fetchClients = () => {
    setLoadingClients(true);
    
    try {
      const cachedClients = JSON.parse(localStorage.getItem(ACTIVE_CLIENTS_KEY)) || [];
      
      console.log("📋 Cached clients from localStorage:", cachedClients);
      
      if (cachedClients.length > 0) {
        setClients(cachedClients);
        
        const firstClient = cachedClients[0];
        const firstClientId = getClientId(firstClient);
        console.log("📌 First client ID:", firstClientId);
        
        setSelectedClient(firstClient);
        
        if (firstClientId) {
          fetchClientPrograms(firstClientId);
        }
      } else {
        setClients([]);
        showMessage("No active clients found. Please approve clients from the Clients page first.", "warning");
      }
    } catch (err) {
      console.error("Get clients error:", err);
      setClients([]);
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
    console.log("🔍 Selected client ID:", clientId);
    setSelectedClient(client);
    setProgramData([]);
    if (clientId) fetchClientPrograms(clientId);
  };

  // عرض تفاصيل الخطة
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

  // ✅ إضافة خطة جديدة - محسنة
  const handleAddPlan = async () => {
    const clientId = getClientId(selectedClient);

    if (!clientId) {
      showMessage("Client ID not found. Please select a client.", "error");
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

    // ✅ تجربة الروابط والتنسيقات المختلفة
    const urlsToTry = [
      "https://nutrilife.runasp.net/api/MealPlan/AddMealPlan",
      "https://nutrilife.runasp.net/api/MealPlan",
      "https://nutrilife.runasp.net/api/MealPlan/CreateMealPlan",
      "https://nutrilife.runasp.net/api/MealPlan/Create",
      "https://nutrilife.runasp.net/api/MealPlan/Add",
      "https://nutrilife.runasp.net/api/MealPlan/AddPlan",
      "https://nutrilife.runasp.net/api/MealPlan/CreatePlan",
      "https://nutrilife.runasp.net/api/Plans/AddMealPlan",
      "https://nutrilife.runasp.net/api/Plans/CreateMealPlan",
      "https://nutrilife.runasp.net/api/Plans/AddPlan",
      "https://nutrilife.runasp.net/api/Plans/CreatePlan",
      "https://nutrilife.runasp.net/api/Plans/Add",
      "https://nutrilife.runasp.net/api/Plans",
    ];

    const formatsToTry = [
      { ClientId: clientId, title: newPlan.title, StartDate: newPlan.StartDate },
      { clientId: clientId, planName: newPlan.title, startDate: newPlan.StartDate },
      { ClientId: clientId, PlanName: newPlan.title, StartDate: newPlan.StartDate },
      { clientId: clientId, name: newPlan.title, startDate: newPlan.StartDate },
      { ClientId: clientId, Name: newPlan.title, StartDate: newPlan.StartDate },
      { subscriptionId: clientId, title: newPlan.title, StartDate: newPlan.StartDate },
    ];

    let success = false;

    for (const url of urlsToTry) {
      for (const planData of formatsToTry) {
        try {
          console.log("🔄 Trying URL:", url);
          console.log("📦 With data:", planData);
          
          const response = await axios.post(url, planData, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
          
          console.log("✅ SUCCESS! URL:", url);
          console.log("✅ Response:", response.data);
          
          success = true;
          showMessage("Plan added successfully");
          setNewPlan({ title: "", StartDate: "" });
          setOpenDialog(false);
          fetchClientPrograms(clientId);
          break;
          
        } catch (err) {
          console.log("❌ Failed:", url, err.response?.status);
          continue;
        }
      }
      if (success) break;
    }

    if (!success) {
      showMessage("Failed to add plan. No working endpoint found.", "error");
    }
  };

  // تفعيل خطة
  const handleActivatePlan = async (planId) => {
    try {
      const token = getToken();
      if (!token) {
        showMessage("Please login again", "error");
        return;
      }

      await axios.put(`${MEAL_PLAN_API}/activatePlan/${planId}`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      showMessage("Plan activated successfully");
      fetchClientPrograms(getClientId(selectedClient));
    } catch (err) {
      console.error("Activate plan error:", err);
      showMessage("Failed to activate plan", "error");
    }
  };

  // إضافة يوم
  const handleAddDay = async () => {
    if (!selectedPlan || !newDay.DayNumber) {
      showMessage("Please enter day number", "warning");
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        showMessage("Please login again", "error");
        return;
      }

      const ADD_DAY_URL = `${MEAL_PLAN_API}/AddDay`;
      const dayData = {
        mealPlanId: getPlanId(selectedPlan),
        DayNumber: Number(newDay.DayNumber),
        notes: newDay.notes,
      };

      console.log("Adding day - URL:", ADD_DAY_URL);
      console.log("Adding day - Data:", dayData);

      await axios.post(ADD_DAY_URL, dayData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      showMessage("Day added successfully");
      setNewDay({ DayNumber: "", notes: "" });
      setOpenDialog(false);
      fetchClientPrograms(getClientId(selectedClient));
    } catch (err) {
      console.error("Add day error:", err);
      showMessage("Failed to add day", "error");
    }
  };

  // حذف يوم
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
      fetchClientPrograms(getClientId(selectedClient));
    } catch (err) {
      console.error("Delete day error:", err);
      showMessage("Failed to delete day", "error");
    }
  };

  // إضافة وجبة
  const handleAddMeal = async () => {
    if (!selectedPlan || !selectedDay || !mealForm.MealName) {
      showMessage("Please fill meal name", "warning");
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        showMessage("Please login again", "error");
        return;
      }

      const ADD_MEAL_URL = `${MEAL_PLAN_API}/AddMeal`;
      const mealData = {
        mealPlanId: getPlanId(selectedPlan),
        PlanOfDayId: getDayId(selectedDay),
        MealType: mealForm.MealType,
        MealName: mealForm.MealName,
        MealDescription: mealForm.MealDescription,
        OrderIndex: Number(mealForm.OrderIndex),
      };

      console.log("Adding meal - URL:", ADD_MEAL_URL);
      console.log("Adding meal - Data:", mealData);

      const response = await axios.post(ADD_MEAL_URL, mealData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      console.log("Add meal response:", response.data);

      showMessage("Meal added successfully");
      setMealForm({ MealType: "Breakfast", MealName: "", MealDescription: "", OrderIndex: 0 });
      setOpenDialog(false);
      fetchClientPrograms(getClientId(selectedClient));
    } catch (err) {
      console.error("Add meal error:", err.response?.status, err.response?.data);
      showMessage(`Failed to add meal: ${err.response?.status}`, "error");
    }
  };

  // تعديل وجبة
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

      await axios.put(
        `${MEAL_PLAN_API}/Updatemeal`,
        {
          ScheduledMealId: getMealId(selectedMeal),
          MealType: mealForm.MealType,
          MealName: mealForm.MealName,
          MealDescription: mealForm.MealDescription,
          OrderIndex: Number(mealForm.OrderIndex),
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      showMessage("Meal updated successfully");
      setOpenDialog(false);
      fetchClientPrograms(getClientId(selectedClient));
    } catch (err) {
      console.error("Update meal error:", err);
      showMessage("Failed to update meal", "error");
    }
  };

  // حذف وجبة
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
      fetchClientPrograms(getClientId(selectedClient));
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h3" fontWeight="bold">Programs</Typography>
          <Typography color="text.secondary">Manage meal plans for your active clients</Typography>
        </Box>
        <Button variant="outlined" onClick={refreshClients} size="small">Refresh Clients</Button>
      </Box>

      <Grid container spacing={3}>
        {/* قائمة العملاء */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Active Clients ({clients.length})</Typography>
              {clients.length === 0 ? (
                <Typography color="text.secondary">No active clients found.</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {clients.map((client, index) => {
                    const clientId = getClientId(client);
                    const selectedClientId = getClientId(selectedClient);
                    const isSelected = clientId && clientId === selectedClientId;

                    return (
                      <Card key={clientId || index} onClick={() => handleSelectClient(client)} sx={{ cursor: "pointer", border: isSelected ? "2px solid #1976d2" : "1px solid #e5e7eb", bgcolor: isSelected ? "#eef6ff" : "white" }}>
                        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar>{getClientName(client).charAt(0)}</Avatar>
                          <Box>
                            <Typography fontWeight="bold">{getClientName(client)}</Typography>
                            <Typography variant="body2" color={clientId ? "success.main" : "error.main"}>
                              {clientId ? "✓ Active client" : "✗ Missing client ID"}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* تفاصيل البرامج */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Card><CardContent><Typography color="text.secondary">Total Plans</Typography><Typography variant="h4" fontWeight="bold">{programData.length}</Typography></CardContent></Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card><CardContent><Typography color="text.secondary">Active Plans</Typography><Typography variant="h4" fontWeight="bold">{activePlans}</Typography></CardContent></Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">{selectedClient ? getClientName(selectedClient) : "Select a client"}</Typography>
                  <Typography color="text.secondary">Meal plans and program details</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} disabled={!getClientId(selectedClient)} onClick={() => { setDialogMode("addPlan"); setOpenDialog(true); }}>Add Plan</Button>
              </Box>

              {loadingPlans ? (
                <Box sx={{ textAlign: "center", py: 5 }}><CircularProgress /></Box>
              ) : !selectedClient ? (
                <Typography textAlign="center" color="text.secondary" sx={{ py: 5 }}>Select a client from the left to view their programs.</Typography>
              ) : programData.length === 0 ? (
                <Typography textAlign="center" color="text.secondary" sx={{ py: 5 }}>No programs found for this client. Click "Add Plan" to create one.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {programData.map((plan, index) => {
                    const planId = getPlanId(plan);
                    const status = getPlanStatus(plan);
                    return (
                      <Grid item xs={12} sm={6} key={planId || index}>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog إضافة خطة */}
      <Dialog open={openDialog && dialogMode === "addPlan"} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New Plan
          <IconButton onClick={() => setOpenDialog(false)} sx={{ position: "absolute", right: 8, top: 8 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
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
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">{getPlanTitle(selectedPlan)}</Typography>
                  <Typography color="text.secondary">Start Date: {getPlanStartDate(selectedPlan)}</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setDialogMode("addDay"); setOpenDialog(true); }}>Add Day</Button>
              </Box>
              <Divider />
              {getDays(selectedPlan).length === 0 ? (
                <Typography color="text.secondary">No days added yet.</Typography>
              ) : (
                getDays(selectedPlan).map((day, index) => (
                  <Card key={getDayId(day) || index} sx={{ border: "1px solid #e5e7eb" }}>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">Day {getDayNumber(day)}</Typography>
                          <Typography color="text.secondary">{day.notes || day.Notes || "No notes"}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedDay(day); setMealForm({ MealType: "Breakfast", MealName: "", MealDescription: "", OrderIndex: 0 }); setDialogMode("addMeal"); setOpenDialog(true); }}>Meal</Button>
                          <IconButton color="error" onClick={() => handleDeleteDay(getDayId(day))}><DeleteIcon /></IconButton>
                        </Stack>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      {getMeals(day).length === 0 ? (
                        <Typography color="text.secondary">No meals added.</Typography>
                      ) : (
                        <Stack spacing={1}>
                          {getMeals(day).map((meal, mealIndex) => (
                            <Card key={getMealId(meal) || mealIndex} sx={{ bgcolor: "#fafafa" }}>
                              <CardContent sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                                <Box>
                                  <Typography fontWeight="bold">{meal.mealName || meal.MealName}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {meal.mealType || meal.MealType} - {meal.mealDescription || meal.MealDescription || "No description"}
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={1}>
                                  <IconButton onClick={() => { setSelectedMeal(meal); setMealForm({ MealType: meal.mealType || meal.MealType || "Breakfast", MealName: meal.mealName || meal.MealName || "", MealDescription: meal.mealDescription || meal.MealDescription || "", OrderIndex: meal.orderIndex || meal.OrderIndex || 0 }); setDialogMode("editMeal"); setOpenDialog(true); }}><EditIcon /></IconButton>
                                  <IconButton color="error" onClick={() => handleDeleteMeal(getMealId(meal))}><DeleteIcon /></IconButton>
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