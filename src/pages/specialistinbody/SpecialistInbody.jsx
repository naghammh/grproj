import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useParams } from "react-router-dom";

export default function SpecialistInbody() {
  const { clientId } = useParams();
  const token = localStorage.getItem("token");

  const [files, setFiles] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    if (!clientId) return;

    try {
      const res = await axios.get(
        `https://nutrilife.runasp.net/api/ProgressTracking/GetByClientId?clientId=${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("FILES RESPONSE:", res.data);
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("GET ERROR STATUS:", err.response?.status);
      console.log("GET ERROR DATA:", err.response?.data);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFileName(file.name);
    setLoading(true);

    const formData = new FormData();
    formData.append("File", file);
    formData.append("ClientId", clientId);

    try {
      await axios.post(
        "https://nutrilife.runasp.net/api/ProgressTracking/UploadFile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Uploaded ✅");
      fetchFiles();
    } catch (err) {
      console.log("UPLOAD ERROR STATUS:", err.response?.status);
      console.log("UPLOAD ERROR DATA:", err.response?.data);
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id, fileName = "file") => {
    try {
      const res = await axios.get(
        `https://nutrilife.runasp.net/api/ProgressTracking/DownloadFile/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName || "file";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log("DOWNLOAD ERROR STATUS:", err.response?.status);
      console.log("DOWNLOAD ERROR DATA:", err.response?.data);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://nutrilife.runasp.net/api/ProgressTracking/DeleteFile/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchFiles();
    } catch (err) {
      console.log("DELETE ERROR STATUS:", err.response?.status);
      console.log("DELETE ERROR DATA:", err.response?.data);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [clientId]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={1}>
        Client AI Health Analysis
      </Typography>

      <Typography color="text.secondary" mb={3}>
        Client ID: {clientId}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Upload File
        </Typography>

        <Button variant="contained" component="label" disabled={loading}>
          {loading ? "UPLOADING..." : "CHOOSE FILE"}
          <input type="file" hidden onChange={handleUpload} />
        </Button>

        {selectedFileName && (
          <Typography mt={2}>
            Selected file: <strong>{selectedFileName}</strong>
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Uploaded Files
        </Typography>

        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#eef1f3" }}>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>File</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {files.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.id}</TableCell>
                <TableCell>{f.fileName || "Unnamed file"}</TableCell>
                <TableCell>
                  <Button onClick={() => handleDownload(f.id, f.fileName)}>
                    Download
                  </Button>

                  <Button color="error" onClick={() => handleDelete(f.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {files.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  No files found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}