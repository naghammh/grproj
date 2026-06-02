import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Container, Grid, Typography, Divider, Link } from "@mui/material";
import phLogo from "../../assets/images/phlogo.png";

function Footer() {
  const navigate = useNavigate();

  const handleScrollToHowItWorks = () => {
    // اذهب أولاً للصفحة الرئيسية
    navigate("/", { replace: false });
    // بعد قليل، انزل للقسم
    setTimeout(() => {
      const section = document.getElementById("how-it-works");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 100); // وقت قصير للتمرير بعد الانتقال
  };

  return (
    <Box component="footer" sx={{ bgcolor: "grey.900", color: "common.white", pt: 5, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo & About */}
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" mb={1}>
              <Box
                component="img"
                src={phLogo}
                alt="Logo"
                sx={{ height: 30, mr: 1 }}
              />
              <Typography variant="h6">NutriLife</Typography>
            </Box>
            <Typography variant="body2" color="grey.300" sx={{ lineHeight: 1.6 }}>
              Helping you bridge the gap between<br />
              where you are and where you want to be<br />
              through science and AI.
            </Typography>
          </Grid>

          {/* Product */}
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Product
            </Typography>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Link component={RouterLink} to="/register" color="inherit" underline="none">
                Personalized Plan
              </Link>
              <Link
                component="button"
                onClick={handleScrollToHowItWorks}
                color="inherit"
                underline="none"
                sx={{ textAlign: "left" }}
              >
                How It Works
              </Link>
            </Box>
          </Grid>

          {/* Company */}
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Company
            </Typography>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Link component={RouterLink} to="/about" color="inherit" underline="none">
                About Us
              </Link>
              <Link component={RouterLink} to="/faq" color="inherit" underline="none">
                FAQ
              </Link>
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Contact Us
            </Typography>
            <Typography variant="body2" color="grey.300" mb={0.5}>
              hello@nutrilife.com
            </Typography>
            <Typography variant="body2" color="grey.300">
              0599154587
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: "grey.700" }} />

        <Typography variant="body2" color="grey.400" textAlign="center">
          © 2026 NutriLife. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;