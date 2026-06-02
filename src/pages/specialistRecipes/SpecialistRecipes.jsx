import React, { useEffect, useMemo, useState } from "react";
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
  Bookmark,
  BookmarkBorder,
  Close,
  DeleteOutline,
  Edit,
  Image,
  PlayArrow,
  Search,
  Visibility,
} from "@mui/icons-material";

const POSTS_API = {
  allPosts: ({ page = 1, pageSize = 10 } = {}) =>
    `https://nutrilife.runasp.net/api/Posts?Page=${page}&PageSize=${pageSize}`,
  addPost: "https://nutrilife.runasp.net/api/Posts",
  updatePost: "https://nutrilife.runasp.net/api/Posts",
  deletePost: (id) => `https://nutrilife.runasp.net/api/Posts/${id}`,
  getPost: (id) => `https://nutrilife.runasp.net/api/Posts/${id}`,
  getByCreator: (creatorId) =>
    `https://nutrilife.runasp.net/api/Posts/Creator/${creatorId}`,
  savedPosts: "https://nutrilife.runasp.net/api/Posts/saved",
  toggleSave: (id) => `https://nutrilife.runasp.net/api/Posts/toggle/${id}`,
};

const getToken = () => localStorage.getItem("token");

const getStoredCreatorId = () =>
  localStorage.getItem("creatorId") ||
  localStorage.getItem("specialistId") ||
  localStorage.getItem("userId") ||
  localStorage.getItem("id");

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizePost = (post) => {
  const images =
    post.postImgs ||
    post.PostImgs ||
    post.images ||
    post.Images ||
    post.postImages ||
    [];

  const firstImage = Array.isArray(images)
    ? images[0]?.imageUrl || images[0]?.url || images[0]
    : images;

  return {
    id: post.id || post.Id,
    title: post.title || post.Title || "",
    content: post.content || post.Content || "",
    date: post.createdAt || post.CreatedAt || post.date || "",
    image: firstImage || "",
    images: Array.isArray(images) ? images : firstImage ? [firstImage] : [],
    creatorId: post.creatorId || post.CreatorId,
    isSaved: post.isSaved || post.IsSaved || false,
  };
};

export default function SpecialistRecipes({ creatorId, showSavedOnly = false }) {
  const [open, setOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [creatorId, showSavedOnly]);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");

    try {
      const currentCreatorId = creatorId || getStoredCreatorId();
      const url = currentCreatorId
        ? POSTS_API.getByCreator(currentCreatorId)
        : showSavedOnly
          ? POSTS_API.savedPosts
          : "";

      if (!url) {
        setPosts([]);
        setError(
          "Creator id is missing. Pass creatorId to this page or save it in localStorage."
        );
        return;
      }

      const res = await fetch(url, {
        headers: {
          ...authHeaders(),
        },
      });

      if (!res.ok) {
        throw new Error("Could not load posts");
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.items || data.data || [];
      setPosts(list.map(normalizePost));
    } catch (err) {
      setError("Could not load posts. Please check the posts endpoint.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (formData) => {
    const body = new FormData();
    body.append("Title", formData.title);
    body.append("Content", formData.content);

    formData.images.forEach((file) => {
      body.append("PostImgs", file);
    });

    const res = await fetch(POSTS_API.addPost, {
      method: "POST",
      headers: {
        ...authHeaders(),
      },
      body,
    });

    if (!res.ok) {
      throw new Error("Could not create post");
    }

    await fetchPosts();
    setOpen(false);
  };

  const handleUpdatePost = async (formData) => {
    const res = await fetch(POSTS_API.updatePost, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({
        Id: selectedPost.id,
        Title: formData.title,
        Content: formData.content,
      }),
    });

    if (!res.ok) {
      throw new Error("Could not update post");
    }

    await fetchPosts();
    setSelectedPost(null);
    setOpen(false);
  };

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) return;

    const res = await fetch(POSTS_API.deletePost(postId), {
      method: "DELETE",
      headers: {
        ...authHeaders(),
      },
    });

    if (!res.ok) {
      setError("Could not delete post. Please check the delete endpoint.");
      return;
    }

    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handleToggleSave = async (postId) => {
    const res = await fetch(POSTS_API.toggleSave(postId), {
      method: "POST",
      headers: {
        ...authHeaders(),
      },
    });

    if (!res.ok) {
      setError("Could not update saved posts. Please check the save endpoint.");
      return;
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      )
    );
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const text = `${post.title} ${post.content}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [posts, search]);

  const openCreateModal = () => {
    setSelectedPost(null);
    setOpen(true);
  };

  const openEditModal = (post) => {
    setSelectedPost(post);
    setOpen(true);
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        bgcolor: "#f7f8fc",
        p: { xs: 2, md: 4 },
      }}
    >
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
              onEdit={openEditModal}
              onDelete={handleDeletePost}
              onToggleSave={handleToggleSave}
            />
          ))}
        </Box>
      )}

      <AddPostModal
        open={open}
        post={selectedPost}
        onClose={() => setOpen(false)}
        onCreate={handleCreatePost}
        onUpdate={handleUpdatePost}
      />
    </Box>
  );
}

function PostCard({ post, onEdit, onDelete, onToggleSave }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "relative", bgcolor: "#e2e8f0" }}>
        {post.image ? (
          <CardMedia
            component="img"
            height="180"
            image={post.image}
            alt={post.title}
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

        <Typography fontSize={13} color="text.secondary" mb={2}>
          {post.content}
        </Typography>

        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" spacing={1}>
            <IconButton size="small" sx={{ color: "#00874f" }}>
              <Visibility fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              sx={{ color: "#00874f" }}
              onClick={() => onToggleSave(post.id)}
            >
              {post.isSaved ? (
                <Bookmark fontSize="small" />
              ) : (
                <BookmarkBorder fontSize="small" />
              )}
            </IconButton>

            <IconButton
              size="small"
              sx={{ color: "#00874f" }}
              onClick={() => onEdit(post)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Stack>

          <IconButton
            size="small"
            sx={{ color: "#ef4444" }}
            onClick={() => onDelete(post.id)}
          >
            <DeleteOutline fontSize="small" />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}

function AddPostModal({ open, post, onClose, onCreate, onUpdate }) {
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImagesChange = (event) => {
    const files = Array.from(event.target.files || []);
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
    } catch (err) {
      setError(
        isEdit
          ? "Could not update post. Please check the update endpoint."
          : "Could not publish post. Please check the add post endpoint."
      );
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
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 24px 70px rgba(15, 23, 42, 0.25)",
        },
      }}
      BackdropProps={{
        sx: {
          backdropFilter: "blur(5px)",
          bgcolor: "rgba(248, 250, 252, 0.65)",
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
              {previews.map((src) => (
                <Box
                  key={src}
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
            disabled={saving || !formData.title || !formData.content}
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
