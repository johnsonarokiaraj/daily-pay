import React, { useEffect, useState } from 'react';
import { Modal, Form, InputNumber, DatePicker, Select, Button, message } from 'antd';
import { createTarget, updateTarget, fetchViews } from './api/targetsApi';
import dayjs from 'dayjs';

const TARGET_TYPES = [
  { label: 'Credit', value: 'credit' },
  { label: 'Debit', value: 'debit' },
  { label: 'Balance', value: 'balance' },
];

export default function TargetForm({ visible, target, onClose }) {
  const [form] = Form.useForm();
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchViews().then((data) => {
        // Defensive: ensure array
        setViews(Array.isArray(data) ? data : (data && data.views ? data.views : []));
      });
      if (target) {
        form.setFieldsValue({ ...target, target_date: target.target_date && dayjs(target.target_date) });
        handleViewChange(target.view_id);
      } else {
        form.resetFields();
        setStats(null);
      }
    }
  }, [visible, target]);

  // Fetch stats for selected view
  const handleViewChange = async (viewId) => {
    if (!viewId) { setStats(null); return; }
    setStatsLoading(true);
    try {
      // Find the view and get its filters
      const view = views.find(v => v.id === viewId);
      if (!view) { setStats(null); setStatsLoading(false); return; }
      // Use the filters from the view to fetch stats
      // We'll use the transactions API with the view's filters
      let filters = {};
      if (view.filters) {
        if (typeof view.filters === 'string') {
          try { filters = JSON.parse(view.filters); } catch { filters = {}; }
        } else {
          filters = view.filters;
        }
      }
      // Format dates for API
      if (filters.start_date) filters.start_date = filters.start_date;
      if (filters.end_date) filters.end_date = filters.end_date;
      // Fetch stats from transactions API
      const res = await fetch('/api/transactions/stats?' + new URLSearchParams(filters));
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    }
    setStatsLoading(false);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (target) {
        await updateTarget(target.id, values);
        message.success('Target updated');
      } else {
        await createTarget(values);
        message.success('Target created');
      }
      onClose();
    } catch (e) {
      // validation error or API error
    }
    setLoading(false);
  };

  return (
    <Modal
      title={target ? 'Edit Target' : 'New Target'}
      visible={visible}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="view_id" label="View" rules={[{ required: true }]}> 
          <Select 
            options={views.map(v => ({ label: v.name, value: v.id }))} 
            showSearch 
            onChange={handleViewChange}
          />
        </Form.Item>
        {statsLoading ? (
          <div style={{ marginBottom: 12 }}>Loading stats...</div>
        ) : stats ? (
          <div style={{ marginBottom: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, padding: 12 }}>
            <b>Current Stats for this View:</b><br />
            Credit: <span style={{ color: '#16a34a', fontWeight: 500 }}>₹{stats.credit || 0}</span> &nbsp;|
            Debit: <span style={{ color: '#7385d5', fontWeight: 500 }}>₹{stats.debit || 0}</span> &nbsp;|
            Balance: <span style={{ color: '#f59e0b', fontWeight: 500 }}>₹{(stats.credit || 0) - (stats.debit || 0)}</span>
          </div>
        ) : null}
        <Form.Item name="target_type" label="Type" rules={[{ required: true }]}> 
          <Select options={TARGET_TYPES} />
        </Form.Item>
        <Form.Item name="value" label="Target Value" rules={[{ required: true }]}> 
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="target_date" label="Target Date" rules={[{ required: true }]}> 
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
