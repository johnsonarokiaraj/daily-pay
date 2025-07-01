import React, { useEffect, useState } from "react";
import { Card, Typography, Button, Modal, Form, Input, Select, Table, Space, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { formatIndianCurrency } from "../../../javascript/utils/indianCurrency";

const { Title } = Typography;
const { Option } = Select;

export default function CompareViewsDashboard() {
  const [boards, setBoards] = useState([]);
  const [boardsWithFinancials, setBoardsWithFinancials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [creating, setCreating] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [editingBoard, setEditingBoard] = useState(null);

  // Fetch all boards on mount
  useEffect(() => {
    fetch("/tag_insights_boards.json")
      .then((res) => res.json())
      .then((data) => {
        setBoards(data);
        fetchFinancialData(data);
        setLoading(false);
      });
  }, []);

  // Fetch all tags for autofill
  useEffect(() => {
    fetch("/tags.json")
      .then((res) => res.json())
      .then((data) => setAllTags(data));
  }, []);

  // Open modal
  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);

  // Handle create
  const handleCreate = (values) => {
    console.log('DEBUG: Form values on submit:', values);
    setCreating(true);
    fetch("/tag_insights_boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag_insights_board_record: values }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create board");
        return res.json();
      })
      .then((newBoard) => {
        setBoards([newBoard, ...boards]);
        setCreating(false);
        setModalVisible(false);
        form.resetFields();
        message.success("Board created!");
      })
      .catch(() => {
        setCreating(false);
        message.error("Failed to create board");
      });
  };

  // Handle edit
  const showEditModal = (board) => {
    setEditingBoard(board);
    setEditModalVisible(true);
    // Autofill form fields
    editForm.setFieldsValue({
      name: board.name,
      main_tag: board.main_tag,
      sub_tags: Array.isArray(board.sub_tags) ? board.sub_tags : (board.sub_tags ? board.sub_tags.split(',').map(t => t.trim()) : [])
    });
  };
  const hideEditModal = () => {
    setEditModalVisible(false);
    setEditingBoard(null);
    editForm.resetFields();
  };
  const handleEdit = (values) => {
    fetch(`/tag_insights_boards/${editingBoard.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag_insights_board_record: values }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update board");
        return res.json();
      })
      .then((updatedBoard) => {
        setBoards(boards.map(b => b.id === updatedBoard.id ? updatedBoard : b));
        setEditModalVisible(false);
        setEditingBoard(null);
        editForm.resetFields();
        message.success("Board updated!");
      })
      .catch(() => {
        message.error("Failed to update board");
      });
  };

  // Fetch financial data for all boards
  const fetchFinancialData = async (boardsData) => {
    const boardsWithFinancials = await Promise.all(
      boardsData.map(async (board) => {
        try {
          // Extract the actual board data from nested structure if needed
          const actualBoardData = board.board || board;

          // Validate board data - check both flat and nested structures
          if (!actualBoardData || !actualBoardData.id) {
            console.error("Invalid board data:", board);
            return {
              ...actualBoardData,
              credit_sum: 0,
              debit_sum: 0,
              balance: 0
            };
          }

          const response = await fetch(`/api/tag_insights_boards/${actualBoardData.id}`);

          // Check if response is ok before trying to parse JSON
          if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
          }

          // Check content type to ensure we're getting JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Expected JSON but got ${contentType}`);
          }

          const responseData = await response.json();

          // If the API returns data with credit_sum, debit_sum, and balance at the top level,
          // use these values directly regardless of nested structure
          if (responseData.credit_sum !== undefined &&
              responseData.debit_sum !== undefined &&
              responseData.balance !== undefined) {

            return {
              ...actualBoardData,
              credit_sum: responseData.credit_sum,
              debit_sum: responseData.debit_sum,
              balance: responseData.balance
            };
          }

          // Otherwise try to extract financial data from the flattened data structure
          const data = responseData;
          const mainTagData = data.flattened && data.flattened.find(row => row.type === 'main_tag');

          return {
            ...actualBoardData,
            credit_sum: mainTagData ? mainTagData.credit_sum : 0,
            debit_sum: mainTagData ? mainTagData.debit_sum : 0,
            balance: mainTagData ? mainTagData.sum : 0
          };
        } catch (error) {
          const actualBoardData = board.board || board;
          const boardId = actualBoardData && actualBoardData.id;
          console.error(`Error fetching financial data for board ${boardId || 'unknown'}:`, error);
          return {
            ...actualBoardData,
            credit_sum: 0,
            debit_sum: 0,
            balance: 0
          };
        }
      })
    );
    setBoardsWithFinancials(boardsWithFinancials);
  };

  // Table columns for boards
  const columns = [
    {
      title: "Board Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link to={`/tag_insights_boards/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: "Financial Summary",
      key: "financial_summary",
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            color: '#166534',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            Credit: {formatIndianCurrency(record.credit_sum || 0)}
          </span>
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>|</span>
          <span style={{
            color: '#991b1b',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            Debit: {formatIndianCurrency(record.debit_sum || 0)}
          </span>
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>|</span>
          <span style={{
            color: '#1e40af',
            fontWeight: 700,
            fontSize: '14px'
          }}>
            Balance: {formatIndianCurrency(record.balance || 0)}
          </span>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Link to={`/tag_insights_boards/${record.id}`}><Button size="small">View</Button></Link>
          <Button size="small" onClick={() => showEditModal(record)} type="default">Edit</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ margin: 24 }} bodyStyle={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Title level={3} style={{ margin: 0 }}>Tag Insights Boards</Title>
        <Button type="primary" onClick={showModal}>Create Board</Button>
      </div>
      <Modal
        title="Create Tag Insights Board"
        open={modalVisible}
        onCancel={hideModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ name: "", main_tag: "", sub_tags: [] }}
        >
          <Form.Item
            name="name"
            label="Board Name"
            rules={[{ required: true, message: "Please enter Board Name" }]}
            validateTrigger={["onChange", "onBlur"]}
          >
            <Input autoFocus allowClear />
          </Form.Item>
          <Form.Item
            name="main_tag"
            label="Main Tag"
            rules={[{ required: true, message: "Please select Main Tag" }]}
            validateTrigger={["onChange", "onBlur"]}
          >
            <Select
              showSearch
              placeholder="Select or type main tag"
              options={allTags.map(tag => ({ value: tag, label: tag }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item
            name="sub_tags"
            label="Sub Tags"
            rules={[{ required: true, message: "Please select at least one Sub Tag" }]}
            validateTrigger={["onChange", "onBlur"]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Select or type sub tags"
              options={allTags.map(tag => ({ value: tag, label: tag }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={creating}>Create</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit Tag Insights Board"
        open={editModalVisible}
        onCancel={hideEditModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEdit}
          initialValues={{ name: "", main_tag: "", sub_tags: [] }}
        >
          <Form.Item
            name="name"
            label="Board Name"
            rules={[{ required: true, message: "Please enter Board Name" }]}
            validateTrigger={["onChange", "onBlur"]}
          >
            <Input autoFocus allowClear />
          </Form.Item>
          <Form.Item
            name="main_tag"
            label="Main Tag"
            rules={[{ required: true, message: "Please select Main Tag" }]}
            validateTrigger={["onChange", "onBlur"]}
          >
            <Select
              showSearch
              placeholder="Select or type main tag"
              options={allTags.map(tag => ({ value: tag, label: tag }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item
            name="sub_tags"
            label="Sub Tags"
            rules={[{ required: true, message: "Please select at least one Sub Tag" }]}
            validateTrigger={["onChange", "onBlur"]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Select or type sub tags"
              options={allTags.map(tag => ({ value: tag, label: tag }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={creating}>Save Changes</Button>
          </Form.Item>
        </Form>
      </Modal>
      <div style={{ marginTop: 32 }}>
        <Table
          columns={columns}
          dataSource={boardsWithFinancials.length > 0 ? boardsWithFinancials : boards}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
        />
      </div>
    </Card>
  );
}
