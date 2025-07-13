import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  TagsOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const TagInsightsBoardEditModal = ({
  open,
  onCancel,
  onSubmit,
  form,
  editingBoard,
  tags,
  loading,
}) => {
  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit({
          ...values,
          id: editingBoard && editingBoard.id,
        });
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          Edit Tag Insights Board
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Update Board
        </Button>,
      ]}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        style={{ marginTop: "20px" }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label={
                <Space>
                  <AppstoreOutlined />
                  Board Name
                </Space>
              }
              rules={[
                {
                  required: true,
                  message: "Please enter board name",
                },
                {
                  min: 2,
                  message: "Board name must be at least 2 characters",
                },
              ]}
            >
              <Input
                placeholder="Enter board name"
                size="large"
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="main_tag"
              label={
                <Space>
                  <TagsOutlined />
                  Main Tag
                </Space>
              }
              rules={[
                {
                  required: true,
                  message: "Please select main tag",
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Select main tag"
                style={{ width: "100%" }}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {(tags || []).map((tag) => (
                  <Option key={tag} value={tag}>
                    {tag}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="sub_tags"
              label={
                <Space>
                  <TagsOutlined />
                  Sub Tags
                </Space>
              }
              rules={[
                {
                  required: true,
                  message: "Please select at least one sub tag",
                },
              ]}
            >
              <Select
                mode="multiple"
                size="large"
                placeholder="Select sub tags..."
                style={{ width: "100%" }}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {(tags || []).map((tag) => (
                  <Option key={tag} value={tag}>
                    {tag}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TagInsightsBoardEditModal;
