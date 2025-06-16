import React, { useEffect, useState } from "react";

const DataBackupApp = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/backups")
      .then((res) => res.json())
      .then((data) => {
        setBackups(data.backups || []);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: "#1677ff", fontWeight: 700 }}>Data Backups</h2>
      <p style={{ color: "#888" }}>
        Automatic daily SQL backups are created when the first transaction of each day is added. Only one backup per day is kept.
      </p>
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
