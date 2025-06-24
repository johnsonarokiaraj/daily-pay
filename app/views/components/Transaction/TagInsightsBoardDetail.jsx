import React, { useEffect, useState } from "react";
import { Card, Typography, Tag, Spin, Button, message, Collapse } from "antd";
import { useParams, useNavigate } from "react-router-dom";

const { Title } = Typography;

export default function TagInsightsBoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/tag_insights_boards/${id}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load board");
        return res.json();
      })
      .then((data) => {
        setBoard(data.board || data); // support both {board: ...} and direct
        setInsights(data.flattened || []);
        setLoading(false);
      })
      .catch(() => {
        message.error("Failed to load board");
        setLoading(false);
      });
  }, [id]);

  // Group sub_tag rows and their transactions
  const subTagGroups = [];
  let currentSubTag = null;
  insights.forEach((row, idx) => {
    if (row.type === "sub_tag") {
      currentSubTag = { subTag: row, transactions: [] };
      subTagGroups.push(currentSubTag);
    } else if (row.type === "transaction" && currentSubTag) {
      currentSubTag.transactions.push(row);
    }
  });

  if (loading) return <Spin style={{ margin: 48 }} />;
  if (!board) return <div style={{ padding: 24 }}>Board not found.</div>;


  const items = subTagGroups.map((group, idx) => ({
    key: group.subTag.tag + idx,
    label: (
      <span style={{ color: '#2b3a55', fontWeight: 500, fontSize: 16 }}>
        {group.subTag.tag} &nbsp; | &nbsp; Sum: <b>{group.subTag.sum}</b> &nbsp; | &nbsp; Transactions: <b>{group.subTag.count}</b>
      </span>
    ),
    children: (
      <div>
        {group.transactions.length === 0 ? (
          <div style={{ color: '#888', fontSize: 15 }}>No transactions.</div>
        ) : (
          group.transactions.map((row, tIdx) => (
            <Card
              key={tIdx}
              size="small"
              style={{ marginBottom: 10, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              bodyStyle={{ padding: 12, display: 'flex', alignItems: 'center', gap: 16 }}
            >
              <span style={{ color: '#888', minWidth: 90 }}>{row.date}</span>
              <span style={{ fontWeight: 500, flex: 1 }}>{row.name}</span>
              <span style={{ color: row.amount >= 0 ? '#16a34a' : '#d32f2f', fontWeight: 600, minWidth: 80, textAlign: 'right' }}>
                ₹{row.amount}
              </span>
              <span>
                {row.tags && row.tags.map((tag) => (
                  <Tag key={tag} color="purple" style={{ marginRight: 4 }}>{tag}</Tag>
                ))}
              </span>
            </Card>
          ))
        )}
      </div>
    ),
  }));

  return (
    <div style={{ padding: 24 }}>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 16, background: '#f0f5ff', color: '#1677ff', border: 'none', fontWeight: 500 }}>
        &larr; Back
      </Button>
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0, color: '#1677ff', fontWeight: 700 }}>{board.name}</Title>
          <div>
            <Tag color="blue" style={{ fontSize: 16, padding: '4px 16px', borderRadius: 6 }}>Main: {board.main_tag}</Tag>
            {Array.isArray(board.sub_tags) && board.sub_tags.length > 0 && (
              <span style={{ marginLeft: 8 }}>
                {board.sub_tags.map(tag => (
                  <Tag key={tag} color="geekblue" style={{ fontSize: 15, borderRadius: 6 }}>{tag}</Tag>
                ))}
              </span>
            )}
          </div>
        </div>
        <div style={{ marginBottom: 24, borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
          <Title level={4} style={{ margin: 0, color: '#444' }}>Summary</Title>
        </div>
        {insights.length === 0 ? (
          <div style={{ color: '#888', fontSize: 16 }}>No data.</div>
        ) : (
          <div>
            {/* Main tag summary */}
            {insights.map((row, idx) => (
              row.type === "main_tag" ? (
                <div key={idx} style={{ background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: 8, padding: 14, marginBottom: 16, fontWeight: 600, fontSize: 17 }}>
                  <span style={{ color: '#389e0d' }}>{row.tag}</span> &nbsp; | &nbsp; Sum: <b>{row.sum}</b> &nbsp; | &nbsp; Transactions: <b>{row.count}</b>
                </div>
              ) : null
            ))}
            {/* Sub tags collapsible */}
            <Collapse accordion  items={items} style={{ background: 'transparent' }} />
          </div>
        )}
      </Card>
    </div>
  );
}
