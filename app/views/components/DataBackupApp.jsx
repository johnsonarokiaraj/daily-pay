import React, { useEffect, useState, useRef } from "react";

const DataBackupApp = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [folderId, setFolderId] = useState("");
  const [folderIdInput, setFolderIdInput] = useState("");
  const [folderIdStatus, setFolderIdStatus] = useState(null);
  const [showFolderIdPanel, setShowFolderIdPanel] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState(false);
  const folderIdInputRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/backups/folder_id")
      .then((res) => res.json())
      .then((data) => {
        setFolderId(data.folder_id || "");
        setFolderIdInput(data.folder_id || "");
      });
    fetch("/api/backups")
      .then((res) => res.json())
      .then((data) => {
        setBackups(data.backups || []);
        setLoading(false);
      });
  }, []);

  const handleUploadToDrive = async () => {
    setUploading(true);
    setUploadResult(null);
    try {
      const res = await fetch("/api/backups/upload_to_drive", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setUploadResult({ success: true, fileId: data.file_id, fileName: data.file_name });
      } else {
        setUploadResult({ success: false, error: data.error });
      }
    } catch (e) {
      setUploadResult({ success: false, error: e.message });
    } finally {
      setUploading(false);
    }
  };

  const handleFolderIdSave = async () => {
    setFolderIdStatus(null);
    try {
      const res = await fetch("/api/backups/folder_id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: folderIdInput })
      });
      const data = await res.json();
      if (res.ok) {
        setFolderId(folderIdInput);
        setEditingFolderId(false);
        setFolderIdStatus({ success: true });
      } else {
        setFolderIdStatus({ success: false, error: data.error });
      }
    } catch (e) {
      setFolderIdStatus({ success: false, error: e.message });
    }
  };

  const handleCopyFolderId = () => {
    if (folderId) {
      navigator.clipboard.writeText(folderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <div style={{ padding: 32, position: "relative" }}>
      <h2 style={{ color: "#1677ff", fontWeight: 700 }}>Data Backups</h2>
      {/* Professional Folder ID settings popover */}
      <div style={{ position: "absolute", top: 32, right: 32, zIndex: 20 }}>
        <button
          title="Google Drive Folder Settings"
          onClick={() => setShowFolderIdPanel((v) => !v)}
          style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "50%", width: 36, height: 36, boxShadow: showFolderIdPanel ? "0 2px 8px #0002" : "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "box-shadow 0.2s" }}
        >
          <span role="img" aria-label="settings" style={{ fontSize: 20, color: showFolderIdPanel ? "#1677ff" : "#888" }}>⚙️</span>
        </button>
        {showFolderIdPanel && (
          <div style={{ position: "absolute", top: 44, right: 0, background: "#fff", color: "#23272f", padding: 24, borderRadius: 12, minWidth: 370, boxShadow: "0 4px 24px #0003", marginTop: 8, border: "1px solid #e5e7eb", animation: "fadeIn 0.2s" }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4, color: "#1677ff" }}>Google Drive Folder</div>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
              Set the Google Drive folder where backups will be uploaded. <br />Paste the folder ID from your Drive URL.
            </div>
            {!editingFolderId ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "monospace", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180, background: "#f3f4f6", padding: "4px 10px", borderRadius: 6, border: "1px solid #e5e7eb" }}>{folderId || <span style={{ color: '#bbb' }}>Not set</span>}</span>
                <button
                  onClick={handleCopyFolderId}
                  style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 6, padding: "2px 8px", fontSize: 13, color: copied ? "#16a34a" : "#1677ff", fontWeight: 600, cursor: folderId ? "pointer" : "not-allowed" }}
                  disabled={!folderId}
                  title="Copy Folder ID"
                >{copied ? "Copied!" : "Copy"}</button>
                <button
                  onClick={() => { setEditingFolderId(true); setFolderIdInput(folderId); setFolderIdStatus(null); setTimeout(() => folderIdInputRef.current && folderIdInputRef.current.focus(), 100); }}
                  style={{ background: "#1677ff", color: "#fff", border: "none", borderRadius: 6, padding: "2px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >Edit</button>
                {folderId && (
                  <a
                    href={`https://drive.google.com/drive/folders/${folderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: 4, color: "#1677ff", fontSize: 15, textDecoration: "underline", fontWeight: 500 }}
                    title="Open in Google Drive"
                  >Open</a>
                )}
              </div>
            ) : (
              <form
                onSubmit={e => { e.preventDefault(); handleFolderIdSave(); }}
                style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
              >
                <input
                  ref={folderIdInputRef}
                  type="text"
                  value={folderIdInput}
                  onChange={e => setFolderIdInput(e.target.value)}
                  style={{ width: 200, padding: 6, borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 14, fontFamily: "monospace" }}
                  placeholder="Enter Google Drive Folder ID"
                  required
                  pattern="[a-zA-Z0-9_-]{10,}"
                  title="Google Drive folder IDs are usually 20+ characters."
                />
                <button
                  type="submit"
                  style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, padding: "2px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >Save</button>
                <button
                  type="button"
                  onClick={() => { setEditingFolderId(false); setFolderIdInput(folderId); setFolderIdStatus(null); }}
                  style={{ background: "#888", color: "#fff", border: "none", borderRadius: 6, padding: "2px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >Cancel</button>
              </form>
            )}
            {folderIdStatus && (
              <div style={{ marginTop: 4, color: folderIdStatus.success ? "#16a34a" : "#e53e3e", fontSize: 13 }}>
                {folderIdStatus.success ? "Folder ID saved!" : `Error: ${folderIdStatus.error}`}
              </div>
            )}
          </div>
        )}
      </div>
      <p style={{ color: "#888" }}>
        Automatic daily SQL backups are created when the first transaction of each day is added. Only one backup per day is kept.
      </p>
      <button
        onClick={handleUploadToDrive}
        disabled={uploading}
        style={{ marginBottom: 16, background: "#1677ff", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", cursor: uploading ? "not-allowed" : "pointer", fontWeight: 600 }}
      >
        {uploading ? "Uploading to Google Drive..." : "Upload Latest Backup to Google Drive"}
      </button>
      {uploadResult && (
        <div style={{ marginBottom: 16, color: uploadResult.success ? "#16a34a" : "#e53e3e" }}>
          {uploadResult.success
            ? `Uploaded to Google Drive as '${uploadResult.fileName}' (ID: ${uploadResult.fileId})`
            : `Error: ${uploadResult.error}`}
        </div>
      )}
      {loading ? (
        <div>Loading backups...</div>
      ) : (
        <table style={{ width: "100%", background: "#23272f", color: "#fff", borderRadius: 8, marginTop: 24 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 12 }}>Date</th>
              <th style={{ textAlign: "left", padding: 12 }}>Download</th>
            </tr>
          </thead>
          <tbody>
            {backups.map((backup) => (
              <tr key={backup.filename}>
                <td style={{ padding: 12 }}>{backup.date}</td>
                <td style={{ padding: 12 }}>
                  <a
                    href={backup.url}
                    style={{ color: "#69c0ff", textDecoration: "underline" }}
                    download
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DataBackupApp;
