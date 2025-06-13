import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Popconfirm,
  Tag,
  Typography,
  Card,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import styled from "styled-components";

const ViewLink = styled.span`
  color: #1890ff;
  cursor: pointer;
  &:active {
    color: lightgreen;
  }
`;

const { Title, Text, Link } = Typography;

const ViewsApp = () => {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingView, setEditingView] = useState(null);
  const [form] = Form.useForm();

  // Fetch all views
  const fetchViews = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/views");
      setViews(response.data.views || []);
    } catch (error) {
      message.error("Failed to load views");
    } finally {
      setLoading(false);
    }
  };

  // Load views on component mount
  useEffect(() => {
    fetchViews();
  }, []);

  // Handle create/update view
  const handleSubmit = async (values) => {
    try {
      if (editingView) {
        await axios.patch(`/api/views/${editingView.id}`, { view: values });
        message.success("View updated successfully");
      } else {
        await axios.post("/api/views", { view: values });
        message.success("View created successfully");
      }

      setIsModalVisible(false);
      setEditingView(null);
      form.resetFields();
      fetchViews();
    } catch (error) {
      message.error("Failed to save view");
    }
  };

  // Handle delete view
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/views/${id}`);
      message.success("View deleted successfully");
      fetchViews();
    } catch (error) {
      message.error("Failed to delete view");
    }
  };

  // Handle apply view (navigate to transactions with filters)
  const handleApplyView = async (view) => {
    try {
      const response = await axios.get(`/api/views/${view.id}`);
      const filters = response.data.filters;

      // Create query parameters from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      // Navigate to transactions page with filters applied
      window.location.href = `/transactions?${queryParams.toString()}`;
    } catch (error) {
      message.error("Failed to apply view");
    }
  };

  // Open modal for create/edit
  const openModal = (view = null) => {
    setEditingView(view);
    setIsModalVisible(true);

    if (view) {
      form.setFieldsValue({
        name: view.name,
        filters:
          typeof view.filters === "string"
            ? view.filters
            : JSON.stringify(view.filters, null, 2),
      });
    } else {
      form.resetFields();
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalVisible(false);
    setEditingView(null);
    form.resetFields();
  };

  // Format filters for display
  const formatFilters = (filters) => {
    try {
      const parsed =
        typeof filters === "string" ? JSON.parse(filters) : filters;
      const filterArray = [];

      if (parsed.start_date) filterArray.push(`Start: ${parsed.start_date}`);
      if (parsed.end_date) filterArray.push(`End: ${parsed.end_date}`);
      if (parsed.tag_list) filterArray.push(`Tags: ${parsed.tag_list}`);

      return filterArray.length > 0 ? filterArray : ["No filters"];
    } catch {
      return ["Invalid filters"];
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <ViewLink onClick={() => handleApplyView(record)}>{text}</ViewLink>
      ),
    },
    {
      title: "Filters",
      dataIndex: "filters",
      key: "filters",
      render: (filters) => (
        <div>
          {formatFilters(filters).map((filter, index) => (
            <Tag key={index} style={{ marginBottom: 4 }}>
              {filter}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => dayjs(date).format("DD-MM-YYYY HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleApplyView(record)}
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this view?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            Saved Views
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Create View
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={views}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Modal
        title={editingView ? "Edit View" : "Create New View"}
        open={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="View Name"
            rules={[{ required: true, message: "Please enter view name" }]}
          >
            <Input placeholder="Enter view name" />
          </Form.Item>

          <Form.Item
            name="filters"
            label="Filters (JSON)"
            rules={[{ required: true, message: "Please enter filters" }]}
          >
            <Input.TextArea
              rows={6}
              placeholder='{"start_date": "01-01-2024", "end_date": "31-12-2024", "tag_list": "work,personal"}'
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingView ? "Update" : "Create"}
              </Button>
              <Button onClick={closeModal}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ViewsApp;
