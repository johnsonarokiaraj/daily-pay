import React, { useEffect, useState, forwardRef } from "react";
import { Card, Typography, Button, Modal, Form, Input, Select, Space, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { formatIndianCurrency } from "../../../javascript/utils/indianCurrency";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MenuOutlined } from '@ant-design/icons';

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
    fetch("/api/tag_insights_boards.json")
      .then((res) => res.json())
      .then((data) => {
        setBoards(data);
        fetchFinancialData(data);
        setLoading(false);
      });
  }, []);

  // Fetch all tags for autofill
  useEffect(() => {
    fetch("/api/tags.json")
      .then((res) => res.json())
      .then((data) => setAllTags(Array.isArray(data) ? data : []));
  }, []);

  // Open modal
  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);

  // Handle create
  const handleCreate = (values) => {
    console.log('DEBUG: Form values on submit:', values);
    setCreating(true);
    fetch("/api/tag_insights_boards", {
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
    fetch(`/api/tag_insights_boards/${editingBoard.id}`, {
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

  // Helper to reorder array
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  // Handle drag end
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    // Always use the latest state for reordering
    const currentBoards = boardsWithFinancials.length > 0 ? boardsWithFinancials : boards;
    const newBoards = reorder(
      currentBoards,
      result.source.index,
      result.destination.index
    );
    setBoardsWithFinancials(newBoards);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]') && document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      const response = await fetch('/tag_insights_boards/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ ids: newBoards.map(b => b.id) })
      });
      if (!response.ok) throw new Error('Failed to save order');
      // Optionally, refetch from backend to ensure order is preserved
      fetch("/api/tag_insights_boards.json")
        .then((res) => res.json())
        .then((data) => {
          fetchFinancialData(data);
        });
    } catch (e) {
      message.error('Failed to save order');
    }
  };

  // DraggableRow for Ant Design Table integration with react-beautiful-dnd
  const DraggableRow = ({ index, record, className, style, ...restProps }) => {
    if (!record || !record.id) return <tr {...restProps} className={className} style={style} />;
    return (
      <Draggable draggableId={record.id.toString()} index={index} key={record.id}>
        {(provided, snapshot) => (
          <tr
            ref={provided.innerRef}
            {...restProps}
            className={className}
            style={{
              ...style,
              ...(snapshot.isDragging ? { background: '#f0f0f0' } : {})
            }}
          >
            {React.Children.map(restProps.children, (child, idx) => {
              // Only render the drag handle in the first cell
              if (idx === 0) {
                return React.cloneElement(child, {
                  children: (
                    <span
                      {...provided.dragHandleProps}
                      style={{
                        cursor: 'grab',
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: '#ffe066',
                        border: '2px solid #ffa500',
                        borderRadius: 4,
                        padding: '4px 12px',
                        marginRight: 8,
                        fontWeight: 'bold',
                        color: '#d35400',
                        zIndex: 1000
                      }}
                    >
                      <MenuOutlined style={{ color: '#d35400', fontSize: 22 }} />
                      Drag
                    </span>
                  ),
                  key: `drag-cell-${record.id}`
                });
              }
              return child;
            })}
          </tr>
        )}
      </Draggable>
    );
  };

  // Table columns for boards
  const columns = [
    {
      title: '',
      dataIndex: 'drag',
      key: 'drag',
      width: 60,
      className: 'drag-visible',
      render: () => null, // The icon is rendered by DraggableRow
    },
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
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="boards-droppable">
            {(provided) => (
              <ul
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ listStyle: "none", padding: 0, margin: 0 }}
              >
                {(boardsWithFinancials.length > 0 ? boardsWithFinancials : boards)
                  .filter(board => board && board.id)
                  .map((board, index) => (
                    <Draggable key={board.id} draggableId={board.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            background: snapshot.isDragging ? "#f0f0f0" : "#fff",
                            marginBottom: 12,
                            borderRadius: 8,
                            boxShadow: snapshot.isDragging ? "0 2px 8px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.04)",
                            border: "1px solid #e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            padding: 16,
                            transition: "box-shadow 0.2s",
                            cursor: "grab"
                          }}
                        >
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                            <div
                              {...provided.dragHandleProps}
                              style={{ fontWeight: 600, fontSize: 18, color: "#1677ff", cursor: 'grab', marginRight: 12 }}
                            >
                              <Link to={`/tag_insights_boards/${board.id}`}>{board.name}</Link>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                              <span style={{ color: "#166534", fontWeight: 600, fontSize: "14px" }}>
                                Credit: {formatIndianCurrency(board.credit_sum || 0)}
                              </span>
                              <span style={{ color: "#9ca3af", fontSize: "14px" }}>|</span>
                              <span style={{ color: "#991b1b", fontWeight: 600, fontSize: "14px" }}>
                                Debit: {formatIndianCurrency(board.debit_sum || 0)}
                              </span>
                              <span style={{ color: "#9ca3af", fontSize: "14px" }}>|</span>
                              <span style={{ color: "#1e40af", fontWeight: 700, fontSize: "14px" }}>
                                Balance: {formatIndianCurrency(board.balance || 0)}
                              </span>
                            </div>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </Card>
  );
}
