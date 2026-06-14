import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  TextField,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://nutrilife.runasp.net/api/Subscription";
const CACHE_KEY = "approvedClientsCache";
const ACTIVE_CLIENTS_KEY = "activeClientsCache";

export default function Clients() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [approvedCashRequests, setApprovedCashRequests] = useState([]);
  const [activeClients, setActiveClients] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ACTIVE_CLIENTS_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState("");
  const [waitingCardRequests, setWaitingCardRequests] = useState([]);

  const [cashDialogOpen, setCashDialogOpen] = useState(false);
  const [selectedCashRequest, setSelectedCashRequest] = useState(null);
  const [cashAmount, setCashAmount] = useState("");
  const [cashCurrency, setCashCurrency] = useState("USD");
  const [activating, setActivating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const token = localStorage.getItem("token");

  const decodeTokenPayload = () => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      );
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  };

  const getCurrentNutritionistId = () => {
    const payload = decodeTokenPayload();
    return (
      localStorage.getItem("nutritionistId") ||
      payload?.nutritionistId ||
      payload?.NutritionistId ||
      payload?.userId ||
      payload?.UserId ||
      payload?.id ||
      payload?.Id ||
      payload?.sub ||
      payload?.[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      localStorage.getItem("userId") ||
      null
    );
  };

  const getSubscriptionId = (item) =>
    item.subscriptionId ||
    item.SubscriptionId ||
    item.id ||
    item.Id ||
    item.subId ||
    item.SubId;

  const getName = (item) =>
    item.clientName ||
    item.ClientName ||
    item.fullName ||
    item.FullName ||
    item.name ||
    item.Name ||
    item.client?.fullName ||
    item.client?.FullName ||
    item.client?.name ||
    item.client?.Name ||
    (item.clientId ? `Client #${String(item.clientId).slice(0, 8)}` : null) ||
    "Unknown Client";

  const getPlanName = (item) =>
    item.planName ||
    item.PlanName ||
    item.userPlanName ||
    item.UserPlanName ||
    item.plan?.name ||
    item.plan?.Name ||
    item.userPlan?.title ||
    item.UserPlan?.Title ||
    (item.planId ? `Plan #${item.planId}` : null) ||
    (item.PlanId ? `Plan #${item.PlanId}` : null) ||
    (item.userPlan ? `Plan #${item.userPlan}` : null) ||
    (item.UserPlan ? `Plan #${item.UserPlan}` : null) ||
    "-";

  const getRequestDate = (item) =>
    item.requestDate ||
    item.RequestDate ||
    item.createdAt ||
    item.CreatedAt ||
    item.createdDate ||
    item.CreatedDate ||
    "-";

  const getStartDate = (item) => {
    const date =
      item.startDate ||
      item.StartDate ||
      item.approvedAt ||
      item.ApprovedAt ||
      item.approvedDate ||
      item.ApprovedDate ||
      "-";
    return date === "0001-01-01" ? "-" : date;
  };

  const getClientId = (item) => {
    return item.clientId || 
           item.ClientId || 
           item.id || 
           item.Id ||
           item.subscriptionId ||
           item.SubscriptionId ||
           null;
  };

  // تعديل: قراءة paymentMethod من الحقل المباشر أولاً
  const getPaymentMethod = (item) => {
    if (item.paymentMethod) return item.paymentMethod;
    if (item.PaymentMethod) return item.PaymentMethod;
    const notes = item.notes || item.Notes || "";
    const match = notes.match(/Payment method:\s*(Card|Cash)/i);
    return match ? match[1] : "Card";
  };

  const getFirstLastNameFromNotes = (item) => {
    const notes = item.notes || item.Notes || "";
    const match = notes.match(/Name:\s*(\S+)\s+(\S+)/);
    if (match) {
      return { firstName: match[1], lastName: match[2] };
    }
    const fullName = getName(item);
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
    }
    return { firstName: fullName, lastName: "" };
  };

  const getCache = () => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    } catch {
      return {};
    }
  };

  const saveToCache = (subscriptionId, data) => {
    const cache = getCache();
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        ...cache,
        [subscriptionId]: data,
      })
    );
  };

  const saveActiveClients = (clients) => {
    localStorage.setItem(ACTIVE_CLIENTS_KEY, JSON.stringify(clients));
  };

  const mergeClientsWithCache = (clients) => {
    const cache = getCache();
    return clients.map((client) => {
      const subscriptionId = getSubscriptionId(client);
      const cached = cache[subscriptionId];
      return cached ? { ...client, ...cached } : client;
    });
  };

  const mergeUniqueClients = (oldClients, newClients) => {
    const map = new Map();
    [...oldClients, ...newClients].forEach((client) => {
      const key = getSubscriptionId(client) || client.clientId || client.ClientId || getName(client);
      if (key) map.set(String(key), client);
    });
    return Array.from(map.values());
  };

  // دالة مساعدة لقراءة الحالة من أي حقل محتمل
  const getStatus = (item) => {
    // البحث عن أي حقل يحوي "status" في اسمه
    const statusKey = Object.keys(item).find(k => k.toLowerCase().includes("status"));
    if (statusKey) {
      const val = item[statusKey];
      return String(val || "").toLowerCase();
    }
    // إذا لم يوجد أي حقل للحالة، نعتبر القيمة فارغة
    return "";
  };

  const fetchRequests = async () => {
    try {
      const nutritionistId = getCurrentNutritionistId();
      if (!token || !nutritionistId) return;

      const res = await axios.get(
        `${API_BASE}/NutritionistSubscriptionRequests/${nutritionistId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const all = Array.isArray(res.data) ? res.data : [];
      console.log("All requests from API:", all.map(item => ({ status: getStatus(item), paymentMethod: getPaymentMethod(item) })));

      // تصنيف الطلبات بناءً على الحالة إن وُجدت، وإلا نعتبرها pending
      const pending = all.filter(item => {
        const status = getStatus(item);
        return status === "pending" || status === ""; // إذا كانت الحالة فارغة نعتبرها طلب جديد pending
      });

      const waitingPayment = all.filter(item => {
        const status = getStatus(item);
        return status === "waitingpayment";
      });

      const waitingCash = waitingPayment.filter(item => getPaymentMethod(item) === "Cash");
      const waitingCard = waitingPayment.filter(item => getPaymentMethod(item) !== "Cash");

      setRequests(pending);
      setApprovedCashRequests(waitingCash);
      setWaitingCardRequests(waitingCard);
    } catch (err) {
      console.log("Requests error:", err.response || err);
      setRequests([]);
      setApprovedCashRequests([]);
      setWaitingCardRequests([]);
    }
  };

  const fetchActiveClients = async () => {
    try {
      const nutritionistId = getCurrentNutritionistId();
      if (!token || !nutritionistId) return;

      const res = await axios.get(
        `${API_BASE}/NutritionistHistory/${nutritionistId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = Array.isArray(res.data) ? res.data : [];
      console.log("History Data:", data);

      const validServerClients = data.filter((item) => {
        const subscriptionId = getSubscriptionId(item);
        const name = getName(item);
        const status = getStatus(item); // استخدام الدالة المساعدة

        console.log("Checking:", subscriptionId, name, status);

        return (
          subscriptionId &&
          subscriptionId !== 0 &&
          name !== "Unknown Client" &&
          ![
            "waitingpayment",
            "pending",
            "rejected",
            "finished",
            "canceled",
            "cancelled",
          ].includes(status)
        );
      });

      console.log("Valid Clients:", validServerClients);

      const serverClients = mergeClientsWithCache(validServerClients);
      setActiveClients(serverClients);
      saveActiveClients(serverClients);
    } catch (err) {
      console.log("Active clients error:", err.response || err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchActiveClients();
  }, []);

  const handleApprove = async (subscriptionId, requestItem) => {
    if (!subscriptionId) {
      alert("Subscription ID not found.");
      return;
    }
    try {
      await axios.put(
        `${API_BASE}/approve/${subscriptionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // تحديث جميع القوائم من الخادم بعد الموافقة
      await fetchRequests();
      await fetchActiveClients();
      setSnackbar({
        open: true,
        message: "Subscription approved. Waiting for payment.",
        severity: "success",
      });
    } catch (err) {
      console.log("Approve error:", err.response || err);
      alert("Unable to approve subscription.");
    }
  };

  const openCashActivationDialog = (requestItem) => {
    setSelectedCashRequest(requestItem);
    setCashAmount("");
    setCashCurrency("USD");
    setCashDialogOpen(true);
  };

  const handleActivateCash = async () => {
    if (!selectedCashRequest) return;
    if (!cashAmount || parseFloat(cashAmount) <= 0) {
      setSnackbar({ open: true, message: "Please enter a valid amount.", severity: "error" });
      return;
    }
    const subscriptionId = getSubscriptionId(selectedCashRequest);
    const { firstName, lastName } = getFirstLastNameFromNotes(selectedCashRequest);
    if (!firstName || !lastName) {
      setSnackbar({ open: true, message: "Could not extract client name.", severity: "error" });
      return;
    }
    setActivating(true);
    try {
      await axios.patch(
        "https://nutrilife.runasp.net/api/Subscription/",
        {
          SubscriptionId: subscriptionId,
          FirstName: firstName,
          LastName: lastName,
          Amount: parseFloat(cashAmount),
          Currency: cashCurrency,
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      setSnackbar({ open: true, message: "Cash subscription activated successfully!", severity: "success" });
      setApprovedCashRequests(prev => prev.filter(item => getSubscriptionId(item) !== subscriptionId));
      await fetchActiveClients();
      setCashDialogOpen(false);
      setSelectedCashRequest(null);
      setTab(1);
    } catch (err) {
      console.error("Activate cash error:", err.response || err);
      const errorMsg = err.response?.data?.message || "Failed to activate cash subscription.";
      setSnackbar({ open: true, message: errorMsg, severity: "error" });
    } finally {
      setActivating(false);
    }
  };

const handleReject = async (subscriptionId) => {
  if (!subscriptionId) return;
  try {
    await axios.put(
      `${API_BASE}/reject/${subscriptionId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await fetchRequests();
    await fetchActiveClients();
  } catch (err) {
    console.log("Reject error:", err.response || err);
    alert("Unable to reject subscription.");
  }
};

  const handleProgramClick = (client) => {
    const clientId = getClientId(client);
    if (!clientId) {
      alert("Cannot find client ID");
      return;
    }
    navigate(`/programs/${clientId}`);
  };

  const displayRequests = [
    ...requests,
    ...waitingCardRequests,
    ...approvedCashRequests,
  ];
  const filteredRequests = displayRequests.filter((item) =>
    getName(item).toLowerCase().includes(search.toLowerCase())
  );
  const filteredActiveClients = activeClients.filter((item) =>
    getName(item).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 4, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Clients</Typography>
          <Typography color="text.secondary">Review subscription requests and manage your active clients</Typography>
        </Box>
        <TextField size="small" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: 280, bgcolor: "white" }} />
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography color="text.secondary">Pending / Waiting Cash</Typography><Typography variant="h4" fontWeight="bold">{displayRequests.length}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography color="text.secondary">Active Clients</Typography><Typography variant="h4" fontWeight="bold">{activeClients.length}</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <Card>
        <Tabs value={tab} onChange={(e, value) => setTab(value)} sx={{ borderBottom: "1px solid #e5e7eb", px: 2 }}>
          <Tab label={`Requests (${displayRequests.length})`} />
          <Tab label={`Active Clients (${activeClients.length})`} />
        </Tabs>

        {tab === 0 && (
          <Table>
            <TableHead sx={{ bgcolor: "#eef3fb" }}>
              <TableRow>
                <TableCell>CLIENT</TableCell>
                <TableCell>PLAN</TableCell>
                <TableCell>REQ. DATE</TableCell>
                <TableCell>PAYMENT METHOD</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No subscription requests found.</TableCell></TableRow>
              ) : (
                filteredRequests.map((item, index) => {
                  const subscriptionId = getSubscriptionId(item);
                  const paymentMethod = getPaymentMethod(item);
                  const isApprovedCash = approvedCashRequests.some(r => getSubscriptionId(r) === subscriptionId);
                  const isWaitingCard = waitingCardRequests.some(r => getSubscriptionId(r) === subscriptionId);
                  const statusText = isApprovedCash || isWaitingCard ? "Waiting Payment" : "Pending";
                  return (
                    <TableRow key={subscriptionId || index}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>{getName(item).charAt(0)}</Avatar>
                          <Typography fontWeight="bold">{getName(item)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{getPlanName(item)}</TableCell>
                      <TableCell>{getRequestDate(item)}</TableCell>
                      <TableCell>
                        <Chip label={paymentMethod} size="small" color={paymentMethod === "Cash" ? "warning" : "primary"} />
                      </TableCell>
                      <TableCell>
                        <Chip label={statusText} color={!isApprovedCash && !isWaitingCard ? "info" : "warning"} size="small" />
                      </TableCell>
                      <TableCell>
                        {!isApprovedCash && !isWaitingCard ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            sx={{ mr: 1 }}
                            disabled={!subscriptionId}
                            onClick={() => handleApprove(subscriptionId, item)}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            sx={{ mr: 1, bgcolor: "#ff9800", '&:hover': { bgcolor: "#f57c00" } }}
                            disabled={!subscriptionId}
                            onClick={() => openCashActivationDialog(item)}
                          >
                            Activate Cash
                          </Button>
                        )}
                        <Button size="small" variant="outlined" color="error" disabled={!subscriptionId} onClick={() => handleReject(subscriptionId)}>Reject</Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}

        {tab === 1 && (
          <Table>
            <TableHead sx={{ bgcolor: "#eef3fb" }}>
              <TableRow>
                <TableCell>CLIENT</TableCell>
                <TableCell>CURRENT PLAN</TableCell>
                <TableCell>START DATE</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredActiveClients.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No active clients found.</TableCell></TableRow>
              ) : (
                filteredActiveClients.map((item, index) => (
                  <TableRow key={getSubscriptionId(item) || item.clientId || index}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>{getName(item).charAt(0)}</Avatar>
                        <Typography component="span" sx={{ cursor: "pointer", color: "#1976d2", textDecoration: "underline", fontWeight: "bold", '&:hover': { color: "#0d47a1" } }} onClick={() => handleProgramClick(item)}>
                          {getName(item)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getPlanName(item)}</TableCell>
                    <TableCell>{getStartDate(item)}</TableCell>
                    <TableCell><Chip label="Active" color="success" size="small" /></TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => navigate(`/specialistInbody/${getClientId(item)}`)}>View Profile</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={cashDialogOpen} onClose={() => setCashDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Activate Cash Subscription</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You are about to activate a cash subscription for <strong>{selectedCashRequest ? getName(selectedCashRequest) : ""}</strong>.
            Please enter the amount received.
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Amount"
            type="number"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
            disabled={activating}
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Currency</InputLabel>
            <Select value={cashCurrency} onChange={(e) => setCashCurrency(e.target.value)} disabled={activating}>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
              <MenuItem value="JOD">JOD</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCashDialogOpen(false)} disabled={activating}>Cancel</Button>
          <Button onClick={handleActivateCash} variant="contained" color="success" disabled={activating || !cashAmount}>
            {activating ? <CircularProgress size={24} /> : "Confirm & Activate"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}