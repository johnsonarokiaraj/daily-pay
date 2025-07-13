import React from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Switch,
  Button,
  Space,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  CalendarOutlined,
  TagsOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const TransactionEditModal = ({
  open,
  onCancel,
  onSubmit,
  form,
  editingTransaction,
  tags,
  loading,
}) => {
  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit({
          ...values,
          id: editingTransaction && editingTransaction.id,
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
          Edit Transaction
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
          Update Transaction
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
                  <EditOutlined />
                  Transaction Name
                </Space>
              }
              rules={[
                {
                  required: true,
                  message: "Please enter transaction name",
                },
                {
                  min: 2,
                  message: "Transaction name must be at least 2 characters",
                },
              ]}
            >
              <Input
                placeholder="Enter transaction name"
                size="large"
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="amount"
              label={
                <Space>
                  <DollarOutlined />
                  Amount
                </Space>
              }
              rules={[
                {
                  required: true,
                  message: "Please enter amount",
                },
                {
                  type: "number",
                  min: 0.01,
                  message: "Amount must be greater than 0",
                },
              ]}
            >
              <Input
                type="number"
                placeholder="0.00"
                size="large"
                step="0.01"
                min="0"
                prefix="₹"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="transaction_date"
              label={
                <Space>
                  <CalendarOutlined />
                  Date
                </Space>
              }
              rules={[
                {
                  required: true,
                  message: "Please select transaction date",
                },
              ]}
            >
              <DatePicker
                size="large"
                style={{ width: "100%" }}
                format="DD-MM-YYYY"
                placeholder="Select date"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="tag_list"
              label={
                <Space>
                  <TagsOutlined />
                  Tags
                </Space>
              }
            >
              <Select
                mode="tags"
                size="large"
                placeholder="Add tags..."
                style={{ width: "100%" }}
                tokenSeparators={[","]}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {tags.map((tag) => (
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
              name="is_credit"
              label="Transaction Type"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Credit"
                unCheckedChildren="Debit"
                size="default"
              />
            </Form.Item>
          </Col>
        </Row>

        {editingTransaction && editingTransaction.reminder && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Current Reminder">
                <div
                  style={{
                    padding: "8px 12px",
                    background: "#f5f5f5",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  {editingTransaction.reminder.date && (
                    <div>
                      <strong>Date:</strong> {editingTransaction.reminder.date}
                    </div>
                  )}
                  {editingTransaction.reminder.time && (
                    <div>
                      <strong>Time:</strong> {editingTransaction.reminder.time}
                    </div>
                  )}
                  {editingTransaction.reminder.phone && (
                    <div>
                      <strong>Phone:</strong> {editingTransaction.reminder.phone}
                    </div>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  );
};

export default TransactionEditModal;
