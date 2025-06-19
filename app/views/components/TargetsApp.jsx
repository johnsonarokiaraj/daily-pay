import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, message } from 'antd';
import TargetForm from './TargetForm';
import TargetDetail from './TargetDetail';
import { fetchTargets, deleteTarget } from './api/targetsApi';

export default function TargetsApp() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);

  const loadTargets = async () => {
    setLoading(true);
    try {
      const data = await fetchTargets();
      setTargets(data);
    } catch (e) {
      message.error('Failed to load targets');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTargets();
  }, []);

  const handleEdit = (target) => {
    setEditingTarget(target);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Delete target?',
      onOk: async () => {
        await deleteTarget(id);
        loadTargets();
      },
    });
  };

  const handleShowDetail = (target) => {
    setDetailTarget(target);
    setShowDetail(true);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Targets</h2>
        <Button type="primary" onClick={() => { setEditingTarget(null); setShowForm(true); }}>New Target</Button>
      </div>
      {!showDetail ? (
        <Table
          dataSource={targets}
          rowKey="id"
          loading={loading}
          columns={[
            { title: 'View', dataIndex: 'view_id' },
            { title: 'Type', dataIndex: 'target_type' },
            { title: 'Value', dataIndex: 'value' },
            { title: 'Date', dataIndex: 'target_date' },
            {
              title: 'Actions',
              render: (_, record) => (
                <>
                  <Button size="small" onClick={() => handleShowDetail(record)} style={{ marginRight: 8 }}>View</Button>
                  <Button size="small" onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>Edit</Button>
                  <Button size="small" danger onClick={() => handleDelete(record.id)}>Delete</Button>
                </>
              ),
            },
          ]}
        />
      ) : (
        <TargetDetail target={detailTarget} onBack={() => setShowDetail(false)} />
      )}
      <TargetForm
        visible={showForm}
        target={editingTarget}
        onClose={() => { setShowForm(false); loadTargets(); }}
      />
    </div>
  );
}
