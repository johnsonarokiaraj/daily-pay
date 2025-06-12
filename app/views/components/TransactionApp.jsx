import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Modal,
  message,
  FloatButton,
  Typography,
  Divider,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  CalendarOutlined,
  DollarOutlined,
  TagsOutlined,
  FilterOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;

const TransactionApp = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState({ count: 0, credit: 0, debit: 0 });
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [quickForm] = Form.useForm();

  // Load data on component mount
  useEffect(() => {
    fetchTransactions();
    fetchTags();
  }, []);

  const fetchTransactions = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await axios.get("/api/transactions", {
        params: filters,
      });
      if (response.data.transactions) {
        setTransactions(response.data.transactions);
        setStats({
          count: response.data.transactions.length,
          credit: response.data.credit || 0,
          debit: response.data.debit || 0,
        });
      }
    } catch (error) {
      message.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get("/api/tags");
      if (response.data.tags) {
        // Extract just the tag names from the API response
        const tagNames = response.data.tags.map((tag) => tag.name);
        setTags(tagNames);
      }
    } catch (error) {
      console.error("Failed to load tags");
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        transaction_date: values.transaction_date.format("DD-MM-YYYY"),
        tag_list:
          values.tag_list && values.tag_list.join
            ? values.tag_list.join(",")
            : "",
        is_credit: values.is_credit || false,
      };

      await axios.post("/api/transactions", { transaction: data });
      message.success("Transaction added successfully");

      quickForm.resetFields();
      quickForm.setFieldsValue({
        transaction_date: dayjs(),
        is_credit: false,
      });
      fetchTransactions();
    } catch (error) {
      message.error("Failed to save transaction");
    }
  };

  const handleEdit = (record) => {
    console.log("Editing record:", record);
    console.log("Original date:", record.transaction_date);

    setEditingTransaction(record);
    // Parse the date string properly - it might come in different formats
    let parsedDate;
    if (record.transaction_date) {
      // Try parsing with DD-MM-YYYY format first
      parsedDate = dayjs(record.transaction_date, "DD-MM-YYYY");
      console.log(
        "Parsed with DD-MM-YYYY:",
        parsedDate.isValid(),
        parsedDate.format(),
      );

      // If invalid, try other common formats
      if (!parsedDate.isValid()) {
        parsedDate = dayjs(record.transaction_date, "YYYY-MM-DD");
        console.log(
          "Parsed with YYYY-MM-DD:",
          parsedDate.isValid(),
          parsedDate.format(),
        );
      }
      if (!parsedDate.isValid()) {
        parsedDate = dayjs(record.transaction_date);
        console.log(
          "Parsed with default:",
          parsedDate.isValid(),
          parsedDate.format(),
        );
      }
      // If still invalid, use today's date
      if (!parsedDate.isValid()) {
        parsedDate = dayjs();
        console.log("Using today's date");
      }
    } else {
      parsedDate = dayjs();
      console.log("No date provided, using today");
    }

    form.setFieldsValue({
      ...record,
      transaction_date: parsedDate,
      tag_list: record.tag_list,
      is_credit: record.is_credit || false,
    });
  };

  const handleUpdateTransaction = async (values) => {
    try {
      const data = {
        ...values,
        transaction_date: values.transaction_date.format("DD-MM-YYYY"),
        tag_list:
          values.tag_list && values.tag_list.join
            ? values.tag_list.join(",")
            : "",
        is_credit: values.is_credit || false,
      };

      await axios.patch(`/api/transactions/${editingTransaction.id}`, {
        transaction: data,
      });
      message.success("Transaction updated successfully");

      setEditingTransaction(null);
      form.resetFields();
      fetchTransactions();
    } catch (error) {
      message.error("Failed to update transaction");
    }
  };

  const handleFilter = (values) => {
    const filters = {};
    if (values.start_date)
      filters.start_date = values.start_date.format("DD-MM-YYYY");
    if (values.end_date)
      filters.end_date = values.end_date.format("DD-MM-YYYY");
    if (values.tag_list && values.tag_list.length)
      filters.tag_list = values.tag_list.join(",");
    if (values.start_date || values.end_date) filters.allow_date = "1";

    fetchTransactions(filters);
    setIsFilterVisible(false);
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
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${placeholder}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button onClick={() => close()} size="small" style={{ width: 60 }}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
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
      <div style={{ padding: 8, minWidth: 200 }}>
        <Select
          placeholder="Select tags to filter"
          value={selectedKeys}
          onChange={(values) => setSelectedKeys(values || [])}
          mode="multiple"
          style={{ width: "100%", marginBottom: 8 }}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {tags.map((tag) => (
            <Option key={tag} value={tag}>
              <Tag icon={<TagsOutlined />} color="purple" style={{ margin: 0 }}>
                {tag}
              </Tag>
            </Option>
          ))}
        </Select>
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, "tag_list")}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Filter
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm, "tag_list")}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button onClick={() => close()} size="small" style={{ width: 60 }}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
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

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    if (dataIndex === "tag_list") {
      // For tags, store the array of selected tags
      setSearchText(selectedKeys);
    } else {
      // For other columns, store the first selected key
      setSearchText(selectedKeys[0]);
    }
    setSearchedColumn(dataIndex);
    // Don't auto-close the dropdown, let user manually close or reset
  };

  const handleReset = (clearFilters, confirm, dataIndex) => {
    clearFilters();
    if (dataIndex === "tag_list") {
      setSearchText([]);
    } else {
      setSearchText("");
    }
    setSearchedColumn("");
    confirm();
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      sorter: (a, b) => a.id - b.id,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Date",
      dataIndex: "transaction_date",
      key: "transaction_date",
      render: (date, record) => {
        if (editingTransaction && editingTransaction.id === record.id) {
          return (
            <Form.Item
              name="transaction_date"
              style={{ margin: 0 }}
              rules={[{ required: true, message: "Please select date" }]}
            >
              <DatePicker size="small" format="DD-MM-YYYY" />
            </Form.Item>
          );
        }

        // Ensure date is formatted as DD-MM-YYYY
        let formattedDate = date;
        if (date) {
          const parsedDate = dayjs(date, [
            "DD-MM-YYYY",
            "YYYY-MM-DD",
            "MM-DD-YYYY",
          ]);
          if (parsedDate.isValid()) {
            formattedDate = parsedDate.format("DD-MM-YYYY");
          }
        }

        return (
          <Tag icon={<CalendarOutlined />} color="blue">
            {formattedDate}
          </Tag>
        );
      },
      width: 150,
      sorter: (a, b) => {
        // Parse dates for comparison
        const dateA = dayjs(a.transaction_date, "DD-MM-YYYY");
        const dateB = dayjs(b.transaction_date, "DD-MM-YYYY");
        return dateA.valueOf() - dateB.valueOf();
      },
      sortDirections: ["ascend", "descend"],
      defaultSortOrder: "descend", // Default to newest first
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
            <Form.Item
              name="name"
              style={{ margin: 0 }}
              rules={[
                { required: true, message: "Please enter transaction name" },
              ]}
            >
              <Input size="small" placeholder="Transaction name" />
            </Form.Item>
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
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Form.Item
                name="amount"
                style={{ margin: 0 }}
                rules={[{ required: true, message: "Please enter amount" }]}
              >
                <Input
                  size="small"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  prefix="₹"
                />
              </Form.Item>
              <Form.Item
                name="is_credit"
                style={{ margin: 0 }}
                valuePropName="checked"
              >
                <Switch
                  size="small"
                  checkedChildren="Credit"
                  unCheckedChildren="Debit"
                />
              </Form.Item>
            </Space>
          );
        }
        return (
          <Text
            strong
            style={{
              color: record.is_credit
                ? "rgb(16, 185, 129)"
                : "rgb(115, 133, 213)",
            }}
          >
            ₹{Math.abs(amount).toFixed(2)}
          </Text>
        );
      },
      width: 140,
      sorter: (a, b) => a.amount - b.amount,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Tags",
      dataIndex: "tag_list",
      key: "tag_list",
      render: (recordTags, record) => {
        if (editingTransaction && editingTransaction.id === record.id) {
          return (
            <Form.Item name="tag_list" style={{ margin: 0 }}>
              <Select
                size="small"
                mode="tags"
                placeholder="Add tags..."
                style={{ minWidth: 120 }}
              >
                {tags.map((tag) => (
                  <Option key={tag} value={tag}>
                    {tag}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        return (
          <Space size={[0, 8]} wrap>
            {recordTags && recordTags.map
              ? recordTags.map((tag, index) => (
                  <Tag key={index} icon={<TagsOutlined />} color="purple">
                    {tag}
                  </Tag>
                ))
              : null}
          </Space>
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
                  setEditingTransaction(null);
                  form.resetFields();
                }}
              />
            </>
          ) : (
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title
          level={2}
          style={{
            margin: 0,
            background: "linear-gradient(135deg, #1677ff 0%, #69c0ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Transaction Dashboard
        </Title>
        <Text type="secondary">Manage your daily expenses and income</Text>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={stats.count}
              prefix="#"
              valueStyle={{ color: "#c85ea2" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Debit"
              value={stats.debit}
              precision={2}
              prefix="₹"
              valueStyle={{ color: "#7385d5" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Credit"
              value={stats.credit}
              prefix="₹"
              valueStyle={{ color: "#16a34a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Today"
              value={dayjs().format("MMM DD")}
              valueStyle={{ color: "#f59e0b" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Add Transaction Form */}
      <Card style={{ marginBottom: "16px" }}>
        <Form
          form={quickForm}
          layout="horizontal"
          onFinish={handleSubmit}
          initialValues={{
            transaction_date: dayjs(),
            is_credit: false,
          }}
        >
          <Row gutter={16} align="middle">
            <Col xs={24} sm={5}>
              <Form.Item
                name="name"
                style={{ marginBottom: 0 }}
                rules={[
                  { required: true, message: "Please enter transaction name" },
                ]}
              >
                <Input placeholder="Transaction name" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={3}>
              <Form.Item
                name="amount"
                style={{ marginBottom: 0 }}
                rules={[{ required: true, message: "Please enter amount" }]}
              >
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  prefix="₹"
                />
              </Form.Item>
            </Col>
            <Col xs={12} sm={2}>
              <Form.Item
                name="is_credit"
                style={{ marginBottom: 0 }}
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="Credit" unCheckedChildren="Credit" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={3}>
              <Form.Item
                name="transaction_date"
                style={{ marginBottom: 0 }}
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
              </Form.Item>
            </Col>
            <Col xs={16} sm={7}>
              <Form.Item name="tag_list" style={{ marginBottom: 0 }}>
                <Select
                  mode="tags"
                  placeholder="Add tags..."
                  style={{ width: "100%" }}
                >
                  {tags.map((tag) => (
                    <Option key={tag} value={tag}>
                      {tag}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={8} sm={4}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                >
                  Add
                </Button>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setIsFilterVisible(true)}
                >
                  Filter
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Transactions Table */}
      <Card>
        <Form form={form} onFinish={handleUpdateTransaction} component={false}>
          <Table
            components={{
              body: {
                cell: (props) => <td {...props} />,
              },
            }}
            columns={columns}
            dataSource={transactions}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        </Form>
      </Card>

      {/* Filter Modal */}
      <Modal
        title="Filter Transactions"
        open={isFilterVisible}
        onCancel={() => setIsFilterVisible(false)}
        footer={null}
      >
        <Form form={filterForm} layout="vertical" onFinish={handleFilter}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="start_date" label="Start Date">
                <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="end_date" label="End Date">
                <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="tag_list" label="Filter by Tags">
                <Select
                  mode="multiple"
                  placeholder="Select tags to filter..."
                  style={{ width: "100%" }}
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
          <Divider />
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={() => setIsFilterVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Apply Filter
            </Button>
            <Button
              onClick={() => {
                filterForm.resetFields();
                fetchTransactions();
                setIsFilterVisible(false);
              }}
            >
              Clear
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* Floating Action Button - Scroll to top */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{
          right: 24,
          bottom: 24,
        }}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          quickForm.getFieldInstance("name").focus();
        }}
      />
    </div>
  );
};

export default TransactionApp;
