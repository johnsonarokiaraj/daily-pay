import React, { useState, useRef } from "react";
import {
  Table,
  Form,
  Input,
  DatePicker,
  Select,
  Tag,
  Space,
  Button,
  Typography,
  Switch,
  message,
  Popover,
  TimePicker,
  Modal,
} from "antd";
import {
  CalendarOutlined,
  TagsOutlined,
  SearchOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  BellOutlined,
  WhatsAppOutlined,
  DollarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  parseTransactionDate,
  formatDisplayDate,
} from "./utils/transactionUtils";
import {
  StyledCard,
  FilterDropdownContainer,
  TagFilterDropdownContainer,
  FilterButtonSpace,
  FormInputContainer,
  AmountInputSpace,
  FilterButton,
  FilterButtonSmall,
  SearchInput,
  TagSelect,
  DropdownTag,
  AmountText,
  FilterIcon,
  FormItemWrapper,
  InlineFormItem,
  TagsContainer,
  MinWidthSelect,
} from "./TransactionTable.styles";

const { Text, Title } = Typography;
const { Option } = Select;

// Reminder form component (reused from table)
const ReminderForm = ({ reminder, onChange, onSave, onCancel }) => {
  const [date, setDate] = useState(
    reminder && reminder.date ? dayjs(reminder.date) : null,
  );
  const [time, setTime] = useState(
    reminder && reminder.time ? dayjs(reminder.time, "HH:mm") : null,
  );
  const [phone, setPhone] = useState((reminder && reminder.phone) || "");
  const [snooze, setSnooze] = useState(
    (reminder && reminder.snooze) || "1_day",
  );
  const [whatsapp, setWhatsapp] = useState(
    !(reminder && reminder.whatsapp === false),
  );

  const handleSave = () => {
    onSave({
      date: date ? date.format("YYYY-MM-DD") : null,
      time: time ? time.format("HH:mm") : null,
      phone,
      snooze,
      whatsapp,
    });
  };

  return (
    <div style={{ minWidth: 250 }}>
      <div style={{ marginBottom: 8 }}>
        <DatePicker value={date} onChange={setDate} style={{ width: "100%" }} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <TimePicker
          value={time}
          onChange={setTime}
          format="HH:mm"
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <Input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <Select value={snooze} onChange={setSnooze} style={{ width: "100%" }}>
          <Option value="1_day">Snooze: 1 Day</Option>
          <Option value="1_week">Snooze: 1 Week</Option>
        </Select>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>
          <WhatsAppOutlined style={{ color: "#25D366", marginRight: 4 }} />
          <input
            type="checkbox"
            checked={whatsapp}
            onChange={(e) => setWhatsapp(e.target.checked)}
          />
          &nbsp;Send via WhatsApp
        </label>
      </div>
      <div style={{ textAlign: "right" }}>
        <Button size="small" onClick={onCancel} style={{ marginRight: 8 }}>
          Cancel
        </Button>
        <Button size="small" type="primary" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

// Reminder cell component
const ReminderCell = ({ reminder, record, onUpdate }) => {
  const [visible, setVisible] = useState(false);
  const handleSave = (reminderData) => {
    setVisible(false);
    onUpdate({ ...record, reminder: reminderData, id: record.id });
  };
  return (
    <Popover
      content={
        <ReminderForm
          reminder={reminder}
          onChange={() => {}}
          onSave={handleSave}
          onCancel={() => setVisible(false)}
        />
      }
      title="Set Reminder"
      trigger="click"
      open={visible}
      onOpenChange={setVisible}
    >
      <Button
        size="small"
        icon={<BellOutlined />}
        type={reminder && reminder.date ? "primary" : "default"}
      >
        {reminder && reminder.date ? "Edit" : "Set"}
      </Button>
    </Popover>
  );
};

const TransactionList = ({
  transactions,
  loading,
  editingTransaction,
  tags,
  pagination,
  searchText,
  searchedColumn,
  onTableChange,
  onEdit,
  onCancelEdit,
  onUpdate,
  onSearch,
  onReset,
  form,
}) => {
  // State for modal editing
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm] = Form.useForm();

  // State for reminder form visibility within edit modal
  const [showReminderForm, setShowReminderForm] = useState(false);

  // Handle modal edit
  const handleEditClick = (record) => {
    setEditingRecord(record);
    setEditModalVisible(true);
    const parsedDate = parseTransactionDate(record.transaction_date);
    editForm.setFieldsValue({
      ...record,
      transaction_date: parsedDate,
      tag_list: record.tag_list,
      is_credit: record.is_credit || false,
    });
  };

  // Handle modal save
  const handleModalSave = async () => {
    try {
      const values = await editForm.validateFields();
      const updateData = {
        ...editingRecord,
        ...values,
        transaction_date: values.transaction_date
          ? values.transaction_date.format("YYYY-MM-DD")
          : editingRecord.transaction_date,
        id: editingRecord.id,
      };

      await onUpdate(updateData);
      setEditModalVisible(false);
      setEditingRecord(null);
      editForm.resetFields();
    } catch (error) {
      console.error("Error saving transaction:", error);
      message.error("Failed to update transaction");
    }
  };

  // Handle reminder click
  const handleReminderClick = () => {
    setShowReminderForm(!showReminderForm);
  };

  // Handle reminder save
  const handleReminderSave = (reminderData) => {
    onUpdate({
      ...editingRecord,
      reminder: reminderData,
      id: editingRecord.id,
    });
    setShowReminderForm(false);
    // Update the editingRecord to reflect the new reminder
    setEditingRecord({ ...editingRecord, reminder: reminderData });
  };

  // Handle reminder cancel
  const handleReminderCancel = () => {
    setShowReminderForm(false);
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setEditModalVisible(false);
    setEditingRecord(null);
    setShowReminderForm(false);
    editForm.resetFields();
  };

  // Handler to remove a tag from a transaction
  const handleRemoveTag = (record, tagToRemove) => {
    const newTags = record.tag_list.filter((t) => t !== tagToRemove);
    onUpdate({ ...record, tag_list: newTags, id: record.id });
  };

  // Define table columns
  const columns = [
    {
      title: "Date",
      dataIndex: "transaction_date",
      key: "transaction_date",
      width: 120,
      render: (value) => (
        <Tag color="blue" style={{ fontSize: "12px", margin: 0 }}>
          {formatDisplayDate(value)}
        </Tag>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 300,
      ellipsis: true,
      render: (value) => (
        <Text style={{ fontSize: "14px" }} title={value} ellipsis>
          {value}
        </Text>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (value, record) => (
        <Space direction="horizontal" size="small">
          <Text
            strong
            style={{
              color: record.is_credit ? "#52c41a" : "rgb(115, 133, 213)",
              fontSize: "14px",
            }}
          >
            {Math.abs(value).toFixed(2)}
          </Text>
        </Space>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tag_list",
      key: "tag_list",
      render: (tagList, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            flexWrap: "wrap",
          }}
        >
          {record.tag_list && record.tag_list.map
            ? record.tag_list.map((tag, index) => (
                <Tag
                  key={index}
                  color="purple"
                  closable
                  onClose={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(record, tag);
                  }}
                  style={{
                    fontSize: "12px",
                    margin: "1px",
                    padding: "1px 3px",
                  }}
                >
                  {tag}
                </Tag>
              ))
            : null}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEditClick(record)}
        ></Button>
      ),
    },
  ];

  return (
    <StyledCard>
      <Form form={form} onFinish={onUpdate} component={false}>
        <Table
          loading={loading}
          dataSource={transactions}
          columns={columns}
          rowKey="id"
          pagination={{
            ...pagination,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} transactions`,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          onChange={onTableChange}
          scroll={{ x: 800 }}
          bordered
        />
      </Form>

      {/* Edit Modal */}
      <Modal
        title="Edit Transaction"
        open={editModalVisible}
        onOk={handleModalSave}
        onCancel={handleModalCancel}
        width={600}
        okText="Save"
        cancelText="Cancel"
      >
        <Form
          form={editForm}
          layout="vertical"
          initialValues={{
            is_credit: false,
          }}
        >
          <Form.Item
            name="name"
            label="Transaction Name"
            rules={[
              { required: true, message: "Please enter transaction name" },
            ]}
          >
            <Input placeholder="Enter transaction name" />
          </Form.Item>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: "Please enter amount" }]}
              style={{ flex: 1 }}
            >
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="transaction_date"
              label="Transaction Date"
              rules={[{ required: true, message: "Please select date" }]}
              style={{ flex: 1 }}
            >
              <DatePicker
                format="DD-MM-YYYY"
                style={{ width: "100%" }}
                placeholder="Select date"
              />
            </Form.Item>
          </div>

          <Form.Item name="tag_list" label="Tags">
            <Select
              mode="tags"
              placeholder="Add tags..."
              style={{ width: "100%" }}
              tokenSeparators={[",", " "]}
            >
              {tags.map((tag) => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: "flex", gap: "16px", alignItems: "end" }}>
            <div style={{ flex: 1 }}>
              <Form.Item name="is_credit" label="Type" valuePropName="checked">
                <Switch checkedChildren="Credit" unCheckedChildren="Debit" />
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item label="Reminder">
                <Button
                  icon={<BellOutlined />}
                  type={
                    editingRecord &&
                    editingRecord.reminder &&
                    editingRecord.reminder.date
                      ? "primary"
                      : "default"
                  }
                  onClick={() => handleReminderClick()}
                  style={{ width: "100%" }}
                >
                  {editingRecord &&
                  editingRecord.reminder &&
                  editingRecord.reminder.date
                    ? "Edit Reminder"
                    : "Set Reminder"}
                </Button>
              </Form.Item>
            </div>
          </div>

          {/* Inline Reminder Form */}
          {showReminderForm && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                border: "1px solid #d9d9d9",
                borderRadius: 6,
                backgroundColor: "#fafafa",
              }}
            >
              <ReminderForm
                reminder={editingRecord && editingRecord.reminder}
                onChange={() => {}}
                onSave={handleReminderSave}
                onCancel={handleReminderCancel}
              />
            </div>
          )}
        </Form>
      </Modal>

      {/* Remove the separate Reminder Modal - no longer needed */}
    </StyledCard>
  );
};

export default TransactionList;
