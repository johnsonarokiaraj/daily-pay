import React from "react";
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
} from "antd";
import {
  CalendarOutlined,
  TagsOutlined,
  SearchOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
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
        if (editingTransaction && editingTransaction.id === record.id) {
          return (
            <FormItemWrapper>
              <Form.Item
                name="transaction_date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker size="small" format="DD-MM-YYYY" />
              </Form.Item>
            </FormItemWrapper>
          );
        }

        const formattedDate = formatDisplayDate(date);
        return <Tag color="blue">{formattedDate}</Tag>;
      },
      width: 150,
      sorter: (a, b) => {
        // Parse dates for comparison
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
        if (editingTransaction && editingTransaction.id === record.id) {
          return (
            <FormItemWrapper>
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: "Please enter transaction name" },
                ]}
              >
                <Input size="small" placeholder="Transaction name" />
              </Form.Item>
            </FormItemWrapper>
          );
        }
        return <span>{text}</span>;
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => {
        if (editingTransaction && editingTransaction.id === record.id) {
          return (
            <AmountInputSpace
              direction="horizontal"
              size="small"
              align="center"
            >
              <FormItemWrapper>
                <Form.Item
                  name="amount"
                  rules={[{ required: true, message: "Please enter amount" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    size="small"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    prefix="₹"
                    style={{ width: 120 }}
                  />
                </Form.Item>
              </FormItemWrapper>
              <FormItemWrapper>
                <Form.Item
                  name="is_credit"
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Switch
                    size="small"
                    checkedChildren="Credit"
                    unCheckedChildren="Debit"
                  />
                </Form.Item>
              </FormItemWrapper>
            </AmountInputSpace>
          );
        }
        return (
          <AmountText isCredit={record.is_credit}>
            ₹{Math.abs(amount).toFixed(2)}
          </AmountText>
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
          <TagsContainer size={[0, 8]} wrap>
            {recordTags && recordTags.map
              ? recordTags.map((tag, index) => (
                  <Tag key={index} color={"purple"}>
                    {tag}
                  </Tag>
                ))
              : null}
          </TagsContainer>
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
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          {editingTransaction && editingTransaction.id === record.id ? (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => form.submit()}
              />
              <Button
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  onCancelEdit();
                  form.resetFields();
                }}
              />
            </>
          ) : (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
        </Space>
      ),
    },
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
