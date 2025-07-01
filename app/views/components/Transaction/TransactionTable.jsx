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
} from "antd";
import {
  CalendarOutlined,
  TagsOutlined,
  SearchOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
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

const { Text } = Typography;
const { Option } = Select;

const TransactionTable = ({
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
  const [editingCell, setEditingCell] = useState(null); // { recordId, field }
  const [editingValue, setEditingValue] = useState('');
  const [originalValue, setOriginalValue] = useState(''); // Store original value for comparison
  const inputRef = useRef(null);

  // Save inline edit
  const handleInlineSave = async (record, field, value) => {
    try {
      // Check if value actually changed
      let hasChanged = false;
      let updateData = { ...record, id: record.id };

      if (field === 'transaction_date') {
        const newDateString = value.format('DD-MM-YYYY');
        hasChanged = newDateString !== originalValue;
        if (hasChanged) {
          updateData.transaction_date = newDateString;
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

      // Reset editing state first
      setEditingCell(null);
      setEditingValue('');
      setOriginalValue('');

      // Only call backend if there was actually a change
      if (hasChanged) {
        await onUpdate(updateData);
        message.success('Transaction updated successfully');
      }
    } catch (error) {
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
      originalVal = currentValue; // Store original date string
    } else if (field === 'amount') {
      valueToEdit = Math.abs(currentValue);
      originalVal = Math.abs(currentValue); // Store original amount
    } else if (field === 'is_credit') {
      valueToEdit = currentValue;
      originalVal = currentValue; // Store original boolean
    } else {
      valueToEdit = currentValue;
      originalVal = currentValue; // Store original string
    }

    setEditingValue(valueToEdit);
    setOriginalValue(originalVal);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Search functionality for table columns
  const getColumnSearchProps = (dataIndex, placeholder = "Search") => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <FilterDropdownContainer>
        <SearchInput
          placeholder={`Search ${placeholder}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => onSearch(selectedKeys, confirm, dataIndex)}
          allowClear
        />
        <Space>
          <FilterButton
            type="primary"
            onClick={() => onSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
          >
            Search
          </FilterButton>
          <FilterButton
            onClick={() => onReset(clearFilters, confirm, dataIndex)}
            size="small"
          >
            Reset
          </FilterButton>
          <FilterButtonSmall onClick={() => close()} size="small">
            Close
          </FilterButtonSmall>
        </Space>
      </FilterDropdownContainer>
    ),
    filterIcon: (filtered) => (
      <FilterIcon filtered={filtered}>
        <SearchOutlined />
      </FilterIcon>
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    filteredValue: searchedColumn === dataIndex ? [searchText] : null,
  });

  // Search functionality for tags column
  const getTagSearchProps = () => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <TagFilterDropdownContainer>
        <FilterButtonSpace>
          <FilterButton
            type="primary"
            onClick={() => onSearch(selectedKeys, confirm, "tag_list")}
            icon={<SearchOutlined />}
            size="small"
          >
            Filter
          </FilterButton>
          <FilterButton
            onClick={() => onReset(clearFilters, confirm, "tag_list")}
            size="small"
          >
            Reset
          </FilterButton>
          <FilterButtonSmall onClick={() => close()} size="small">
            Close
          </FilterButtonSmall>
        </FilterButtonSpace>
        <TagSelect
          placeholder="Select tags to filter"
          value={selectedKeys}
          onChange={(values) => {
            console.log("values", values);
            setSelectedKeys(values || []);
          }}
          mode="multiple"
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {tags.map((tag) => (
            <Option key={tag} value={tag}>
              <DropdownTag>
                <Tag icon={<TagsOutlined />} color="purple">
                  {tag}
                </Tag>
              </DropdownTag>
            </Option>
          ))}
        </TagSelect>
      </TagFilterDropdownContainer>
    ),
    filterIcon: (filtered) => (
      <FilterIcon filtered={filtered}>
        <SearchOutlined />
      </FilterIcon>
    ),
    onFilter: (value, record) => {
      if (!record.tag_list || !Array.isArray(record.tag_list)) return false;
      // If value is an array (multiple selected tags), check if any match
      if (Array.isArray(value)) {
        return value.some((filterTag) =>
          record.tag_list.some((recordTag) =>
            recordTag.toLowerCase().includes(filterTag.toLowerCase()),
          ),
        );
      }
      // Fallback for single value
      return record.tag_list.some((tag) =>
        tag.toLowerCase().includes(value.toLowerCase()),
      );
    },
    filteredValue: searchedColumn === "tag_list" ? searchText : null,
  });

  const handleEdit = (record) => {
    onEdit(record);
    const parsedDate = parseTransactionDate(record.transaction_date);

    form.setFieldsValue({
      ...record,
      transaction_date: parsedDate,
      tag_list: record.tag_list,
      is_credit: record.is_credit || false,
    });
  };

  const [activeTagInputRowId, setActiveTagInputRowId] = useState(null);
  const tagInputRef = useRef(null);

  // Handler to remove a tag from a transaction
  const handleRemoveTag = (record, tagToRemove) => {
    const newTags = record.tag_list.filter((t) => t !== tagToRemove);
    onUpdate({ ...record, tag_list: newTags, id: record.id }); // Ensure id is always present
  };

  // Handler to add a tag to a transaction
  const handleAddTag = (record, newTag) => {
    if (!newTag || record.tag_list.includes(newTag)) return;
    const newTags = [...record.tag_list, newTag];
    onUpdate({ ...record, tag_list: newTags, id: record.id }); // Ensure id is always present
    setActiveTagInputRowId(null); // Hide input after adding
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

  const columns = [
    {
      title: (
        <>
          <CalendarOutlined /> Date
        </>
      ),
      dataIndex: "transaction_date",
      key: "transaction_date",
      render: (date, record) => {
        const isEditing = editingCell && editingCell.recordId === record.id && editingCell.field === 'transaction_date';

        if (isEditing) {
          return (
            <DatePicker
              ref={inputRef}
              size="small"
              format="DD-MM-YYYY"
              value={editingValue}
              onChange={setEditingValue}
              onPressEnter={() => handleInlineSave(record, 'transaction_date', editingValue)}
              onBlur={() => handleInlineSave(record, 'transaction_date', editingValue)}
              autoFocus
            />
          );
        }

        const formattedDate = formatDisplayDate(date);
        return (
          <Tag
            color="blue"
            style={{ cursor: 'pointer' }}
            onClick={() => startInlineEdit(record, 'transaction_date', date)}
          >
            {formattedDate}
          </Tag>
        );
      },
      width: 150,
      sorter: (a, b) => {
        const dateA = dayjs(a.transaction_date, "DD-MM-YYYY");
        const dateB = dayjs(b.transaction_date, "DD-MM-YYYY");
        return dateA.valueOf() - dateB.valueOf();
      },
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      width: 300,
      ...getColumnSearchProps("name", "transaction name"),
      render: (text, record) => {
        const isEditing = editingCell && editingCell.recordId === record.id && editingCell.field === 'name';

        if (isEditing) {
          return (
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
          );
        }

        return (
          <span
            style={{ cursor: 'pointer', display: 'block', padding: '4px 0' }}
            onClick={() => startInlineEdit(record, 'name', text)}
          >
            {text}
          </span>
        );
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => {
        const isEditingAmount = editingCell && editingCell.recordId === record.id && editingCell.field === 'amount';

        if (isEditingAmount) {
          return (
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
                prefix="₹"
                style={{ width: 120 }}
                autoFocus
              />
              <Switch
                size="small"
                checked={record.is_credit}
                onChange={(checked) => handleInlineSave(record, 'is_credit', checked)}
                checkedChildren="Credit"
                unCheckedChildren="Debit"
              />
            </Space>
          );
        }

        return (
          <Space direction="horizontal" size="small">
            <AmountText
              isCredit={record.is_credit}
              style={{ cursor: 'pointer' }}
              onClick={() => startInlineEdit(record, 'amount', Math.abs(amount))}
            >
              ₹{Math.abs(amount).toFixed(2)}
            </AmountText>
            <Switch
              size="small"
              checked={record.is_credit}
              onChange={(checked) => handleInlineSave(record, 'is_credit', checked)}
              checkedChildren="Credit"
              unCheckedChildren="Debit"
            />
          </Space>
        );
      },
      width: 220,
      sorter: (a, b) => a.amount - b.amount,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: (
        <>
          <TagsOutlined /> Tags
        </>
      ),
      dataIndex: "tag_list",
      key: "tag_list",
      render: (recordTags, record) => {
        if (editingTransaction && editingTransaction.id === record.id) {
          return (
            <FormItemWrapper>
              <Form.Item name="tag_list">
                <MinWidthSelect
                  size="small"
                  mode="tags"
                  placeholder="Add tags..."
                >
                  {tags.map((tag) => (
                    <Option key={tag} value={tag}>
                      {tag}
                    </Option>
                  ))}
                </MinWidthSelect>
              </Form.Item>
            </FormItemWrapper>
          );
        }
        return (
          <div style={{ position: "relative", minHeight: 32 }}>
            <TagsContainer
              size={[0, 8]}
              wrap
              style={{ display: "inline-flex", flexWrap: "wrap", minHeight: 32, position: "relative", zIndex: 2, pointerEvents: "auto" }}
            >
              {recordTags && recordTags.map
                ? recordTags.map((tag, index) => (
                    <span key={index} onMouseDown={e => e.stopPropagation()} style={{ pointerEvents: "auto" }}>
                      <Tag
                        color={"purple"}
                        closable
                        onClose={e => {
                          e.stopPropagation();
                          handleRemoveTag(record, tag);
                        }}
                        style={{ userSelect: "none", marginBottom: 4 }}
                      >
                        {tag}
                      </Tag>
                    </span>
                  ))
                : null}
              {activeTagInputRowId === record.id && (
                <span ref={tagInputRef}>
                  <Select
                    size="small"
                    mode="tags"
                    style={{ minWidth: 80, marginLeft: 4 }}
                    placeholder="Add tag"
                    onSelect={value => handleAddTag(record, value)}
                    showArrow={false}
                    showSearch={false}
                    open
                    dropdownRender={menu => menu}
                    suffixIcon={<PlusOutlined />}
                    autoFocus
                  />
                </span>
              )}
            </TagsContainer>
            {/* Overlay for empty space click, pointerEvents none so tags are clickable */}
            {activeTagInputRowId !== record.id && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
                  cursor: "pointer",
                  background: "transparent",
                  pointerEvents: "auto"
                }}
                onClick={e => {
                  // Only trigger if the click is not on a tag
                  if (e.target === e.currentTarget) {
                    setActiveTagInputRowId(record.id);
                  }
                }}
              />
            )}
          </div>
        );
      },
      ...getTagSearchProps(),
      sorter: (a, b) => {
        // Sort by number of tags first, then alphabetically by first tag
        const aTagCount = a.tag_list ? a.tag_list.length : 0;
        const bTagCount = b.tag_list ? b.tag_list.length : 0;

        if (aTagCount !== bTagCount) {
          return aTagCount - bTagCount;
        }

        // If same number of tags, sort by first tag alphabetically
        const aFirstTag =
          a.tag_list && a.tag_list.length > 0 ? a.tag_list[0] : "";
        const bFirstTag =
          b.tag_list && b.tag_list.length > 0 ? b.tag_list[0] : "";
        return aFirstTag.localeCompare(bFirstTag);
      },
      sortDirections: ["ascend", "descend"],
    },
    // Removed Actions column since we now have inline editing
  ];

  return (
    <StyledCard>
      <Form form={form} onFinish={onUpdate} component={false}>
        <Table
          components={{
            body: {
              cell: (props) => <td {...props} />,
            },
          }}
          bordered
          columns={columns}
          dataSource={transactions}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} transactions`,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          onChange={onTableChange}
        />
      </Form>
    </StyledCard>
  );
};

export default TransactionTable;
