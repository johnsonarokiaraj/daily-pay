import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, Switch, Space, Tag, Row, Col } from "antd";
import { EditOutlined, CalendarOutlined, TagsOutlined, DollarOutlined, ClockCircleOutlined, PlusOutlined, PlayCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

const RecurringTransactionsApp = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [error, setError] = useState(null);
  const [tagOptions, setTagOptions] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recurring_transactions", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const json = await res.json();
      setData(json.recurring_transactions || []);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/tags", { headers: { Accept: "application/json" } });
      if (!res.ok) return;
      const json = await res.json();
      const names = (json.tags || []).map((t) => t.name).filter(Boolean);
      setTagOptions(names);
    } catch (_) {}
  };

  useEffect(() => {
    fetchData();
    fetchTags();
  }, []);

  const openModal = (record) => {
    if (record) {
      form.setFieldsValue({
        ...record,
        next_run_on: record.next_run_on ? dayjs(record.next_run_on) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ schedule_type: "monthly", is_credit: false, active: true });
    }
    setVisible(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      next_run_on: values.next_run_on ? values.next_run_on.format("YYYY-MM-DD") : undefined,
    };
    const id = form.getFieldValue("id");
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/recurring_transactions/${id}` : "/api/recurring_transactions";
    setSaving(true);
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ recurring_transaction: payload }),
    });
    setSaving(false);
    if (res.ok) {
      setVisible(false);
      await fetchData();
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/recurring_transactions/${id}`, { method: "DELETE" });
    await fetchData();
  };

  const runDueNow = async () => {
    await fetch("/api/recurring_transactions/run_due", { method: "POST" });
    await fetchData();
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Amount", dataIndex: "amount", render: (v) => `₹${Number(v).toFixed(2)}` },
    { title: "Type", dataIndex: "is_credit", render: (v) => (v ? <Tag color="green">Credit</Tag> : <Tag color="red">Debit</Tag>) },
    { title: "Schedule", dataIndex: "schedule_human" },
    { title: "Next Run", dataIndex: "next_run_on" },
    { title: "Tags", dataIndex: "tags", render: (tags=[]) => tags.map(t => <Tag key={t}>{t}</Tag>) },
    { title: "Active", dataIndex: "active", render: (v) => (v ? "Yes" : "No") },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openModal(record)}>Edit</Button>
          <Button size="small" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2>Recurring Transactions</h2>
        <Space>
          <Button icon={<PlayCircleOutlined />} onClick={runDueNow}>Run Due Now</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>New Recurring</Button>
        </Space>
      </div>
      {error && (
        <div style={{ color: "#cf1322", marginBottom: 8 }}>
          {error}
        </div>
      )}
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={{ pageSize: 10 }} />

      <Modal
        title={
          <Space>
            <EditOutlined />
            {form.getFieldValue("id") ? "Edit Recurring Transaction" : "New Recurring Transaction"}
          </Space>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setVisible(false)}>Cancel</Button>,
          <Button key="submit" type="primary" loading={saving} onClick={handleOk}>
            {form.getFieldValue("id") ? "Update" : "Create"}
          </Button>,
        ]}
        width={600}
        destroyOnClose
     >
        <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 20 }}>
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label={<Space><EditOutlined /> Name</Space>}
                rules={[{ required: true, message: "Please enter name" }, { min: 2 }]}
              >
                <Input placeholder="Enter name" size="large" maxLength={100} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label={<Space><DollarOutlined /> Amount</Space>}
                rules={[{ required: true, message: "Please enter amount" }]}
              >
                <Input type="number" placeholder="0.00" size="large" step="0.01" min="0" prefix="₹" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_credit" label="Transaction Type" valuePropName="checked">
                <Switch checkedChildren="Credit" unCheckedChildren="Debit" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="tags" label={<Space><TagsOutlined /> Tags</Space>}>
                <Select
                  mode="tags"
                  size="large"
                  placeholder="Add tags..."
                  style={{ width: "100%" }}
                  tokenSeparators={[","]}
                  showSearch
                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                >
                  {tagOptions.map((t) => (
                    <Option key={t} value={t}>{t}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="schedule_type" label={<Space><ClockCircleOutlined /> Schedule Type</Space>} rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="yearly">Yearly</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item shouldUpdate={(prev, curr) => prev.schedule_type !== curr.schedule_type}>
            {() => {
              const type = form.getFieldValue("schedule_type");
              if (type === "weekly") {
                return (
                  <Form.Item name="weekday" label="Weekday" rules={[{ required: true }]}> 
                    <Select size="large">
                      {"Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(",").map((d, i) => (
                        <Option key={i} value={i}>{d}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              if (type === "monthly") {
                return (
                  <Form.Item name="day_of_month" label="Day of Month" rules={[{ required: true }]}> 
                    <Select size="large">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <Option key={d} value={d}>{d}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              if (type === "yearly") {
                return (
                  <Space style={{ width: "100%" }}>
                    <Form.Item name="month_of_year" label="Month" style={{ flex: 1 }} rules={[{ required: true }]}> 
                      <Select size="large">
                        {dayjs.months().map((m, idx) => (
                          <Option key={idx + 1} value={idx + 1}>{m}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item name="day_of_month" label="Day" style={{ flex: 1 }} rules={[{ required: true }]}> 
                      <Select size="large">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <Option key={d} value={d}>{d}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Space>
                );
              }
              return null;
            }}
          </Form.Item>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="next_run_on" label={<Space><CalendarOutlined /> Next Run On</Space>}>
                <DatePicker size="large" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="active" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default RecurringTransactionsApp;
