import React, { useEffect, useMemo, useState } from "react";
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
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FitnessCenter as FitnessCenterIcon,
  InsertDriveFile as FileIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  CloudUpload as UploadIcon,
  AutoAwesome as AiIcon,
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

const API_BASE_URL = "https://nutrilife.runasp.net/api/ProgressTracking";

const CLIENT_ID =
  localStorage.getItem("clientId") || "2afec376-23fc-467f-8621-8e0ad752dd99";

const NUTRITIONIST_ID = localStorage.getItem("nutritionistId");
const CREATOR_ROLE = localStorage.getItem("role") || "Client";
const SUBSCRIPTION_ID = Number(localStorage.getItem("subscriptionId") || 5);

const getToken = () => localStorage.getItem("token");

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const pick = (obj, keys, fallback = undefined) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return fallback;
};

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.measurements)) return value.measurements;
  if (Array.isArray(value?.Measurements)) return value.Measurements;
  if (Array.isArray(value?.files)) return value.files;
  if (Array.isArray(value?.Files)) return value.Files;
  return [];
};

const formatChartDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

const emptyMeasurement = {
  Weight: "",
  Height: "",
  WaistCircumference: "",
  HipCircumference: "",
  ChestCircumference: "",
  ArmCircumference: "",
  ThighCircumference: "",
};

function Progress() {
  const [progress, setProgress] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingMeasurement, setSavingMeasurement] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState("");

  const [openMeasurementDialog, setOpenMeasurementDialog] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [measurementForm, setMeasurementForm] = useState(emptyMeasurement);

  const [selectedFile, setSelectedFile] = useState(null);

  const progressUrl = NUTRITIONIST_ID
    ? `${API_BASE_URL}/clientProgress/${CLIENT_ID}/${NUTRITIONIST_ID}`
    : `${API_BASE_URL}/clientProgress/${CLIENT_ID}`;

  const healthTrackingId = pick(
    progress,
    ["healthTrackingId", "HealthTrackingId", "id", "Id"],
    pick(measurements[0], ["healthTrackingId", "HealthTrackingId"])
  );

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(progressUrl, {
        headers: {
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error("تعذر تحميل بيانات التقدم");
      }

      const result = await response.json();
      const data = result?.data || result;

      setProgress(data);

      const nextMeasurements =
        data?.measurements ||
        data?.Measurements ||
        data?.healthMeasurements ||
        data?.HealthMeasurements ||
        data?.measurement ||
        data?.Measurement ||
        [];

      const nextFiles =
        data?.files ||
        data?.Files ||
        data?.inbodyFiles ||
        data?.InbodyFiles ||
        data?.uploadedFiles ||
        data?.UploadedFiles ||
        [];

      setMeasurements(asArray(nextMeasurements));
      setFiles(asArray(nextFiles));
    } catch (err) {
      setError(err.message || "صار خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const weightData = useMemo(() => {
    return measurements
      .map((item) => ({
        id: pick(item, ["id", "Id", "measurementId", "MeasurementId"]),
        date: formatChartDate(
          pick(item, [
            "createdAt",
            "CreatedAt",
            "date",
            "Date",
            "measurementDate",
            "MeasurementDate",
          ])
        ),
        weight: Number(pick(item, ["weight", "Weight"], 0)),
      }))
      .filter((item) => item.weight > 0);
  }, [measurements]);

  const latestMeasurement = measurements[measurements.length - 1];
  const previousMeasurement = measurements[measurements.length - 2];

  const currentWeight = Number(
    pick(latestMeasurement, ["weight", "Weight"], weightData.at(-1)?.weight || 0)
  );

  const previousWeight = Number(
    pick(
      previousMeasurement,
      ["weight", "Weight"],
      weightData.at(-2)?.weight || currentWeight
    )
  );

  const firstWeight = Number(weightData[0]?.weight || currentWeight);
  const weightDifference = (firstWeight - currentWeight).toFixed(1);

  const measurementStats = [
    {
      label: "الطول",
      value: `${pick(latestMeasurement, ["height", "Height"], "-")} سم`,
      progress: Math.min((Number(pick(latestMeasurement, ["height", "Height"], 0)) / 200) * 100, 100),
      icon: <FitnessCenterIcon />,
      color: "primary.light",
    },
    {
      label: "محيط الخصر",
      value: `${pick(latestMeasurement, ["waistCircumference", "WaistCircumference"], "-")} سم`,
      progress: Math.min((Number(pick(latestMeasurement, ["waistCircumference", "WaistCircumference"], 0)) / 120) * 100, 100),
      icon: <FitnessCenterIcon />,
      color: "success.light",
    },
    {
      label: "محيط الورك",
      value: `${pick(latestMeasurement, ["hipCircumference", "HipCircumference"], "-")} سم`,
      progress: Math.min((Number(pick(latestMeasurement, ["hipCircumference", "HipCircumference"], 0)) / 140) * 100, 100),
      icon: <FitnessCenterIcon />,
      color: "info.light",
    },
    {
      label: "ملفات InBody",
      value: `${files.length}`,
      progress: files.length ? 100 : 0,
      icon: <FileIcon />,
      color: "warning.light",
    },
  ];

  const openAddMeasurement = () => {
    setEditingMeasurement(null);
    setMeasurementForm(emptyMeasurement);
    setOpenMeasurementDialog(true);
  };

  const openEditMeasurement = (item) => {
    setEditingMeasurement(item);
    setMeasurementForm({
      Weight: pick(item, ["weight", "Weight"], ""),
      Height: pick(item, ["height", "Height"], ""),
      WaistCircumference: pick(item, ["waistCircumference", "WaistCircumference"], ""),
      HipCircumference: pick(item, ["hipCircumference", "HipCircumference"], ""),
      ChestCircumference: pick(item, ["chestCircumference", "ChestCircumference"], ""),
      ArmCircumference: pick(item, ["armCircumference", "ArmCircumference"], ""),
      ThighCircumference: pick(item, ["thighCircumference", "ThighCircumference"], ""),
    });
    setOpenMeasurementDialog(true);
  };

  const handleMeasurementChange = (field, value) => {
    setMeasurementForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildMeasurementBody = () => ({
    HealthTrackingId: Number(healthTrackingId),
    Weight: Number(measurementForm.Weight),
    Height: Number(measurementForm.Height),
    WaistCircumference: Number(measurementForm.WaistCircumference),
    HipCircumference: Number(measurementForm.HipCircumference),
    ChestCircumference: Number(measurementForm.ChestCircumference),
    ArmCircumference: Number(measurementForm.ArmCircumference),
    ThighCircumference: Number(measurementForm.ThighCircumference),
    creatorRole: CREATOR_ROLE,
  });

  const handleSaveMeasurement = async () => {
    if (!healthTrackingId) {
      setError("لا يوجد HealthTrackingId. لازم يكون موجود من بيانات clientProgress.");
      return;
    }

    try {
      setSavingMeasurement(true);
      setError("");

      const measurementId = pick(editingMeasurement, [
        "id",
        "Id",
        "measurementId",
        "MeasurementId",
      ]);

      const isEdit = Boolean(editingMeasurement && measurementId);

      const response = await fetch(
        isEdit
          ? `${API_BASE_URL}/editMeasurement/${measurementId}`
          : `${API_BASE_URL}/AddMeasurement/`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify(buildMeasurementBody()),
        }
      );

      if (!response.ok) {
        throw new Error(isEdit ? "تعذر تعديل القياس" : "تعذر إضافة القياس");
      }

      setOpenMeasurementDialog(false);
      await loadProgress();
    } catch (err) {
      setError(err.message || "صار خطأ أثناء حفظ القياس");
    } finally {
      setSavingMeasurement(false);
    }
  };

  const handleDeleteMeasurement = async (item) => {
    const measurementId = pick(item, ["id", "Id", "measurementId", "MeasurementId"]);
    if (!measurementId) return;

    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/DeleteMeasurement/${measurementId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify(buildMeasurementBody()),
        }
      );

      if (!response.ok) {
        throw new Error("تعذر حذف القياس");
      }

      await loadProgress();
    } catch (err) {
      setError(err.message || "صار خطأ أثناء حذف القياس");
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    try {
      setUploadingFile(true);
      setError("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      if (healthTrackingId) {
        formData.append("HealthTrackingId", healthTrackingId);
      }

      formData.append("ClientId", CLIENT_ID);
      formData.append("creatorRole", CREATOR_ROLE);

      const response = await fetch(`${API_BASE_URL}/UploadFile`, {
        method: "POST",
        headers: {
          ...authHeaders(),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("تعذر رفع ملف InBody");
      }

      setSelectedFile(null);
      await loadProgress();
    } catch (err) {
      setError(err.message || "صار خطأ أثناء رفع الملف");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownloadFile = (file) => {
    const fileId = pick(file, ["id", "Id", "fileId", "FileId"]);
    if (!fileId) return;

    window.open(`${API_BASE_URL}/DownloadFile/${fileId}`, "_blank");
  };

  const handleDeleteFile = async (file) => {
    const fileId = pick(file, ["id", "Id", "fileId", "FileId"]);
    if (!fileId) return;

    try {
      setError("");

      const response = await fetch(`${API_BASE_URL}/DeleteFile/${fileId}`, {
        method: "DELETE",
        headers: {
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error("تعذر حذف الملف");
      }

      await loadProgress();
    } catch (err) {
      setError(err.message || "صار خطأ أثناء حذف الملف");
    }
  };

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
          value={Number.isFinite(progress) ? progress : 0}
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
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
                onClick={openAddMeasurement}
              >
                إضافة قياس
              </Button>
            </Box>

            {weightData.length ? (
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
            ) : (
              <Alert severity="info">لا توجد قياسات وزن بعد.</Alert>
            )}

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
                <Typography variant="h6">{previousWeight || "-"} كجم</Typography>
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  الوزن الحالي
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {currentWeight || "-"} كجم
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
            ملخص القياسات
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            {measurementStats.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.label}>
                <StatCard {...item} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
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
                  قياسات الجسم
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>الوزن</TableCell>
                        <TableCell align="center">الطول</TableCell>
                        <TableCell align="center">الخصر</TableCell>
                        <TableCell align="center">الورك</TableCell>
                        <TableCell align="center">الصدر</TableCell>
                        <TableCell align="center">الذراع</TableCell>
                        <TableCell align="center">الفخذ</TableCell>
                        <TableCell align="center">إجراءات</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {measurements.map((item, index) => (
                        <TableRow key={pick(item, ["id", "Id"], index)}>
                          <TableCell>{pick(item, ["weight", "Weight"], "-")} كجم</TableCell>
                          <TableCell align="center">{pick(item, ["height", "Height"], "-")}</TableCell>
                          <TableCell align="center">{pick(item, ["waistCircumference", "WaistCircumference"], "-")}</TableCell>
                          <TableCell align="center">{pick(item, ["hipCircumference", "HipCircumference"], "-")}</TableCell>
                          <TableCell align="center">{pick(item, ["chestCircumference", "ChestCircumference"], "-")}</TableCell>
                          <TableCell align="center">{pick(item, ["armCircumference", "ArmCircumference"], "-")}</TableCell>
                          <TableCell align="center">{pick(item, ["thighCircumference", "ThighCircumference"], "-")}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={() => openEditMeasurement(item)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteMeasurement(item)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}

                      {!measurements.length && (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            لا توجد قياسات بعد
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
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
                  ملفات InBody
                </Typography>

                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                  <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                    اختيار ملف
                    <input
                      hidden
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </Button>

                  <Button
                    variant="contained"
                    disabled={!selectedFile || uploadingFile}
                    onClick={handleUploadFile}
                  >
                    {uploadingFile ? "جاري الرفع..." : "رفع"}
                  </Button>
                </Box>

                {selectedFile && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    الملف المختار: {selectedFile.name}
                  </Typography>
                )}

                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {files.map((file, index) => (
                        <TableRow key={pick(file, ["id", "Id", "fileId", "FileId"], index)}>
                          <TableCell>
                            {pick(file, ["fileName", "FileName", "name", "Name"], `ملف ${index + 1}`)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={() => handleDownloadFile(file)}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteFile(file)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}

                      {!files.length && (
                        <TableRow>
                          <TableCell align="center">لا توجد ملفات مرفوعة بعد</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Avatar sx={{ bgcolor: "secondary.light", color: "#fff" }}>
                    <AiIcon />
                  </Avatar>
                  <Box>
                    <Typography fontWeight="bold">تحليل InBody بالذكاء الاصطناعي</Typography>
                    <Typography variant="body2" color="text.secondary">
                      سيظهر التحليل هنا بعد تفعيل API الخاص بالـ AI.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      <Dialog
        open={openMeasurementDialog}
        onClose={() => setOpenMeasurementDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle>
          {editingMeasurement ? "تعديل القياس" : "إضافة قياس جديد"}
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {[
              ["Weight", "الوزن (كجم)"],
              ["Height", "الطول (سم)"],
              ["WaistCircumference", "محيط الخصر"],
              ["HipCircumference", "محيط الورك"],
              ["ChestCircumference", "محيط الصدر"],
              ["ArmCircumference", "محيط الذراع"],
              ["ThighCircumference", "محيط الفخذ"],
            ].map(([field, label]) => (
              <Grid item xs={12} sm={6} key={field}>
                <TextField
                  label={label}
                  type="number"
                  fullWidth
                  value={measurementForm[field]}
                  onChange={(e) => handleMeasurementChange(field, e.target.value)}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenMeasurementDialog(false)}>إلغاء</Button>
          <Button
            onClick={handleSaveMeasurement}
            variant="contained"
            disabled={savingMeasurement}
          >
            {savingMeasurement ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Progress;