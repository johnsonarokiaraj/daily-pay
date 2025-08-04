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
  ThunderboltOutlined,
  RobotOutlined,
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

const AutoTagRuleApp = () => {
  const [autoTagRules, setAutoTagRules] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [stats, setStats] = useState({
    totalRules: 0,
    totalRequiredTags: 0,
    totalAutoTags: 0,
  });

  const [form] = Form.useForm();

  useEffect(() => {
    fetchAutoTagRules();
    fetchTags();
  }, []);

  const fetchAutoTagRules = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/auto_tag_rules.json");
      const rulesData = Array.isArray(response.data) ? response.data : [];
      setAutoTagRules(rulesData);
      calculateStats(rulesData);
    } catch (error) {
      message.error("Failed to load auto tag rules");
      console.error("Error fetching auto tag rules:", error);
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

  const calculateStats = (rulesList) => {
    const totalRules = rulesList.length;
    const totalRequiredTags = rulesList.reduce(
      (sum, rule) => sum + (rule.required_tags ? rule.required_tags.length : 0),
      0,
    );
    const totalAutoTags = rulesList.reduce(
      (sum, rule) => sum + (rule.auto_tags ? rule.auto_tags.length : 0),
      0,
    );
    setStats({ totalRules, totalRequiredTags, totalAutoTags });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        auto_tag_rule: {
          required_tags: values.required_tags || [],
          auto_tags: values.auto_tags || []
        }
      };

      if (editingRule) {
        await axios.put(`/auto_tag_rules/${editingRule.id}.json`, payload);
        message.success("Auto tag rule updated successfully");
      } else {
        await axios.post("/auto_tag_rules.json", payload);
        message.success("Auto tag rule created successfully");
      }
      fetchAutoTagRules();
      handleCancel();
    } catch (error) {
      message.error("Failed to save auto tag rule");
      console.error("Error saving auto tag rule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    form.setFieldsValue({
      required_tags: rule.required_tags || [],
      auto_tags: rule.auto_tags || []
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/auto_tag_rules/${id}.json`);
      message.success("Auto tag rule deleted successfully");
      fetchAutoTagRules();
    } catch (error) {
      message.error("Failed to delete auto tag rule");
      console.error("Error deleting auto tag rule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRule(null);
    form.resetFields();
  };

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const TagSelectField = ({ name, label, placeholder, help }) => (
    <Form.Item
      name={name}
      label={label}
      rules={[
        { required: true, message: `Please select at least one ${label.toLowerCase()}` },
      ]}
      help={help}
    >
      <Select
        mode="tags"
        placeholder={placeholder}
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
                      const current = form.getFieldValue(name) || [];
                      if (!current.includes(tag)) {
                        form.setFieldsValue({
                          [name]: [...current, tag],
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
  );

  const columns = [
    {
      title: "Required Tags",
      dataIndex: "required_tags",
      key: "required_tags",
      render: (tags) => (
        <div>
          {tags && tags.map((tag, index) => (
            <Tag key={index} color="orange" style={{ marginBottom: 4 }}>
              {tag}
            </Tag>
          ))}
          {(!tags || tags.length === 0) && (
            <Text type="secondary">No required tags</Text>
          )}
        </div>
      ),
    },
    {
      title: "Auto Tags",
      dataIndex: "auto_tags",
      key: "auto_tags",
      render: (tags) => (
        <div>
          {tags && tags.map((tag, index) => (
            <Tag key={index} color="green" style={{ marginBottom: 4 }}>
              {tag}
            </Tag>
          ))}
          {(!tags || tags.length === 0) && (
            <Text type="secondary">No auto tags</Text>
          )}
        </div>
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
            title="Are you sure you want to delete this auto tag rule?"
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
          <RobotOutlined style={{ marginRight: "12px", color: "#3b82f6" }} />
          Auto Tag Rules
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Automatically apply tags when transactions contain specific required tags
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={24} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8} lg={8}>
          <Card size="small">
            <Statistic
              title="Total Rules"
              value={stats.totalRules}
              prefix={<RobotOutlined style={{ color: "#3b82f6" }} />}
              valueStyle={{ color: "#1e293b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={8}>
          <Card size="small">
            <Statistic
              title="Required Tags"
              value={stats.totalRequiredTags}
              prefix={<TagsOutlined style={{ color: "#f59e0b" }} />}
              valueStyle={{ color: "#1e293b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={8}>
          <Card size="small">
            <Statistic
              title="Auto Tags"
              value={stats.totalAutoTags}
              prefix={<ThunderboltOutlined style={{ color: "#10b981" }} />}
              valueStyle={{ color: "#1e293b" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Auto Tag Rules Table */}
      <Card
        title={
          <Space>
            <RobotOutlined />
            <span>Auto Tag Rules</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
          >
            Add Rule
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={autoTagRules}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} auto tag rules`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingRule ? "Edit Auto Tag Rule" : "Add New Auto Tag Rule"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: "20px" }}
        >
          <TagSelectField
            name="required_tags"
            label="Required Tags"
            placeholder="Select tags that must be present..."
            help="When a transaction has ALL of these tags, the auto tags will be applied"
          />

          <TagSelectField
            name="auto_tags"
            label="Auto Tags"
            placeholder="Select tags to automatically apply..."
            help="These tags will be automatically added when the required tags are present"
          />

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRule ? "Update" : "Create"} Rule
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

export default AutoTagRuleApp;
