import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Select,
  Space,
  Row,
  Col,
  Modal,
  message,
  FloatButton,
  Typography,
  Statistic,
  Popconfirm,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;

// Configure axios to include CSRF token
const csrfTokenElement = document.querySelector('meta[name="csrf-token"]');
const csrfToken = csrfTokenElement ? csrfTokenElement.getAttribute('content') : null;
if (csrfToken) {
  axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
}

const TagSetApp = () => {
  const [tagSets, setTagSets] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTagSet, setEditingTagSet] = useState(null);
  const [stats, setStats] = useState({
    totalTagSets: 0,
    totalTags: 0,
  });

  const [form] = Form.useForm();

  useEffect(() => {
    fetchTagSets();
    fetchTags();
  }, []);

  const fetchTagSets = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/tag_sets.json");
      const tagSetsData = Array.isArray(response.data) ? response.data : [];
      setTagSets(tagSetsData);
      calculateStats(tagSetsData);
    } catch (error) {
      message.error("Failed to load tag sets");
      console.error("Error fetching tag sets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get("/api/tags.json");
      const tagsData = Array.isArray(response.data) ? response.data : (response.data.tags || []);
      setTags(tagsData.map(tag => tag.name));
    } catch (error) {
      console.error("Failed to load tags for auto-suggest:", error);
    }
  };

  const calculateStats = (tagSetsList) => {
    const totalTagSets = tagSetsList.length;
    const totalTags = tagSetsList.reduce(
      (sum, tagSet) => sum + (tagSet.tags ? tagSet.tags.length : 0),
      0,
    );
    setStats({ totalTagSets, totalTags });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        tag_set: {
          name: values.name,
          tags: values.tags || []
        }
      };

      if (editingTagSet) {
        await axios.put(`/tag_sets/${editingTagSet.id}.json`, payload);
        message.success("Tag set updated successfully");
      } else {
        await axios.post("/tag_sets.json", payload);
        message.success("Tag set created successfully");
      }
      fetchTagSets();
      handleCancel();
    } catch (error) {
      message.error("Failed to save tag set");
      console.error("Error saving tag set:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tagSet) => {
    setEditingTagSet(tagSet);
    form.setFieldsValue({
      name: tagSet.name,
      tags: tagSet.tags || []
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/tag_sets/${id}.json`);
      message.success("Tag set deleted successfully");
      fetchTagSets();
    } catch (error) {
      message.error("Failed to delete tag set");
      console.error("Error deleting tag set:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTagSet(null);
    form.resetFields();
  };

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Text strong style={{ color: "#1890ff" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags) => (
        <div>
          {tags && tags.map((tag, index) => (
            <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
              {tag}
            </Tag>
          ))}
          {(!tags || tags.length === 0) && (
            <Text type="secondary">No tags</Text>
          )}
        </div>
      ),
    },
    {
      title: "Tag Count",
      key: "tagCount",
      render: (_, record) => (
        <Text>{record.tags ? record.tags.length : 0}</Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: "#1890ff" }}
          />
          <Popconfirm
            title="Are you sure you want to delete this tag set?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              style={{ color: "#ff4d4f" }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "8px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#1e293b" }}>
          <AppstoreOutlined style={{ marginRight: "12px", color: "#3b82f6" }} />
          Tag Sets
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Manage predefined sets of tags for quick transaction tagging
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={24} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Total Tag Sets"
              value={stats.totalTagSets}
              prefix={<AppstoreOutlined style={{ color: "#3b82f6" }} />}
              valueStyle={{ color: "#1e293b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Total Tags"
              value={stats.totalTags}
              prefix={<TagsOutlined style={{ color: "#10b981" }} />}
              valueStyle={{ color: "#1e293b" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tag Sets Table */}
      <Card
        title={
          <Space>
            <AppstoreOutlined />
            <span>Tag Sets</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
          >
            Add Tag Set
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tagSets}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} tag sets`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingTagSet ? "Edit Tag Set" : "Add New Tag Set"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: "20px" }}
        >
          <Form.Item
            name="name"
            label="Tag Set Name"
            rules={[
              { required: true, message: "Please enter a tag set name" },
              { max: 100, message: "Name must be less than 100 characters" },
            ]}
          >
            <Input placeholder="e.g., Grocery Shopping, Monthly Bills" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
            rules={[
              { required: true, message: "Please select at least one tag" },
            ]}
            help="Select tags from existing ones or type new tags"
          >
            <Select
              mode="tags"
              placeholder="Select or type tags..."
              style={{ width: "100%" }}
              dropdownRender={(menu) => (
                <>
                  {tags.length > 0 && (
                    <div
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid #eee",
                        background: "#fafafa",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 500,
                          color: "#888",
                          fontSize: 12,
                        }}
                      >
                        Available tags:{" "}
                      </span>
                      {tags.slice(0, 10).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            display: "inline-block",
                            background: "#e6f7ff",
                            color: "#1677ff",
                            borderRadius: 4,
                            padding: "2px 8px",
                            marginRight: 6,
                            marginBottom: 2,
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const current = form.getFieldValue("tags") || [];
                            if (!current.includes(tag)) {
                              form.setFieldsValue({
                                tags: [...current, tag],
                              });
                            }
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {menu}
                </>
              )}
            >
              {tags.map((tag) => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingTagSet ? "Update" : "Create"} Tag Set
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Floating Action Button */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={showModal}
      />
    </div>
  );
};

export default TagSetApp;
