import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
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
  InputBase,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add,
  Close,
  DeleteOutline,
  Edit,
  Image,
  PlayArrow,
  Search,
  Visibility,
} from "@mui/icons-material";

const API_BASE = "https://nutrilife.runasp.net/api";

const ENDPOINTS = {
  createPost: `${API_BASE}/Posts`,
  updatePost: `${API_BASE}/Posts`,
  deletePost: (id) => `${API_BASE}/Posts/${id}`,
  getPost: (id) => `${API_BASE}/Posts/${id}`,
  getByCreator: (creatorId) => `${API_BASE}/Posts/Creator/${creatorId}`,
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

const decodeJwtPayload = (token) => {
  if (!token) return {};
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error("Could not decode token", error);
    return {};
  }
};

const getCreatorIdFromToken = () => {
  const token = getToken();
  const payload = decodeJwtPayload(token);
  return getValidValue(
    payload.nameid ||
      payload.sub ||
      payload.uid ||
      payload.userId ||
      payload.UserId ||
      payload.id ||
      payload.Id ||
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      payload[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"
      ]
  );
};

const getStoredCreatorId = () =>
  getValidValue(localStorage.getItem("creatorId")) ||
  getValidValue(localStorage.getItem("specialistId")) ||
  getValidValue(localStorage.getItem("userId")) ||
  getValidValue(localStorage.getItem("UserId")) ||
  getCreatorIdFromToken();

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// === دالة مساعدة لتوحيد الرابط (لا تزال مفيدة) ===
const getFullImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const base = "https://nutrilife.runasp.net";
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${base}${cleanUrl}`;
};

// === صورة افتراضية SVG داخلية (لا تعتمد على أي رابط خارجي) ===
const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='180' viewBox='0 0 300 180'%3E%3Crect width='300' height='180' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%2364748b'%3ENo Image%3C/text%3E%3C/svg%3E`;

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
    creatorId: post.creatorId || post.CreatorId || "",
    isSaved: post.isSaved || post.IsSaved || false,
  };
};

const normalizePostsResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.posts)) return data.posts;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data?.posts)) return data.data.posts;
  return [];
};

export default function SpecialistPosts({ creatorId, showSavedOnly = false }) {
  const [openModal, setOpenModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const effectiveCreatorId = useMemo(() => {
    const resolvedCreatorId = getValidValue(creatorId) || getStoredCreatorId();
    if (resolvedCreatorId) {
      localStorage.setItem("creatorId", resolvedCreatorId);
    }
    return resolvedCreatorId;
  }, [creatorId]);

  const fetchPosts = useCallback(async () => {
    if (!getToken()) {
      setError("Token missing. Please log in again.");
      return;
    }
    if (!effectiveCreatorId) {
      setError("Creator ID missing. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(ENDPOINTS.getByCreator(effectiveCreatorId), {
        method: "GET",
        headers: authHeaders(),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("POSTS DATA:", data);
      const postsArray = normalizePostsResponse(data);
      const normalizedPosts = postsArray.map(normalizePost);

      setPosts(
        showSavedOnly
          ? normalizedPosts.filter((post) => post.isSaved)
          : normalizedPosts
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load your posts. Please check your connection and token.");
    } finally {
      setLoading(false);
    }
  }, [effectiveCreatorId, showSavedOnly]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async (formData) => {
    if (!getToken()) {
      throw new Error("Token missing. Please log in again.");
    }

    const body = new FormData();
    body.append("Title", formData.title.trim());
    body.append("Content", formData.content.trim());

    if (formData.images && formData.images.length) {
      formData.images.forEach((file) => {
        body.append("PostImgs", file);
      });
    }

    const response = await fetch(ENDPOINTS.createPost, {
      method: "POST",
      headers: authHeaders(),
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Could not create post");
    }

    await fetchPosts();
  };

  const handleUpdatePost = async (formData) => {
    if (!editingPost?.id) {
      throw new Error("Post id missing.");
    }

    const payload = {
      Id: editingPost.id,
      Title: formData.title.trim(),
      Content: formData.content.trim(),
    };

    const response = await fetch(ENDPOINTS.updatePost, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Could not update post");
    }

    await fetchPosts();
  };

  const handleDeletePost = async (postId) => {
    if (!postId) return;
    if (!window.confirm("Delete this post permanently?")) return;

    try {
      const response = await fetch(ENDPOINTS.deletePost(postId), {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Delete failed");
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      console.error(err);
      setError("Could not delete post. Please try again.");
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) =>
      `${post.title} ${post.content}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [posts, search]);

  const openCreateModal = () => {
    setEditingPost(null);
    setOpenModal(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setOpenModal(true);
  };

  return (
    <Box sx={{ minHeight: "100%", bgcolor: "#f7f8fc", p: { xs: 2, md: 4 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Manage posts
          </Typography>
          <Typography color="text.secondary" fontSize={14}>
            Create, edit, and publish content for your community.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateModal}
          sx={{
            bgcolor: "#00874f",
            borderRadius: 999,
            px: 3,
            textTransform: "none",
            fontWeight: 700,
            "&:hover": { bgcolor: "#006f40" },
          }}
        >
          Add Post
        </Button>
      </Stack>

      <Box
        sx={{
          bgcolor: "#eef3ff",
          borderRadius: 999,
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 3,
        }}
      >
        <Search fontSize="small" sx={{ color: "#64748b" }} />
        <InputBase
          placeholder="Search posts..."
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography color="text.secondary">Loading posts...</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={() => openEditModal(post)}
              onDelete={() => handleDeletePost(post.id)}
            />
          ))}

          {filteredPosts.length === 0 && !loading && (
            <Typography
              sx={{ gridColumn: "1/-1", textAlign: "center", py: 4 }}
              color="text.secondary"
            >
              No posts yet. Click "Add Post" to create your first one.
            </Typography>
          )}
        </Box>
      )}

      <PostModal
        open={openModal}
        post={editingPost}
        onClose={() => setOpenModal(false)}
        onCreate={handleCreatePost}
        onUpdate={handleUpdatePost}
      />
    </Box>
  );
}

// ================== مكون PostCard المُحسَّن ==================
function PostCard({ post, onEdit, onDelete }) {
  const [imgSrc, setImgSrc] = useState(() => {
    const originalUrl = getFullImageUrl(post.image);
    return originalUrl || PLACEHOLDER_SVG;
  });
  const [isUsingPlaceholder, setIsUsingPlaceholder] = useState(!post.image);

  useEffect(() => {
    // عند تغيير البوست، نحاول تحميل الصورة الأصلية
    const originalUrl = getFullImageUrl(post.image);
    if (originalUrl) {
      setImgSrc(originalUrl);
      setIsUsingPlaceholder(false);
    } else {
      setImgSrc(PLACEHOLDER_SVG);
      setIsUsingPlaceholder(true);
    }
  }, [post.image]);

  const handleImageError = () => {
    // إذا فشلت الصورة الأصلية، نستبدلها بالـ SVG الداخلي
    if (!isUsingPlaceholder) {
      setImgSrc(PLACEHOLDER_SVG);
      setIsUsingPlaceholder(true);
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "relative", bgcolor: "#e2e8f0" }}>
        {imgSrc ? (
          <CardMedia
            component="img"
            height="180"
            image={imgSrc}
            alt={post.title}
            sx={{ objectFit: "cover" }}
            onError={handleImageError}
            crossOrigin="anonymous"
          />
        ) : (
          <Box
            sx={{
              height: 180,
              display: "grid",
              placeItems: "center",
              color: "#64748b",
            }}
          >
            <Image />
          </Box>
        )}

        <Chip
          label="Post"
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            bgcolor: "#c9f4e0",
            color: "#00874f",
            fontWeight: 700,
          }}
        />
      </Box>

      <CardContent>
        {post.date && (
          <Typography fontSize={12} color="text.secondary" mb={1}>
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Typography>
        )}

        <Typography fontWeight={800} mb={1}>
          {post.title}
        </Typography>

        <Typography
          fontSize={13}
          color="text.secondary"
          mb={2}
          sx={{ whiteSpace: "pre-wrap" }}
        >
          {post.content}
        </Typography>

        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" spacing={1}>
            <IconButton size="small" sx={{ color: "#00874f" }}>
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: "#00874f" }} onClick={onEdit}>
              <Edit fontSize="small" />
            </IconButton>
          </Stack>
          <IconButton size="small" sx={{ color: "#ef4444" }} onClick={onDelete}>
            <DeleteOutline fontSize="small" />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PostModal({ open, post, onClose, onCreate, onUpdate }) {
  const isEdit = Boolean(post);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    images: [],
  });
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setFormData({
      title: post?.title || "",
      content: post?.content || "",
      images: [],
    });
    setPreviews(post?.image ? [post.image] : []);
    setError("");
  }, [open, post]);

  useEffect(() => {
    return () => {
      previews.forEach((src) => {
        if (src.startsWith("blob:")) {
          URL.revokeObjectURL(src);
        }
      });
    };
  }, [previews]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImagesChange = (event) => {
    const files = Array.from(event.target.files || []);

    previews.forEach((src) => {
      if (src.startsWith("blob:")) {
        URL.revokeObjectURL(src);
      }
    });

    handleChange("images", files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");

    try {
      if (isEdit) {
        await onUpdate(formData);
      } else {
        await onCreate(formData);
      }
      onClose();
    } catch (err) {
      setError(err.message || (isEdit ? "Update failed" : "Creation failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
      BackdropProps={{
        sx: {
          backdropFilter: "blur(5px)",
          bgcolor: "rgba(248,250,252,0.65)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="start">
          <Box>
            <Typography fontWeight={800}>
              {isEdit ? "Update Post" : "Add Post"}
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              Share your expertise with the community.
            </Typography>
          </Box>

          <IconButton onClick={onClose} size="small">
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography fontWeight={700} fontSize={13} mb={1}>
          Images
        </Typography>

        <Box
          sx={{
            minHeight: 130,
            border: "1px dashed #94a3b8",
            bgcolor: "#eef3ff",
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            color: "#64748b",
            mb: 2,
            overflow: "hidden",
          }}
        >
          {previews.length ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
                gap: 1,
                width: "100%",
                p: 1,
              }}
            >
              {previews.map((src, idx) => (
                <Box
                  key={`${src}-${idx}`}
                  component="img"
                  src={src}
                  alt=""
                  sx={{
                    width: "100%",
                    height: 96,
                    objectFit: "cover",
                    borderRadius: 1,
                  }}
                />
              ))}
            </Box>
          ) : (
            <Stack alignItems="center" spacing={0.5}>
              <Image />
              <Typography fontSize={12}>Choose one or more images</Typography>
            </Stack>
          )}
        </Box>

        {!isEdit && (
          <Button
            component="label"
            variant="outlined"
            startIcon={<Image />}
            sx={{
              mb: 2.5,
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              color: "#00874f",
              borderColor: "#00874f",
            }}
          >
            Upload images
            <input
              hidden
              multiple
              type="file"
              accept="image/*"
              onChange={handleImagesChange}
            />
          </Button>
        )}

        <TextField
          fullWidth
          size="small"
          label="Post Title"
          placeholder="Enter a title..."
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          sx={{ mb: 2.5 }}
        />

        <TextField
          fullWidth
          multiline
          minRows={5}
          label="Content"
          placeholder="Write your post content here..."
          value={formData.content}
          onChange={(e) => handleChange("content", e.target.value)}
          sx={{ mb: 2.5 }}
        />

        <Divider sx={{ mx: -3, mb: 2 }} />

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button
            onClick={onClose}
            sx={{
              borderRadius: 999,
              px: 3,
              color: "#00874f",
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={handleSubmit}
            disabled={saving || !formData.title.trim() || !formData.content.trim()}
            sx={{
              borderRadius: 999,
              px: 3,
              bgcolor: "#00874f",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: "#006f40" },
            }}
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Publish"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}