import React, { useState, useRef } from "react";
import {
  List,
  Card,
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
  Avatar,
  Divider,
  Row,
  Col,
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
  const [date, setDate] = useState((reminder && reminder.date) ? dayjs(reminder.date) : null);
  const [time, setTime] = useState((reminder && reminder.time) ? dayjs(reminder.time, 'HH:mm') : null);
  const [phone, setPhone] = useState((reminder && reminder.phone) || "");
  const [snooze, setSnooze] = useState((reminder && reminder.snooze) || "1_day");
  const [whatsapp, setWhatsapp] = useState(!(reminder && reminder.whatsapp === false));

  const handleSave = () => {
    onSave({
      date: date ? date.format('YYYY-MM-DD') : null,
      time: time ? time.format('HH:mm') : null,
      phone,
      snooze,
      whatsapp,
    });
  };

  return (
    <div style={{ minWidth: 250 }}>
      <div style={{ marginBottom: 8 }}>
        <DatePicker value={date} onChange={setDate} style={{ width: '100%' }} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <TimePicker value={time} onChange={setTime} format="HH:mm" style={{ width: '100%' }} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <Input
          placeholder="Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <Select value={snooze} onChange={setSnooze} style={{ width: '100%' }}>
          <Option value="1_day">Snooze: 1 Day</Option>
          <Option value="1_week">Snooze: 1 Week</Option>
        </Select>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>
          <WhatsAppOutlined style={{ color: '#25D366', marginRight: 4 }} />
          <input type="checkbox" checked={whatsapp} onChange={e => setWhatsapp(e.target.checked)} />
          &nbsp;Send via WhatsApp
        </label>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Button size="small" onClick={onCancel} style={{ marginRight: 8 }}>Cancel</Button>
        <Button size="small" type="primary" onClick={handleSave}>Save</Button>
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
      <Button size="small" icon={<BellOutlined />} type={reminder && reminder.date ? "primary" : "default"}>
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
  // State for inline editing
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const inputRef = useRef(null);
  const [activeTagInputRowId, setActiveTagInputRowId] = useState(null);
  const tagInputRef = useRef(null);

  // Save inline edit (reused from table)
  const handleInlineSave = async (record, field, value) => {
    try {
      let hasChanged = false;
      let updateData = { ...record, id: record.id };

      if (field === 'transaction_date') {
        const originalDate = parseTransactionDate(originalValue);
        const newDate = value;
        hasChanged = !originalDate.isSame(newDate, 'day');
        if (hasChanged) {
          updateData.transaction_date = value;
        }
      } else if (field === 'amount') {
        const newAmount = parseFloat(value) || 0;
        hasChanged = newAmount !== originalValue;
        if (hasChanged) {
          updateData.amount = newAmount;
        }
      } else if (field === 'is_credit') {
        hasChanged = value !== originalValue;
        if (hasChanged) {
          updateData.is_credit = value;
        }
      } else {
        hasChanged = value !== originalValue;
        if (hasChanged) {
          updateData[field] = value;
        }
      }

      setEditingCell(null);
      setEditingValue('');
      setOriginalValue('');

      if (hasChanged) {
        await onUpdate(updateData);
      }
    } catch (error) {
      console.error('Error in handleInlineSave:', error);
      message.error('Failed to update transaction');
    }
  };

  // Cancel inline edit
  const handleInlineCancel = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  // Start inline edit
  const startInlineEdit = (record, field, currentValue) => {
    setEditingCell({ recordId: record.id, field });

    let valueToEdit, originalVal;
    if (field === 'transaction_date') {
      valueToEdit = parseTransactionDate(currentValue);
      originalVal = currentValue;
    } else if (field === 'amount') {
      valueToEdit = Math.abs(currentValue);
      originalVal = Math.abs(currentValue);
    } else if (field === 'is_credit') {
      valueToEdit = currentValue;
      originalVal = currentValue;
    } else {
      valueToEdit = currentValue;
      originalVal = currentValue;
    }

    setEditingValue(valueToEdit);
    setOriginalValue(originalVal);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Handler to remove a tag from a transaction
  const handleRemoveTag = (record, tagToRemove) => {
    const newTags = record.tag_list.filter((t) => t !== tagToRemove);
    onUpdate({ ...record, tag_list: newTags, id: record.id });
  };

  // Handler to add a tag to a transaction
  const handleAddTag = (record, newTag) => {
    if (!newTag || record.tag_list.includes(newTag)) return;
    const newTags = [...record.tag_list, newTag];
    onUpdate({ ...record, tag_list: newTags, id: record.id });
    setActiveTagInputRowId(null);
  };

  // Hide tag input when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (
        tagInputRef.current &&
        !tagInputRef.current.contains(event.target)
      ) {
        setActiveTagInputRowId(null);
      }
    }
    if (activeTagInputRowId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeTagInputRowId]);

  const renderTransactionItem = (record) => {
    const isEditing = editingTransaction && editingTransaction.id === record.id;

    return (
      <List.Item key={record.id}>
        <Card
          style={{
            width: '100%',
            marginBottom: 8,
            borderLeft: `4px solid ${record.is_credit ? '#52c41a' : '#f5222d'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          bodyStyle={{ padding: '12px 16px' }}
          hoverable
        >
          <Row gutter={[16, 0]} align="middle">
            {/* Main transaction info - single line with new order */}
            <Col xs={24} sm={18} md={20}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* 1. Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '110px', flexShrink: 0 }}>
                  <CalendarOutlined style={{ color: '#1890ff', fontSize: '12px' }} />
                  {editingCell && editingCell.recordId === record.id && editingCell.field === 'transaction_date' ? (
                    <DatePicker
                      ref={inputRef}
                      size="small"
                      format="DD-MM-YYYY"
                      value={editingValue ? dayjs(editingValue) : null}
                      onChange={val => {
                        if (val) {
                          setEditingValue(val.format("YYYY-MM-DD"));
                        } else {
                          setEditingValue("");
                        }
                      }}
                      onBlur={() => {
                        if (editingValue) {
                          const newDate = dayjs(editingValue, "YYYY-MM-DD");
                          const originalDate = parseTransactionDate(record.transaction_date);
                          if (newDate.isValid() && originalDate.isValid() && !newDate.isSame(originalDate, 'day')) {
                            handleInlineSave(record, 'transaction_date', newDate);
                          } else {
                            handleInlineCancel();
                          }
                        } else {
                          handleInlineCancel();
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <Tag
                      color="blue"
                      style={{ cursor: 'pointer', fontSize: '12px', margin: 0 }}
                      onClick={() => startInlineEdit(record, 'transaction_date', record.transaction_date)}
                    >
                      {formatDisplayDate(record.transaction_date)}
                    </Tag>
                  )}
                </div>

                {/* 2. Transaction Name - Reduced space */}
                <div style={{ flex: '1', minWidth: '150px', maxWidth: '200px' }}>
                  {editingCell && editingCell.recordId === record.id && editingCell.field === 'name' ? (
                    <Input
                      ref={inputRef}
                      size="small"
                      value={editingValue}
                      onChange={e => setEditingValue(e.target.value)}
                      onPressEnter={() => handleInlineSave(record, 'name', editingValue)}
                      onBlur={() => handleInlineSave(record, 'name', editingValue)}
                      placeholder="Transaction name"
                      autoFocus
                    />
                  ) : (
                    <Text
                      strong
                      style={{
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      onClick={() => startInlineEdit(record, 'name', record.name)}
                      title={record.name} // Show full name on hover
                    >
                      {record.name}
                    </Text>
                  )}
                </div>

                {/* 3. Amount (Value with Credit/Debit) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '140px', flexShrink: 0 }}>
                  {editingCell && editingCell.recordId === record.id && editingCell.field === 'amount' ? (
                    <Space direction="horizontal" size="small">
                      <Input
                        ref={inputRef}
                        size="small"
                        type="number"
                        step="0.01"
                        value={editingValue}
                        onChange={e => setEditingValue(e.target.value)}
                        onPressEnter={() => handleInlineSave(record, 'amount', editingValue)}
                        onBlur={() => handleInlineSave(record, 'amount', editingValue)}
                        placeholder="0.00"
                        style={{ width: 80 }}
                        autoFocus
                      />
                      <Switch
                        size="small"
                        checked={record.is_credit}
                        onChange={(checked) => handleInlineSave(record, 'is_credit', checked)}
                        checkedChildren="Cr"
                        unCheckedChildren="Dr"
                      />
                    </Space>
                  ) : (
                    <Space direction="horizontal" size="small">
                      <Text
                        strong
                        style={{
                          color: record.is_credit ? '#52c41a' : '#f5222d',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                        onClick={() => startInlineEdit(record, 'amount', Math.abs(record.amount))}
                      >
                        {Math.abs(record.amount).toFixed(2)}
                      </Text>
                      <Switch
                        size="small"
                        checked={record.is_credit}
                        onChange={(checked) => handleInlineSave(record, 'is_credit', checked)}
                        checkedChildren="Cr"
                        unCheckedChildren="Dr"
                      />
                    </Space>
                  )}
                </div>

                {/* 4. Tags - Optimized for 8+ tags */}
                <div style={{ flex: '2', display: 'flex', alignItems: 'center', gap: '3px', minWidth: '300px' }}>
                  <TagsOutlined style={{ color: '#722ed1', fontSize: '12px', flexShrink: 0 }} />
                  {isEditing ? (
                    <FormItemWrapper>
                      <Form.Item name="tag_list" style={{ margin: 0 }}>
                        <MinWidthSelect
                          size="small"
                          mode="tags"
                          placeholder="Add tags..."
                          style={{ minWidth: 200 }}
                        >
                          {tags.map((tag) => (
                            <Option key={tag} value={tag}>
                              {tag}
                            </Option>
                          ))}
                        </MinWidthSelect>
                      </Form.Item>
                    </FormItemWrapper>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "2px", flexWrap: "nowrap", overflow: "hidden" }}>
                      {record.tag_list && record.tag_list.map
                        ? record.tag_list.map((tag, index) => (
                            <Tag
                              key={index}
                              color="purple"
                              closable
                              onClose={e => {
                                e.stopPropagation();
                                handleRemoveTag(record, tag);
                              }}
                              style={{
                                fontSize: '10px',
                                margin: 0,
                                padding: '0 3px',
                                height: '18px',
                                lineHeight: '16px',
                                flexShrink: 0
                              }}
                            >
                              {tag}
                            </Tag>
                          ))
                        : null}
                      {activeTagInputRowId === record.id && (
                        <span ref={tagInputRef}>
                          <Select
                            size="small"
                            mode="tags"
                            style={{ minWidth: 120 }}
                            placeholder="Add tags..."
                            value={[]} // Start with empty value
                            onChange={(values) => {
                              // Handle multiple tags being added at once
                              if (values && values.length > 0) {
                                const newTags = values.filter(tag =>
                                  tag && tag.trim() && !record.tag_list.includes(tag.trim())
                                );
                                if (newTags.length > 0) {
                                  const updatedTags = [...record.tag_list, ...newTags.map(tag => tag.trim())];
                                  onUpdate({ ...record, tag_list: updatedTags, id: record.id });
                                }
                              }
                              setActiveTagInputRowId(null);
                            }}
                            onBlur={() => setActiveTagInputRowId(null)}
                            onInputKeyDown={(e) => {
                              // Handle Enter key to add typed tags
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const inputValue = e.target.value;
                                if (inputValue && inputValue.trim()) {
                                  // Split by comma or space and add all tags
                                  const newTags = inputValue.split(/[,\s]+/).map(tag => tag.trim()).filter(tag =>
                                    tag && !record.tag_list.includes(tag)
                                  );
                                  if (newTags.length > 0) {
                                    const updatedTags = [...record.tag_list, ...newTags];
                                    onUpdate({ ...record, tag_list: updatedTags, id: record.id });
                                  }
                                  setActiveTagInputRowId(null);
                                }
                              }
                              // Handle Escape key to cancel
                              if (e.key === 'Escape') {
                                setActiveTagInputRowId(null);
                              }
                            }}
                            showArrow={false}
                            showSearch={true}
                            open={false} // Keep dropdown closed to prevent auto-selection
                            autoFocus
                            filterOption={false} // Disable filtering to allow free text entry
                            tokenSeparators={[',', ' ']} // Allow comma and space as separators
                          >
                            {tags.map((tag) => (
                              <Option key={tag} value={tag}>
                                {tag}
                              </Option>
                            ))}
                          </Select>
                        </span>
                      )}
                      {activeTagInputRowId !== record.id && (
                        <Button
                          size="small"
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => setActiveTagInputRowId(record.id)}
                          style={{ height: 18, width: 18, padding: 0, flexShrink: 0 }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* 5. Reminder and 6. Edit Actions */}
            <Col xs={24} sm={6} md={4}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <ReminderCell
                  reminder={record.reminder}
                  record={record}
                  onUpdate={onUpdate}
                />
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    onEdit(record);
                    const parsedDate = parseTransactionDate(record.transaction_date);
                    form.setFieldsValue({
                      ...record,
                      transaction_date: parsedDate,
                      tag_list: record.tag_list,
                      is_credit: record.is_credit || false,
                    });
                  }}
                />
              </div>
            </Col>
          </Row>
        </Card>
      </List.Item>
    );
  };

  return (
    <StyledCard>
      <Form form={form} onFinish={onUpdate} component={false}>
        <List
          loading={loading}
          dataSource={transactions}
          renderItem={renderTransactionItem}
          pagination={{
            ...pagination,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} transactions`,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          style={{ marginTop: 16 }}
        />
      </Form>
    </StyledCard>
  );
};

export default TransactionList;
