import React, { useEffect, useState } from 'react';
import { Spin, Typography } from 'antd';
import { fetchTargetProgress } from './api/targetsApi';

const { Text } = Typography;

export default function TargetProgressBar({ target }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!target) return;
    setLoading(true);
    fetchTargetProgress(target.id)
      .then((data) => setProgress(data))
      .finally(() => setLoading(false));
  }, [target]);

  if (loading) return <Spin size="small" />;
  if (!progress || !progress.data || !Array.isArray(progress.data)) return <Text type="secondary">No data</Text>;

  const points = progress.data.filter(d => d.hasOwnProperty(target.target_type));
  if (points.length === 0) return <Text type="secondary">No data</Text>;
  const latest = points[points.length - 1][target.target_type];
  const targetValue = target.value;
  const percent = Math.min(100, Math.max(0, (latest / targetValue) * 100));

  return (
    <div style={{ width: 120 }}>
      <div style={{
        background: '#e6f4ff',
        borderRadius: 8,
        height: 16,
        width: '100%',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          width: percent + '%',
          height: '100%',
          background: 'linear-gradient(90deg, #1677ff 80%, #e6f4ff 100%)',
          transition: 'width 0.6s cubic-bezier(.4,2,.6,1)',
        }} />
      </div>
      <div style={{ fontSize: 12, marginTop: 2, textAlign: 'right' }}>
        <Text type="secondary">{percent.toFixed(1)}%</Text>
      </div>
    </div>
  );
}

