import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  AccessTime,
  Close,
  Restaurant,
  BookmarkBorder,
  Bookmark,
  Visibility,
} from "@mui/icons-material";

const API_BASE = "https://nutrilife.runasp.net/api";

const ENDPOINTS = {
  getPost: (id) => `${API_BASE}/Posts/${id}`,
  allPosts: `${API_BASE}/Posts/all`,
  savedPosts: `${API_BASE}/Posts/saved`,
  toggleSave: (id) => `${API_BASE}/Posts/toggle/${id}`,
};

const getValidValue = (value) => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value).trim();
  if (
    !stringValue ||
    stringValue.toLowerCase() === "null" ||
    stringValue.toLowerCase() === "undefined"
  ) {
    return "";
  }
  return stringValue;
};

const getToken = () => getValidValue(localStorage.getItem("token"));

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// === دوال التعامل مع localStorage لحفظ IDs البوستات ===
const STORAGE_KEY = "savedPostIds";

const getSavedPostIds = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return [];
};

const setSavedPostIds = (ids) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

// إضافة أو إزالة ID من المصفوفة المحفوظة
const toggleSavedId = (postId, currentSaved) => {
  const currentIds = getSavedPostIds();
  let newIds;
  if (currentSaved) {
    // إزالة الـ ID
    newIds = currentIds.filter(id => id !== postId);
  } else {
    // إضافة الـ ID إذا لم يكن موجوداً
    if (!currentIds.includes(postId)) {
      newIds = [...currentIds, postId];
    } else {
      newIds = currentIds;
    }
  }
  setSavedPostIds(newIds);
  return newIds;
};

const normalizePost = (post) => {
  let imagesArray = [];
  const rawImages =
    post.postImgs || post.PostImgs || post.images || post.Images || [];

  if (Array.isArray(rawImages)) {
    imagesArray = rawImages
      .map((img) => {
        if (typeof img === "string") return img;
        return img?.imageUrl || img?.ImageUrl || img?.url || img?.Url || "";
      })
      .filter(Boolean);
  }

  const firstImage = imagesArray.length > 0 ? imagesArray[0] : "";

  return {
    id: post.id || post.Id || post.postId || post.PostId,
    title: post.title || post.Title || "",
    content: post.content || post.Content || "",
    date: post.createdAt || post.CreatedAt || post.date || post.Date || "",
    image: firstImage,
    images: imagesArray,
    creatorName: post.creatorName || post.CreatorName || "",
    isSaved: false, // سنقوم بتعيينها لاحقاً بناءً على localStorage
  };
};

const normalizePostsResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.posts)) return data.posts;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

export default function PublicPostsPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [viewMode, setViewMode] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // دمج بيانات البوستات مع حالة الحفظ من localStorage
  const mergeSavedStatus = (postsArray) => {
    const savedIds = getSavedPostIds();
    return postsArray.map(post => ({
      ...post,
      isSaved: savedIds.includes(post.id)
    }));
  };

  const fetchAllPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(ENDPOINTS.allPosts);
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      let postsArray = normalizePostsResponse(data);
      let normalized = postsArray.map(normalizePost);
      normalized = mergeSavedStatus(normalized);
      setPosts(normalized);
    } catch (err) {
      console.error(err);
      setError("Could not load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedPosts = useCallback(async () => {
    if (!getToken()) {
      setError("Please log in to view saved posts.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(ENDPOINTS.savedPosts, {
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch saved posts");
      const data = await response.json();
      let postsArray = normalizePostsResponse(data);
      let normalized = postsArray.map(normalizePost);
      // عند عرض المحفوظات، نضمن أن isSaved = true لكل البوستات (لأنها قادمة من API المحفوظات)
      normalized = normalized.map(post => ({ ...post, isSaved: true }));
      // تحديث localStorage ليتوافق مع ما جاء من API (مزامنة)
      const idsFromApi = normalized.map(p => p.id);
      setSavedPostIds(idsFromApi);
      setPosts(normalized);
    } catch (err) {
      console.error(err);
      setError("Could not load saved posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSave = async (postId, currentSavedState) => {
    if (!getToken()) {
      setError("Please log in to save posts.");
      return;
    }
    // تحديث localStorage أولاً للحصول على استجابة فورية في الواجهة
    const newSavedIds = toggleSavedId(postId, currentSavedState);
    // تحديث حالة البوستات محلياً
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId ? { ...p, isSaved: !currentSavedState } : p
      )
    );
    // إرسال الطلب إلى الخادوم (نحاول حتى لو فشل، سنبقى على الحالة المحلية)
    try {
      await fetch(ENDPOINTS.toggleSave(postId), {
        method: "POST",
        headers: authHeaders(),
      });
    } catch (err) {
      console.error("Toggle save API failed:", err);
      // في حال فشل الـ API، نرجع الحالة القديمة
      toggleSavedId(postId, !currentSavedState); // نرجع localStorage للحالة السابقة
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId ? { ...p, isSaved: currentSavedState } : p
        )
      );
      setError("Could not save/unsave post. Please try again.");
    }
  };

  const fetchPostDetails = async (postId) => {
    try {
      const response = await fetch(ENDPOINTS.getPost(postId), {
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch post details");
      const data = await response.json();
      const normalized = normalizePost(data);
      // إضافة حالة الحفظ من localStorage
      const savedIds = getSavedPostIds();
      return { ...normalized, isSaved: savedIds.includes(normalized.id) };
    } catch (err) {
      console.error(err);
      setError("Could not load post details.");
      return null;
    }
  };

  const handleViewPost = async (post) => {
    if (post.content && post.title) {
      setSelectedPost(post);
    } else {
      const fullPost = await fetchPostDetails(post.id);
      setSelectedPost(fullPost);
    }
  };

  useEffect(() => {
    if (viewMode === "all") fetchAllPosts();
    else fetchSavedPosts();
  }, [viewMode, fetchAllPosts, fetchSavedPosts]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f7f8fc", color: "#111827" }}>
      <Box sx={{ maxWidth: 1180, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: 26, md: 34 } }}>
              Nutrition Posts
            </Typography>
            <Typography color="text.secondary" mt={0.5}>
              Discover healthy tips and meal ideas from our specialists
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant={viewMode === "all" ? "contained" : "outlined"}
              onClick={() => setViewMode("all")}
              sx={{ borderRadius: 999, textTransform: "none" }}
            >
              All Posts
            </Button>
            <Button
              variant={viewMode === "saved" ? "contained" : "outlined"}
              onClick={() => setViewMode("saved")}
              sx={{ borderRadius: 999, textTransform: "none" }}
            >
              Saved
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress sx={{ color: "#00874f" }} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onView={() => handleViewPost(post)}
                onToggleSave={() => toggleSave(post.id, post.isSaved)}
              />
            ))}
            {posts.length === 0 && !loading && (
              <Typography sx={{ gridColumn: "1/-1", textAlign: "center", py: 4 }} color="text.secondary">
                No posts found.
              </Typography>
            )}
          </Box>
        )}
      </Box>
      <PostDetailsModal post={selectedPost} open={Boolean(selectedPost)} onClose={() => setSelectedPost(null)} />
    </Box>
  );
}

function PostCard({ post, onView, onToggleSave }) {
  const formattedDate = post.date ? new Date(post.date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }) : "";

  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
        border: "1px solid #edf0f5",
        bgcolor: "#fff",
        transition: "transform 0.2s",
        "&:hover": { transform: "translateY(-4px)" },
      }}
    >
      <Box sx={{ position: "relative" }}>
        {post.image ? (
          <CardMedia
            component="img"
            image={post.image}
            alt={post.title}
            sx={{ height: 210, objectFit: "cover" }}
            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x200?text=No+Image"; }}
          />
        ) : (
          <Box sx={{ height: 210, bgcolor: "#e2e8f0", display: "grid", placeItems: "center" }}>
            <Restaurant sx={{ fontSize: 48, color: "#94a3b8" }} />
          </Box>
        )}

        <IconButton
          onClick={onToggleSave}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            bgcolor: "rgba(255,255,255,0.9)",
            "&:hover": { bgcolor: "#fff" },
          }}
        >
          {post.isSaved ? (
            <Bookmark sx={{ color: "#00874f" }} />
          ) : (
            <BookmarkBorder sx={{ color: "#64748b" }} />
          )}
        </IconButton>
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Chip label={post.creatorName || "Specialist"} size="small" sx={{ bgcolor: "#eef3ff", fontWeight: 600 }} />
          {formattedDate && <Typography fontSize={12} color="text.secondary">{formattedDate}</Typography>}
        </Stack>

        <Typography fontWeight={800} mb={1} sx={{ fontSize: 18 }}>
          {post.title}
        </Typography>

        <Typography
          fontSize={13}
          color="text.secondary"
          sx={{
            minHeight: 40,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.content}
        </Typography>

        <Button
          fullWidth
          variant="contained"
          startIcon={<Visibility />}
          onClick={onView}
          sx={{
            mt: 2,
            bgcolor: "#007a3d",
            borderRadius: 1.5,
            textTransform: "none",
            fontWeight: 800,
            py: 1,
            "&:hover": { bgcolor: "#006633" },
          }}
        >
          Read More
        </Button>
      </CardContent>
    </Card>
  );
}

function PostDetailsModal({ open, onClose, post }) {
  if (!post) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      BackdropProps={{ sx: { bgcolor: "rgba(15, 23, 42, 0.35)", backdropFilter: "blur(6px)" } }}
    >
      <Box sx={{ position: "relative" }}>
        {post.image ? (
          <Box
            component="img"
            src={post.image}
            alt={post.title}
            sx={{ width: "100%", height: { xs: 220, md: 320 }, objectFit: "cover", display: "block" }}
          />
        ) : (
          <Box sx={{ height: 220, bgcolor: "#e2e8f0", display: "grid", placeItems: "center" }}>
            <Restaurant sx={{ fontSize: 64, color: "#94a3b8" }} />
          </Box>
        )}
        <IconButton onClick={onClose} sx={{ position: "absolute", top: 14, right: 14, bgcolor: "rgba(255,255,255,0.92)" }}>
          <Close />
        </IconButton>
      </Box>

      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight={900}>{post.title}</Typography>
        <Stack direction="row" spacing={2} alignItems="center" mt={1}>
          <Chip label={post.creatorName || "Specialist"} size="small" sx={{ bgcolor: "#eef3ff" }} />
          {post.date && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <AccessTime sx={{ fontSize: 14, color: "#64748b" }} />
              <Typography fontSize={13} color="text.secondary">
                {new Date(post.date).toLocaleDateString()}
              </Typography>
            </Stack>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
          {post.content}
        </Typography>
        {post.images && post.images.length > 1 && (
          <Box mt={3}>
            <Typography fontWeight={800} mb={1}>Additional Images</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {post.images.slice(1).map((img, idx) => (
                <Box key={idx} component="img" src={img} sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1 }} />
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}