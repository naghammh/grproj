import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Switch,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  PhotoCamera,
  Visibility,
  VisibilityOff,
  Logout,
  DeleteForever,
  LightMode,
  DarkMode,
  Person,
  Lock,
  Palette,
  Warning,
  Save,
  Key,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ThemeModeContext } from "../../App";


const BASE_URL = "https://nutrilife.runasp.net/api/Account";

export default function Settings() {
  const navigate = useNavigate();
  const { darkMode, onThemeToggle } = useContext(ThemeModeContext);
  // ─── User state ─────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ userName: "", email: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // ─── Password state ──────────────────────────────────────────────────────────
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, newPass: false, confirm: false });

  // ─── Dialog state ────────────────────────────────────────────────────────────
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  // ─── Snackbar ────────────────────────────────────────────────────────────────
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnack = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  // ─── Helper: Get user ID from token ─────────────────────────────────────────
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    } catch {
      return null;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // ✅ API Functions - كلها محدثة وشغالة
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // GET - Fetch profile image
  const getProfileImage = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    try {
      const response = await axios.get(`${BASE_URL}/myprofileimg`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const imageSrc = URL.createObjectURL(response.data);
      return { imageUrl: imageSrc };
    } catch (error) {
      console.error("Error fetching profile image:", error);
      return null;
    }
  };

  // POST - Add/Update profile image
  const addProfileImage = async (file) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await axios.post(`${BASE_URL}/addprofileimg`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  // DELETE - Delete profile image
  const deleteProfileImage = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    
    const response = await axios.delete(`${BASE_URL}/deleteprofileimg`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  // ✅ PUT - Update profile (username and email)
  const updateProfileData = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const response = await axios.put(
      `${BASE_URL}/profile`,
      {
        userName: form.userName,
        email: form.email,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  };

  // ✅ put - Change password API (corrected to match required endpoint)
  const changePasswordAPI = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    if (!user?.email) throw new Error("User email not found");

    const payload = {
      Email: user.email,
      OldPassword: passwords.current,
      NewPassword: passwords.newPass
    };

    const response = await axios.put(
      `${BASE_URL}/ChangePass`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  };

  // Load profile image on component mount
  const loadProfileImage = async () => {
    try {
      const imageData = await getProfileImage();
      if (imageData?.imageUrl) {
        setCurrentImageUrl(imageData.imageUrl);
        setAvatarPreview(imageData.imageUrl);
      }
    } catch (error) {
      console.error("Failed to load image:", error);
    }
  };

  // ─── Load user from token ────────────────────────────────────────────────────
 // ─── Load user from token ────────────────────────────────────────────────────
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;
  
  const loadUser = async () => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        showSnack("Unable to verify user identity.", "error");
        return;
      }
      // ✅ استخدم الرابط الصحيح لجلب بيانات المستخدم مباشرة
      const response = await axios.get(`${BASE_URL}/GetClient/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentUser = response.data;
      if (currentUser) {
        setUser(currentUser);
        setForm({ 
          userName: currentUser.userName || "", 
          email: currentUser.email || "" 
        });
      }
      await loadProfileImage();
    } catch (err) {
      console.error("Error loading user data:", err);
      // عرض رسالة خطأ أكثر تحديداً من الاستجابة
      const errorMessage = err.response?.data?.message || "Failed to load user data.";
      showSnack(errorMessage, "error");
    }
  };
  
  loadUser();
}, []);

  // ─── Avatar Change Handler ────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showSnack("الرجاء اختيار ملف صورة", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showSnack("حجم الصورة يجب أن يكون أقل من 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setCurrentImageUrl(reader.result);
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      await addProfileImage(file);
      showSnack("تم تحديث صورة الملف الشخصي بنجاح! ✓", "success");
    } catch (error) {
      console.error("Upload error:", error);
      showSnack("فشل تحميل الصورة. حاول مرة أخرى.", "error");
      setAvatarPreview(currentImageUrl);
    } finally {
      setUploadingImage(false);
    }
  };

  // ─── Delete Image Handler ────────────────────────────────────
  const handleDeleteImage = async () => {
    setUploadingImage(true);
    try {
      await deleteProfileImage();
      setCurrentImageUrl(null);
      setAvatarPreview(null);
      showSnack("تم حذف صورة الملف الشخصي بنجاح! ✓", "success");
    } catch (error) {
      console.error("Delete error:", error);
      showSnack("فشل حذف الصورة. حاول مرة أخرى.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // ─── Save profile ────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!form.userName.trim() || !form.email.trim()) {
      showSnack("الرجاء ملء جميع الحقول", "warning");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      showSnack("الرجاء إدخال بريد إلكتروني صحيح", "error");
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfileData();
      showSnack("تم حفظ البيانات بنجاح! ✓", "success");
      setUser(prev => ({ ...prev, userName: form.userName, email: form.email }));
    } catch (error) {
      console.error("Save error:", error);
      showSnack(error.response?.data?.message || "فشل حفظ البيانات. حاول مرة أخرى.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // ─── Change password - updated for correct API ──────────────────────────────
  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      showSnack("الرجاء ملء جميع حقول كلمة المرور", "warning");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showSnack("كلمة المرور الجديدة غير متطابقة", "error");
      return;
    }
    if (passwords.newPass.length < 6) {
      showSnack("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "warning");
      return;
    }
    if (!user?.email) {
      showSnack("لا يمكن العثور على البريد الإلكتروني", "error");
      return;
    }

    setChangingPassword(true);
    try {
      await changePasswordAPI();
      showSnack("تم تغيير كلمة المرور بنجاح! ✓", "success");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (error) {
      console.error("Password change error:", error);
      let errorMsg = "فشل تغيير كلمة المرور. تأكد من كلمة المرور الحالية.";
      if (error.response?.status === 400) {
        errorMsg = error.response.data?.message || "كلمة المرور الحالية غير صحيحة أو البريد الإلكتروني غير موجود.";
      } else if (error.response?.status === 401) {
        errorMsg = "الجلسة منتهية. الرجاء تسجيل الدخول مرة أخرى.";
      }
      showSnack(errorMsg, "error");
    } finally {
      setChangingPassword(false);
    }
  };

  // ─── Logout ──────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ─── Delete account ─────────────────────────────────────────
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnack("No authentication token found", "error");
        return;
      }

      const userId = getUserIdFromToken();
      if (!userId) {
        showSnack("Unable to verify user identity", "error");
        return;
      }

      const API_URL = "https://nutrilife.runasp.net/api/Account";
      
      await axios({
        method: 'delete',
        url: `${API_URL}/deleteAccount`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: {
          id: userId,
          password: deletePassword,
          currentPassword: deletePassword
        }
      });

      localStorage.removeItem("token");
      showSnack("Account deleted successfully!", "success");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      console.error("Delete account error:", err);
      
      if (err.response) {
        if (err.response.status === 401) {
          showSnack("Session expired. Please login again.", "error");
        } else if (err.response.status === 400) {
          showSnack(err.response.data?.message || "Invalid password or request", "error");
        } else {
          showSnack(err.response.data?.message || "Failed to delete account", "error");
        }
      } else if (err.request) {
        showSnack("Network error. Please check your connection.", "error");
      } else {
        showSnack("An unexpected error occurred.", "error");
      }
    }
  };

  // ─── Section header - بالأخضر ─────────────────────────────────
  const SectionHeader = ({ icon, title, subtitle }) => (
    <Box display="flex" alignItems="center" gap={1.5} mb={3}>
      <Box
        sx={{
          width: 40, height: 40, borderRadius: 2,
          bgcolor: "#2e7d32",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography fontWeight={700} fontSize={16}>{title}</Typography>
        {subtitle && <Typography fontSize={12} color="text.secondary">{subtitle}</Typography>}
      </Box>
    </Box>
  );

  const greenButtonSx = {
    mt: 3,
    borderRadius: 2,
    textTransform: "none",
    px: 4,
    bgcolor: "#2e7d32",
    "&:hover": { bgcolor: "#1b5e20" },
  };

  const greenOutlinedSx = {
    mt: 3,
    borderRadius: 2,
    textTransform: "none",
    px: 4,
    borderColor: "#2e7d32",
    color: "#2e7d32",
    "&:hover": { borderColor: "#1b5e20", bgcolor: "rgba(46, 125, 50, 0.04)" },
  };
  const cardSx = {
    borderRadius: 3,
    mb: 3,
    boxShadow: 2,
    bgcolor: "background.paper",
    color: "text.primary",
    backgroundImage: "none",
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        transition: "background-color 0.25s ease, color 0.25s ease",
      }}
    >
      <Typography variant="h5" fontWeight={700} mb={0.5} sx={{ color: "#2e7d32" }}>
        Settings ⚙️
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Manage your account preferences and security.
      </Typography>

      {/* PROFILE INFO */}
      <Card sx={cardSx}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<Person fontSize="small" />}
            title="Profile Information"
            subtitle="Update your name, email and profile picture"
          />

          <Box display="flex" alignItems="center" gap={3} mb={3} flexWrap="wrap">
            <Box position="relative">
              <Avatar 
                src={avatarPreview || currentImageUrl} 
                sx={{ width: 80, height: 80, fontSize: 32 }}
              >
                {(!avatarPreview && !currentImageUrl) && (form.userName?.[0]?.toUpperCase() || "U")}
              </Avatar>
              
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: "50%",
                  bgcolor: "rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  opacity: 0,
                  transition: "opacity 0.3s",
                  "&:hover": { opacity: 1 },
                  cursor: "pointer",
                }}
              >
                <label htmlFor="avatar-upload" style={{ cursor: "pointer" }}>
                  <input 
                    accept="image/*" 
                    id="avatar-upload" 
                    type="file" 
                    hidden 
                    onChange={handleAvatarChange}
                    disabled={uploadingImage}
                  />
                  <IconButton 
                    component="span" 
                    size="small"
                    disabled={uploadingImage}
                    sx={{ color: "white", bgcolor: "rgba(0,0,0,0.5)" }}
                  >
                    <PhotoCamera sx={{ fontSize: 20 }} />
                  </IconButton>
                </label>
                
                {(currentImageUrl || avatarPreview) && (
                  <IconButton 
                    size="small" 
                    onClick={handleDeleteImage}
                    disabled={uploadingImage}
                    sx={{ color: "white", bgcolor: "rgba(255,0,0,0.5)" }}
                  >
                    <DeleteForever sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
              </Box>
              
              {uploadingImage && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: "50%",
                    bgcolor: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress size={24} sx={{ color: "#2e7d32" }} />
                </Box>
              )}
            </Box>
            
            <Box>
              <Typography fontWeight={600}>{form.userName || "User"}</Typography>
              <Chip label="Client" size="small" sx={{ mt: 0.5, fontSize: 11, bgcolor: "#2e7d32", color: "#fff" }} />
              <Typography fontSize={11} color="text.secondary" sx={{ mt: 0.5 }}>
                {uploadingImage ? "جاري التحميل..." : "حوّم على الصورة للتعديل أو الحذف"}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Username" size="small" fullWidth
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
              sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2e7d32" } }}
            />
            <TextField
              label="Email" size="small" fullWidth type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2e7d32" } }}
            />
          </Box>

          <Button
            variant="contained"
            sx={greenButtonSx}
            onClick={handleSaveProfile}
            disabled={savingProfile}
            startIcon={savingProfile ? <CircularProgress size={20} color="inherit" /> : <Save />}
          >
            {savingProfile ? "جاري الحفظ..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* CHANGE PASSWORD - CORRECTED */}
      <Card sx={cardSx}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<Lock fontSize="small" />}
            title="Change Password"
            subtitle="Keep your account secure with a strong password"
          />

          <Box display="flex" flexDirection="column" gap={2}>
            {[
              { key: "current", label: "Current Password" },
              { key: "newPass", label: "New Password" },
              { key: "confirm", label: "Confirm New Password" },
            ].map(({ key, label }) => (
              <TextField
                key={key} label={label} size="small" fullWidth
                type={showPasswords[key] ? "text" : "password"}
                value={passwords[key]}
                onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2e7d32" } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small"
                        onClick={() => setShowPasswords((p) => ({ ...p, [key]: !p[key] }))}
                      >
                        {showPasswords[key]
                          ? <VisibilityOff fontSize="small" />
                          : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            ))}
          </Box>

          <Button
            variant="outlined"
            sx={greenOutlinedSx}
            onClick={handleChangePassword}
            disabled={changingPassword}
            startIcon={changingPassword ? <CircularProgress size={20} color="inherit" /> : <Key />}
          >
            {changingPassword ? "جاري التغيير..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* APPEARANCE */}
      <Card sx={cardSx}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<Palette fontSize="small" />}
            title="Appearance"
            subtitle="Choose your preferred theme"
          />
          <Box
            display="flex" alignItems="center" justifyContent="space-between"
            sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              {darkMode ? <DarkMode sx={{ color: "#2e7d32" }} /> : <LightMode sx={{ color: "#f57c00" }} />}
              <Box>
                <Typography fontWeight={600} fontSize={14}>
                  {darkMode ? "Dark Mode" : "Light Mode"}
                </Typography>
                <Typography fontSize={12} color="text.secondary">
                  {darkMode ? "Easy on the eyes at night" : "Bright and clear display"}
                </Typography>
              </Box>
            </Box>
            <Switch
  checked={!!darkMode}
  onChange={(e) => onThemeToggle(e.target.checked)}
  sx={{
    "& .MuiSwitch-switchBase.Mui-checked": { color: "#2e7d32" },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      bgcolor: "#2e7d32",
    },
  }}
/>



          </Box>
        </CardContent>
      </Card>

      {/* ACCOUNT ACTIONS */}
      <Card sx={{ ...cardSx, mb: 0 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<Warning fontSize="small" />}
            title="Account Actions"
            subtitle="Manage your session and account"
          />

          <Box display="flex" flexDirection="column" gap={2}>
            <Box
              display="flex" alignItems="center" justifyContent="space-between"
              sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
            >
              <Box>
                <Typography fontWeight={600} fontSize={14}>Log Out</Typography>
                <Typography fontSize={12} color="text.secondary">Sign out from your account</Typography>
              </Box>
              <Button
                variant="outlined" startIcon={<Logout />}
                onClick={() => setLogoutDialog(true)}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Log Out
              </Button>
            </Box>

            <Divider />

            <Box
              display="flex" alignItems="center" justifyContent="space-between"
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "error.light",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(211, 47, 47, 0.08)"
                    : "#fff5f5",
              }}
                          >
              <Box>
                <Typography fontWeight={600} fontSize={14} color="error.main">Delete Account</Typography>
                <Typography fontSize={12} color="text.secondary">
                  Permanently remove your account and data
                </Typography>
              </Box>
              <Button
                variant="outlined" color="error" startIcon={<DeleteForever />}
                onClick={() => setDeleteDialog(true)}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* DIALOGS */}
      <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)}PaperProps={{
  sx: {
    borderRadius: 3,
    bgcolor: "background.paper",
    color: "text.primary",
    backgroundImage: "none",
  },
}}
>
        <DialogTitle fontWeight={700}>Log Out?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to log out of your account?</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setLogoutDialog(false)} sx={{ borderRadius: 2, textTransform: "none" }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleLogout} 
            sx={{ borderRadius: 2, textTransform: "none", bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
          >
            Yes, Log Out
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog}
        onClose={() => { setDeleteDialog(false); setDeletePassword(""); }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "background.paper",
            color: "text.primary",
            backgroundImage: "none",
          },
        }}
        
      >
        <DialogTitle fontWeight={700} color="error.main">Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText mb={2}>
            This action is <strong>permanent and irreversible</strong>.
            Enter your password to confirm.
          </DialogContentText>
          <TextField
            fullWidth size="small" label="Password"
            type={showDeletePassword ? "text" : "password"}
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowDeletePassword((p) => !p)}>
                    {showDeletePassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => { setDeleteDialog(false); setDeletePassword(""); }}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained" color="error"
            disabled={!deletePassword}
            onClick={() => { setDeleteDialog(false); handleDelete(); }}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Delete My Account
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2, width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}