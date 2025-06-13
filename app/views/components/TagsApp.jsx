import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Tag,
  Space,
  Row,
  Col,
  Modal,
  message,
  FloatButton,
  Typography,
  Statistic,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

const TagsApp = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [stats, setStats] = useState({
    totalTags: 0,
    totalUsage: 0,
    totalAmount: 0,
  });

  const [form] = Form.useForm();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/tags.json");
      const tagsData = response.data.tags || [];
      setTags(tagsData);
      calculateStats(tagsData);
    } catch (error) {
      message.error("Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tagsList) => {
    const totalTags = tagsList.length;
    const totalUsage = tagsList.reduce(
      (sum, tag) => sum + (tag.taggings_count || 0),
      0,
    );
    const totalAmount = tagsList.reduce(
      (sum, tag) => sum + (tag.total_amount || 0),
      0,
    );

    setStats({ totalTags, totalUsage, totalAmount });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingTag) {
        await axios.put(`/api/tags/${editingTag.id}.json`, { tag: values });
        message.success("Tag updated successfully");
      } else {
        await axios.post("/api/tags.json", { tag: values });
        message.success("Tag created successfully");
      }
      fetchTags();
      handleCancel();
    } catch (error) {
      message.error("Failed to save tag");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    form.setFieldsValue({
      name: tag.name,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/tags/${id}.json`);
      message.success("Tag deleted successfully");
      fetchTags();
    } catch (error) {
      message.error("Failed to delete tag");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTag(null);
    form.resetFields();
  };

  const getTagColor = (name) => {
    // Generate consistent colors based on tag name
    const colors = [
      "magenta",
      "red",
      "volcano",
      "orange",
      "gold",
      "lime",
      "green",
      "cyan",
      "blue",
      "geekblue",
      "purple",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const columns = [
    {
      title: "Tag Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Tag
          color={getTagColor(text)}
          style={{ fontSize: "14px", padding: "4px 8px" }}
        >
          {text}
        </Tag>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Usage Count",
      dataIndex: "taggings_count",
      key: "usage",
      render: (count) => (
        <Text strong style={{ color: "#7385d5" }}>
          {count || 0} transactions
        </Text>
      ),
      sorter: (a, b) => (a.taggings_count || 0) - (b.taggings_count || 0),
      defaultSortOrder: "descend",
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "amount",
      render: (amount) => (
        <Text strong style={{ color: "#c85ea2" }}>
          ₹{(amount || 0).toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => (a.total_amount || 0) - (b.total_amount || 0),
    },
    {
      title: "Average per Transaction",
      key: "average",
      render: (_, record) => {
        const avg = (record.total_amount || 0) / (record.taggings_count || 1);
        return <Text style={{ color: "#52c41a" }}>₹{avg.toFixed(2)}</Text>;
      },
      sorter: (a, b) => {
        const avgA = (a.total_amount || 0) / (a.taggings_count || 1);
        const avgB = (b.total_amount || 0) / (b.taggings_count || 1);
        return avgA - avgB;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Delete tag"
            description="Are you sure you want to delete this tag? This will remove it from all transactions."
            okText="Yes, Delete"
            cancelText="Cancel"
            okType="danger"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
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
          Tag Management
        </Title>
        <Text type="secondary">Organize and manage your transaction tags</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Tags"
              value={stats.totalTags}
              prefix={<TagsOutlined />}
              valueStyle={{ color: "#7385d5" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Usage"
              value={stats.totalUsage}
              suffix="transactions"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Amount"
              value={stats.totalAmount}
              precision={2}
              prefix="₹"
              valueStyle={{ color: "#c85ea2" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tags Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={tags}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 100,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} tags`,
          }}
        />
      </Card>

      {/* Add/Edit Tag Modal */}
      <Modal
        title={editingTag ? "Edit Tag" : "Add New Tag"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={400}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tag Name"
            rules={[
              { required: true, message: "Please enter tag name" },
              { min: 2, message: "Tag name must be at least 2 characters" },
              { max: 50, message: "Tag name must be less than 50 characters" },
            ]}
          >
            <Input placeholder="Enter tag name" autoFocus />
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
                {editingTag ? "Update Tag" : "Create Tag"}
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

export default TagsApp;
