import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, message, Button, Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchTargetProgress, fetchViews, deleteTarget } from './api/targetsApi';
import TargetForm from './TargetForm';

const { Title, Text } = Typography;

export default function TargetDetail({ target, onBack }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewName, setViewName] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (!target) return;
    setLoading(true);
    fetchTargetProgress(target.id)
      .then((data) => setProgress(data))
      .catch(() => message.error('Failed to load progress'))
      .finally(() => setLoading(false));
    fetchViews().then((viewsData) => {
      let arr = Array.isArray(viewsData) ? viewsData : (viewsData && viewsData.views ? viewsData.views : []);
      const v = arr.find((v) => v.id === target.view_id);
      setViewName(v ? v.name : '');
    });
  }, [target]);

  const handleDelete = async () => {
    Modal.confirm({
      title: 'Delete target?',
      onOk: async () => {
        await deleteTarget(target.id);
        onBack();
      },
    });
  };

  if (!target) return null;

  return (
    <Card style={{ marginTop: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a onClick={onBack} style={{ color: '#1677ff', cursor: 'pointer' }}>&larr; Back to Targets</a>
        <div>
          <Button size="small" icon={<EditOutlined />} style={{ marginRight: 8 }} onClick={() => setShowEdit(true)} />
          <Button size="small" icon={<DeleteOutlined />} danger onClick={handleDelete} />
        </div>
      </div>
      {showEdit ? (
        <TargetForm visible={showEdit} target={target} onClose={() => { setShowEdit(false); onBack(); }} />
      ) : (
        <>
          <Title level={3} style={{ marginBottom: 0 }}>{target.name || 'Target'}</Title>
          <Text type="secondary">Type: {target.target_type} | Target: {target.value} by {target.target_date}</Text>
          <div style={{ margin: '32px 0' }}>
            {loading ? <Spin /> : progress && progress.data && Array.isArray(progress.data) && (
              (() => {
                // Only use dates present in transactions
                const points = progress.data.filter(d => d.hasOwnProperty(target.target_type));
                if (points.length === 0) return <Text>No progress data available.</Text>;
                const latest = points[points.length - 1][target.target_type];
                const targetValue = target.value;
                const percent = Math.min(100, Math.max(0, (latest / targetValue) * 100));
                return (
                  <div style={{ width: '100%', maxWidth: 500 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text strong>Current: <span style={{ color: '#1677ff' }}>{latest}</span></Text>
                      <Text>Target: <span style={{ color: '#52c41a' }}>{targetValue}</span></Text>
                    </div>
                    <div style={{
                      background: '#e6f4ff',
                      borderRadius: 8,
                      height: 32,
                      width: '100%',
                      overflow: 'hidden',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{
                        width: percent + '%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #1677ff 80%, #e6f4ff 100%)',
                        transition: 'width 0.6s cubic-bezier(.4,2,.6,1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: percent > 15 ? 'flex-end' : 'flex-start',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 16,
                        paddingRight: percent > 15 ? 12 : 0,
                        paddingLeft: percent <= 15 ? 12 : 0,
                      }}>
                        <span>{latest}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">{percent.toFixed(1)}% of target reached</Text>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </>
      )}
    </Card>
  );
}
