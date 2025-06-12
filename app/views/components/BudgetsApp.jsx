import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Space,
  Row,
  Col,
  Modal,
  message,
  Progress,
  FloatButton,
  Typography,
  Divider,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  TagsOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;

const BudgetsApp = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalSpent: 0,
    activeCount: 0,
  });

  const [form] = Form.useForm();

  useEffect(() => {
    fetchBudgets();
    fetchTags();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/budgets.json");
      setBudgets(response.data.budgets || []);
      calculateStats(response.data.budgets || []);
    } catch (error) {
      message.error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get("/tags.json");
      setTags(response.data.tags || []);
    } catch (error) {
      console.error("Failed to load tags");
    }
  };

  const calculateStats = (budgetList) => {
    const totalBudget = budgetList.reduce(
      (sum, budget) => sum + (budget.limit || 0),
      0,
    );
    const totalSpent = budgetList.reduce(
      (sum, budget) => sum + (budget.spent || 0),
      0,
    );
    const activeCount = budgetList.filter((budget) => budget.limit > 0).length;

    setStats({ totalBudget, totalSpent, activeCount });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingBudget) {
        await axios.put(`/api/budgets/${editingBudget.id}.json`, {
          budget: values,
        });
        message.success("Budget updated successfully");
      } else {
        await axios.post("/api/budgets.json", { budget: values });
        message.success("Budget created successfully");
      }
      fetchBudgets();
      handleCancel();
    } catch (error) {
      message.error("Failed to save budget");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    form.setFieldsValue({
      name: budget.name,
      limit: budget.limit,
      tag_list: budget.tag_list || [],
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this budget?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await axios.delete(`/api/budgets/${id}.json`);
          message.success("Budget deleted successfully");
          fetchBudgets();
        } catch (error) {
          message.error("Failed to delete budget");
        }
      },
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBudget(null);
    form.resetFields();
  };

  const getProgressStatus = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return "exception";
    if (percentage >= 80) return "active";
    return "normal";
  };

  const getProgressColor = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return "#ff4d4f";
    if (percentage >= 80) return "#fa8c16";
    return "#52c41a";
  };

  const columns = [
    {
      title: "Budget Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Tags",
      dataIndex: "tag_list",
      key: "tags",
      render: (tags) => (
        <Space wrap>
          {(tags || []).map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Budget Limit",
      dataIndex: "limit",
      key: "limit",
      render: (amount) => (
        <Text strong style={{ color: "#7385d5" }}>
          ${amount && amount.toFixed ? amount.toFixed(2) : "0.00"}
        </Text>
      ),
    },
    {
      title: "Spent",
      dataIndex: "spent",
      key: "spent",
      render: (amount) => (
        <Text style={{ color: "#c85ea2" }}>
          ${amount && amount.toFixed ? amount.toFixed(2) : "0.00"}
        </Text>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      render: (_, record) => {
        const percentage = ((record.spent || 0) / (record.limit || 1)) * 100;
        return (
          <Progress
            percent={Math.min(percentage, 100)}
            status={getProgressStatus(record.spent || 0, record.limit || 1)}
            strokeColor={getProgressColor(record.spent || 0, record.limit || 1)}
            size="small"
          />
        );
      },
    },
    {
      title: "Remaining",
      key: "remaining",
      render: (_, record) => {
        const remaining = (record.limit || 0) - (record.spent || 0);
        return (
          <Text style={{ color: remaining >= 0 ? "#52c41a" : "#ff4d4f" }}>
            ₹{remaining.toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title
          level={2}
          style={{
            background: "linear-gradient(135deg, #1677ff 0%, #69c0ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
          }}
        >
          Budget Management
        </Title>
        <Text type="secondary">Track and manage your spending budgets</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Budget"
              value={stats.totalBudget}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#7385d5" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Spent"
              value={stats.totalSpent}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#c85ea2" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Budgets"
              value={stats.activeCount}
              prefix={<TagsOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Budgets Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={budgets}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} budgets`,
          }}
        />
      </Card>

      {/* Add Budget Modal */}
      <Modal
        title={editingBudget ? "Edit Budget" : "Add New Budget"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Budget Name"
            rules={[{ required: true, message: "Please enter budget name" }]}
          >
            <Input placeholder="Enter budget name" />
          </Form.Item>

          <Form.Item
            name="limit"
            label="Budget Limit"
            rules={[{ required: true, message: "Please enter budget limit" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="0.00"
              min={0}
              precision={2}
              formatter={(value) =>
                `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item name="tag_list" label="Tags">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Select or create tags"
              allowClear
            >
              {tags.map((tag) => (
                <Option key={tag.id} value={tag.name}>
                  {tag.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  background:
                    "linear-gradient(135deg, #1677ff 0%, #69c0ff 100%)",
                  border: "none",
                }}
              >
                {editingBudget ? "Update Budget" : "Create Budget"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Floating Action Button */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{
          right: 24,
          background: "linear-gradient(135deg, #1677ff 0%, #69c0ff 100%)",
          border: "none",
        }}
        onClick={() => setIsModalVisible(true)}
      />
    </div>
  );
};

export default BudgetsApp;
