import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
    Paper,
  } from "@mui/material";
  import CloudUploadIcon from "@mui/icons-material/CloudUpload";
  import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
  import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
  import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
  import WaterDropIcon from "@mui/icons-material/WaterDrop";
  import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
  import SaveIcon from "@mui/icons-material/Save";
  import SendIcon from "@mui/icons-material/Send";
  
  const metrics = [
    {
      title: "BMI",
      value: "24.2",
      unit: "kg/m²",
      status: "Normal",
      color: "#087a28",
      icon: <MonitorHeartIcon fontSize="small" />,
    },
    {
      title: "Muscle Mass",
      value: "34.8",
      unit: "kg",
      status: "Excellent",
      color: "#087a28",
      icon: <FitnessCenterIcon fontSize="small" />,
    },
    {
      title: "Body Water",
      value: "62.1",
      unit: "%",
      status: "Hydrated",
      color: "#087a28",
      icon: <WaterDropIcon fontSize="small" />,
    },
    {
      title: "Body Fat %",
      value: "26.4",
      unit: "%",
      status: "Above Range",
      color: "#d32f2f",
      icon: <FavoriteBorderIcon fontSize="small" />,
    },
  ];
  
  export default function AIBodyAnalysis() {
    return (
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f8fbf7" }}>
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2, borderBottom: "1px solid #e6eee6" }}>
          <Typography sx={{ color: "#007a22", fontWeight: 700 }}>
            AI Body Analysis
          </Typography>
        </Box>
  
        <Box sx={{ px: { xs: 2, md: 3 }, py: 3, maxWidth: 980 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Precision Body Composition
          </Typography>
  
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", maxWidth: 560, mb: 3 }}
          >
            Upload your InBody report and let AI extract your body composition data
            automatically using high-precision optical recognition.
          </Typography>
  
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Paper
              variant="outlined"
              sx={{
                flex: 1,
                minHeight: 190,
                borderColor: "#67c878",
                bgcolor: "#f3f6f2",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: 2,
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    mx: "auto",
                    mb: 2,
                    borderRadius: "50%",
                    bgcolor: "#48b957",
                    color: "#063f16",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <CloudUploadIcon />
                </Box>
  
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                  Drop your report here
                </Typography>
  
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Supported formats: PDF, JPG, PNG (Max 10MB)
                </Typography>
  
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{
                      bgcolor: "#007a22",
                      borderRadius: 999,
                      px: 3,
                      textTransform: "none",
                      "&:hover": { bgcolor: "#00631c" },
                    }}
                  >
                    Choose File
                    <input hidden type="file" accept=".pdf,.jpg,.jpeg,.png" />
                  </Button>
                </Box>
              </Box>
            </Paper>
  
            <Paper
              variant="outlined"
              sx={{
                width: { xs: "100%", md: 255 },
                minHeight: 190,
                borderColor: "#d7ead9",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: 3,
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    mx: "auto",
                    mb: 2,
                    borderRadius: "50%",
                    border: "3px solid #e8ecef",
                    borderTopColor: "#007a22",
                    display: "grid",
                    placeItems: "center",
                    color: "#007a22",
                  }}
                >
                  <AutoAwesomeIcon />
                </Box>
  
                <Typography variant="body2" sx={{ color: "#007a22", mb: 1 }}>
                  Analyzing Report...
                </Typography>
  
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Mapping biological markers and composition ratios with neural
                  processing.
                </Typography>
              </Box>
            </Paper>
          </Stack>
  
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <Typography sx={{ fontWeight: 700 }}>
              Extracted Composition Metrics
            </Typography>
  
            <Chip
              label="AI Verified"
              size="small"
              sx={{
                bgcolor: "#10bcd4",
                color: "#063f46",
                fontWeight: 600,
              }}
            />
          </Stack>
  
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
              mb: 4,
            }}
          >
            {metrics.map((item) => (
              <Card
                key={item.title}
                elevation={0}
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={0.8}>
                    <Box sx={{ color: item.color }}>{item.icon}</Box>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {item.title}
                    </Typography>
                  </Stack>
  
                  <Typography sx={{ fontSize: 24, fontWeight: 700, mt: 1 }}>
                    {item.value}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ ml: 0.5, color: "text.secondary" }}
                    >
                      {item.unit}
                    </Typography>
                  </Typography>
  
                  <Typography
                    variant="caption"
                    sx={{ color: item.color, fontWeight: 700 }}
                  >
                    ● {item.status}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
  
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 5 }}
          >
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                minWidth: 190,
                py: 1.3,
                bgcolor: "#007a22",
                textTransform: "none",
                borderRadius: 1.5,
                "&:hover": { bgcolor: "#00631c" },
              }}
            >
              Save Analysis
            </Button>
  
            <Button
              variant="outlined"
              startIcon={<SendIcon />}
              sx={{
                minWidth: 190,
                py: 1.3,
                color: "#007a22",
                borderColor: "#007a22",
                textTransform: "none",
                borderRadius: 1.5,
                "&:hover": {
                  borderColor: "#00631c",
                  bgcolor: "#eef8f0",
                },
              }}
            >
              Send to Specialist
            </Button>
          </Stack>
  
          <Typography
            align="center"
            sx={{
              color: "#007a22",
              fontWeight: 700,
              maxWidth: 760,
              mx: "auto",
              textShadow: "0 2px 4px rgba(0,0,0,0.18)",
            }}
          >
            AI-powered body composition analysis helps nutrition specialists create
            more personalized meal plans and monitor client progress accurately.
          </Typography>
        </Box>
      </Box>
    );
  }
  