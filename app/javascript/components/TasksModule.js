import React, { useState, useEffect } from 'react';
import { Button, Table, Tag, Space, Modal, Form, Input, Select, DatePicker, Dropdown, Menu, message, Popover } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const TasksModule = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [statusFilter, setStatusFilter] = useState(['all']); // Change to array for multiple selection
  const [dateRangeFilter, setDateRangeFilter] = useState([]);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [commentContent, setCommentContent] = useState('');

  const [sectionForm] = Form.useForm();
  const [taskForm] = Form.useForm();
  const [taskDetailForm] = Form.useForm();

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/task_sections');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      message.error('Failed to fetch task sections');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (sectionId) => {
    try {
      const response = await fetch(`/api/task_sections/${sectionId}`);
      const data = await response.json();
      return data.tasks;
    } catch (error) {
      message.error('Failed to fetch tasks');
      return [];
    }
  };

  const handleSectionSubmit = async (values) => {
    try {
      const method = editingSection ? 'PUT' : 'POST';
      const url = editingSection
        ? `/api/task_sections/${editingSection.id}`
        : '/api/task_sections';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task_section: values }),
      });

      if (response.ok) {
        message.success(`Section ${editingSection ? 'updated' : 'created'} successfully`);
        setSectionModalVisible(false);
        setEditingSection(null);
        sectionForm.resetFields();
        fetchSections();
      } else {
        const error = await response.json();
        message.error(error.errors && error.errors.join ? error.errors.join(', ') : 'Failed to save section');
      }
    } catch (error) {
      message.error('Failed to save section');
    }
  };

  const handleTaskSubmit = async (values) => {
    try {
      const method = editingTask ? 'PUT' : 'POST';
      const url = editingTask
        ? `/api/task_sections/${selectedSection.id}/tasks/${editingTask.id}`
        : `/api/task_sections/${selectedSection.id}/tasks`;

      const taskData = {
        ...values,
        completion_date: values.completion_date.format('YYYY-MM-DD')
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: taskData }),
      });

      if (response.ok) {
        message.success(`Task ${editingTask ? 'updated' : 'created'} successfully`);
        setTaskModalVisible(false);
        setEditingTask(null);
        taskForm.resetFields();
        fetchSections();
        if (selectedSection) {
          const updatedTasks = await fetchTasks(selectedSection.id);
          setTasks(updatedTasks);
        }
      } else {
        const error = await response.json();
        message.error(error.errors && error.errors.join ? error.errors.join(', ') : 'Failed to save task');
      }
    } catch (error) {
      message.error('Failed to save task');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      const response = await fetch(`/api/task_sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Section deleted successfully');
        fetchSections();
        if (selectedSection && selectedSection.id === sectionId) {
          setSelectedSection(null);
          setTasks([]);
        }
      } else {
        message.error('Failed to delete section');
      }
    } catch (error) {
      message.error('Failed to delete section');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/task_sections/${selectedSection.id}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Task deleted successfully');
        fetchSections();
        const updatedTasks = await fetchTasks(selectedSection.id);
        setTasks(updatedTasks);
      } else {
        message.error('Failed to delete task');
      }
    } catch (error) {
      message.error('Failed to delete task');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'default',
      in_progress: 'processing',
      waiting: 'warning',
      completed: 'success',
      archive: 'purple'
    };
    return colors[status] || 'default';
  };

  const getTimeStatusColor = (timeStatus) => {
    const colors = {
      overdue: 'error',
      due_today: 'warning',
      urgent: 'warning',
      normal: 'success',
      completed: 'success'
    };
    return colors[timeStatus] || 'default';
  };

  const formatDaysRemaining = (daysRemaining, status, completionDate) => {
    if (status === 'completed') return 'Completed';

    const today = dayjs();
    const due = dayjs(completionDate);
    const diff = due.diff(today, 'days');

    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return 'Due today';
    if (diff === 1) return '1 day left';
    return `${diff} days left`;
  };

  const expandedRowRender = (section) => {
    let sectionTasks = tasks.filter(task => task.section_id === section.id);

    // By default, exclude archived tasks unless specifically filtered
    if (statusFilter.includes('all')) {
      sectionTasks = sectionTasks.filter(task => task.status !== 'archive');
    } else {
      // Apply specific status filter
      sectionTasks = sectionTasks.filter(task => statusFilter.includes(task.status));
    }

    // Apply date range filter
    if (dateRangeFilter && dateRangeFilter.length === 2) {
      const [startDate, endDate] = dateRangeFilter;
      sectionTasks = sectionTasks.filter(task => {
        const taskDate = dayjs(task.completion_date);
        return taskDate.isAfter(startDate.subtract(1, 'day')) && taskDate.isBefore(endDate.add(1, 'day'));
      });
    }

    const taskColumns = [
      {
        title: 'Task ID',
        dataIndex: 'task_id',
        key: 'task_id',
        width: 120,
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        render: (text, record) => (
          <Button
            type="link"
            style={{ padding: 0, height: 'auto', textAlign: 'left' }}
            onClick={() => {
              // Store the section info with the task for easier access
              const taskWithSection = { ...record, sectionId: section.id };
              setSelectedTask(taskWithSection);
              setTaskDetailModalVisible(true);
              fetchComments(record.id, section.id); // Pass section ID directly
            }}
          >
            {text}
          </Button>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status) => (
          <Tag color={getStatusColor(status)}>
            {status.replace('_', ' ').toUpperCase()}
          </Tag>
        ),
      },
      {
        title: 'Due Date',
        dataIndex: 'completion_date',
        key: 'completion_date',
        width: 120,
        render: (date) => dayjs(date).format('DD/MM/YYYY'),
      },
      {
        title: 'Time Left',
        key: 'time_left',
        width: 120,
        render: (_, record) => (
          <Tag color={getTimeStatusColor(record.time_status)}>
            {formatDaysRemaining(record.days_remaining, record.status, record.completion_date)}
          </Tag>
        ),
      },
    ];

    return (
      <Table
        columns={taskColumns}
        dataSource={sectionTasks}
        rowKey="id"
        size="small"
        pagination={false}
        style={{ margin: '16px 0' }}
      />
    );
  };

  const handleExpand = async (expanded, record) => {
    if (expanded) {
      const sectionTasks = await fetchTasks(record.id);
      setTasks(prev => [...prev.filter(t => t.section_id !== record.id), ...sectionTasks.map(t => ({ ...t, section_id: record.id }))]);
    }
    setExpandedRows(prev => ({ ...prev, [record.id]: expanded }));
  };

  const renderFilterContent = () => (
    <div style={{ padding: '12px', width: '300px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>Filter by Status:</div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: '100%' }}
          mode="multiple" // Enable multiple selection
        >
          <Option value="all">All Status</Option>
          <Option value="pending">Pending</Option>
          <Option value="in_progress">In Progress</Option>
          <Option value="waiting">Waiting</Option>
          <Option value="completed">Completed</Option>
          <Option value="archive">Archive</Option>
        </Select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>Filter by Due Date:</div>
        <DatePicker.RangePicker
          value={dateRangeFilter}
          onChange={setDateRangeFilter}
          format="DD/MM/YYYY"
          style={{ width: '100%' }}
          placeholder={['Start Date', 'End Date']}
        />
      </div>

      <Button
        block
        onClick={() => {
          setStatusFilter(['all']);
          setDateRangeFilter([]);
        }}
      >
        Clear Filters
      </Button>
    </div>
  );

  const sectionColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <strong>{text}</strong>
          <Tag color="blue">{record.abbreviation}</Tag>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Total Tasks',
      dataIndex: 'tasks_count',
      key: 'tasks_count',
      width: 120,
      align: 'center',
    },
    {
      title: 'Pending',
      dataIndex: 'pending_tasks_count',
      key: 'pending_tasks_count',
      width: 100,
      align: 'center',
      render: (count) => count > 0 ? <Tag color="orange">{count}</Tag> : <span>0</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setSelectedSection(record);
              setEditingTask(null);
              taskForm.resetFields();
              setTaskModalVisible(true);
            }}
          >
            Add Task
          </Button>

          <Popover
            content={renderFilterContent()}
            title="Filter Tasks"
            trigger="click"
            placement="bottomLeft"
          >
            <Button
              size="small"
              icon={<FilterOutlined />}
              style={{
                backgroundColor: (!statusFilter.includes('all') || statusFilter.length > 1 || dateRangeFilter.length > 0) ? '#1890ff' : undefined,
                color: (!statusFilter.includes('all') || statusFilter.length > 1 || dateRangeFilter.length > 0) ? 'white' : undefined
              }}
            >
              Filter
            </Button>
          </Popover>

          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingSection(record);
              sectionForm.setFieldsValue(record);
              setSectionModalVisible(true);
            }}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSection(record.id)}
          />
        </Space>
      ),
    },
  ];

  const handleTaskDetailSubmit = async (values) => {
    try {
      // Use the sectionId stored with the selectedTask, fallback to finding by task_id prefix
      let sectionId = selectedTask.sectionId;
      if (!sectionId) {
        const section = sections.find(s => selectedTask.task_id.startsWith(s.abbreviation));
        sectionId = section ? section.id : null;
      }

      if (!sectionId) {
        message.error('Could not determine section for this task');
        return;
      }

      const url = `/api/task_sections/${sectionId}/tasks/${selectedTask.id}`;

      const taskData = {
        ...values,
        completion_date: values.completion_date.format('YYYY-MM-DD')
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: taskData }),
      });

      if (response.ok) {
        message.success('Task updated successfully');
        setTaskDetailModalVisible(false);
        setSelectedTask(null);
        taskDetailForm.resetFields();
        fetchSections();
        // Refresh tasks for the expanded section
        const updatedTasks = await fetchTasks(sectionId);
        setTasks(prev => [...prev.filter(t => t.section_id !== sectionId), ...updatedTasks.map(t => ({ ...t, section_id: sectionId }))]);
      } else {
        const error = await response.json();
        message.error(error.errors && error.errors.join ? error.errors.join(', ') : 'Failed to update task');
      }
    } catch (error) {
      message.error('Failed to update task');
    }
  };

  // Comments functions
  const fetchComments = async (taskId, sectionId = null) => {
    setCommentsLoading(true);
    try {
      let section = null;

      if (sectionId) {
        // Use the provided section ID directly
        section = sections.find(s => s.id === sectionId);
      } else {
        // Fallback: find section by task_id prefix if selectedTask is available
        if (selectedTask) {
          section = sections.find(s => selectedTask.task_id.startsWith(s.abbreviation));
        }
      }

      if (section) {
        const response = await fetch(`/api/task_sections/${section.id}/tasks/${taskId}/comments`);
        const data = await response.json();
        setComments(data);
      } else {
        message.error('Could not find section for this task');
        setComments([]);
      }
    } catch (error) {
      message.error('Failed to fetch comments');
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentContent.trim()) {
      message.error('Please enter a comment');
      return;
    }

    try {
      const section = sections.find(s => selectedTask.task_id.startsWith(s.abbreviation));
      const response = await fetch(`/api/task_sections/${section.id}/tasks/${selectedTask.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: {
            content: commentContent,
            author: 'User' // You can make this dynamic based on logged-in user
          }
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments(prev => [...prev, newComment]);
        setCommentContent('');
        message.success('Comment added successfully');
      } else {
        const error = await response.json();
        message.error(error.errors && error.errors.join ? error.errors.join(', ') : 'Failed to add comment');
      }
    } catch (error) {
      message.error('Failed to add comment');
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      const section = sections.find(s => selectedTask.task_id.startsWith(s.abbreviation));
      const response = await fetch(`/api/task_sections/${section.id}/tasks/${selectedTask.id}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: {
            content: newContent
          }
        }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(prev => prev.map(comment =>
          comment.id === commentId ? updatedComment : comment
        ));
        setEditingComment(null);
        message.success('Comment updated successfully');
      } else {
        const error = await response.json();
        message.error(error.errors && error.errors.join ? error.errors.join(', ') : 'Failed to update comment');
      }
    } catch (error) {
      message.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const section = sections.find(s => selectedTask.task_id.startsWith(s.abbreviation));
      const response = await fetch(`/api/task_sections/${section.id}/tasks/${selectedTask.id}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        message.success('Comment deleted successfully');
      } else {
        message.error('Failed to delete comment');
      }
    } catch (error) {
      message.error('Failed to delete comment');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Tasks Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingSection(null);
            sectionForm.resetFields();
            setSectionModalVisible(true);
          }}
        >
          Add Section
        </Button>
      </div>

      <Table
        columns={sectionColumns}
        dataSource={sections}
        rowKey="id"
        loading={loading}
        expandable={{
          expandedRowRender,
          onExpand: handleExpand,
        }}
      />

      {/* Section Modal */}
      <Modal
        title={editingSection ? 'Edit Section' : 'Add New Section'}
        open={sectionModalVisible}
        onCancel={() => {
          setSectionModalVisible(false);
          setEditingSection(null);
          sectionForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={sectionForm}
          layout="vertical"
          onFinish={handleSectionSubmit}
        >
          <Form.Item
            name="name"
            label="Section Name"
            rules={[{ required: true, message: 'Please enter section name' }]}
          >
            <Input placeholder="e.g., Personal, Office" />
          </Form.Item>

          <Form.Item
            name="abbreviation"
            label="Abbreviation"
            rules={[
              { required: true, message: 'Please enter abbreviation' },
              { pattern: /^[A-Z]{2,10}$/, message: 'Must be 2-10 uppercase letters' }
            ]}
          >
            <Input placeholder="e.g., PL, OF" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Optional description" rows={3} />
          </Form.Item>

          <Form.Item
            name="position"
            label="Position"
          >
            <Input type="number" placeholder="Display order" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingSection ? 'Update' : 'Create'} Section
              </Button>
              <Button onClick={() => {
                setSectionModalVisible(false);
                setEditingSection(null);
                sectionForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Task Modal */}
      <Modal
        title={editingTask ? 'Edit Task' : 'Add New Task'}
        open={taskModalVisible}
        onCancel={() => {
          setTaskModalVisible(false);
          setEditingTask(null);
          taskForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={taskForm}
          layout="vertical"
          onFinish={handleTaskSubmit}
        >
          <Form.Item
            name="name"
            label="Task Name"
            rules={[{ required: true, message: 'Please enter task name' }]}
          >
            <Input placeholder="e.g., Get Grocery, Finish Project" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Task details" rows={3} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
            initialValue="pending"
          >
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="waiting">Waiting</Option>
              <Option value="completed">Completed</Option>
              <Option value="archive">Archive</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="completion_date"
            label="Due Date"
            rules={[{ required: true, message: 'Please select due date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="position"
            label="Position"
          >
            <Input type="number" placeholder="Display order" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTask ? 'Update' : 'Create'} Task
              </Button>
              <Button onClick={() => {
                setTaskModalVisible(false);
                setEditingTask(null);
                taskForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Task Detail Modal - Editable Form */}
      <Modal
        title="Task Details"
        open={taskDetailModalVisible}
        onCancel={() => {
          setTaskDetailModalVisible(false);
          setSelectedTask(null);
          taskDetailForm.resetFields();
        }}
        footer={
          <Space>
            <Button
              type="primary"
              onClick={() => taskDetailForm.submit()}
            >
              Save Changes
            </Button>
            <Button onClick={() => {
              setTaskDetailModalVisible(false);
              setSelectedTask(null);
              taskDetailForm.resetFields();
            }}>
              Close
            </Button>
          </Space>
        }
        width={700}
      >
        {selectedTask && (
          <Form
            form={taskDetailForm}
            layout="vertical"
            onFinish={handleTaskDetailSubmit}
            initialValues={{
              ...selectedTask,
              completion_date: dayjs(selectedTask.completion_date)
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Left Column - Basic Information */}
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ fontSize: '16px', color: '#1890ff' }}>Basic Information</strong>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Task ID</div>
                  <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px', fontFamily: 'monospace' }}>
                    {selectedTask.task_id}
                  </div>
                </div>

                <Form.Item
                  name="name"
                  label="Task Name"
                  rules={[{ required: true, message: 'Please enter task name' }]}
                >
                  <Input placeholder="Enter task name" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Description"
                >
                  <Input.TextArea placeholder="Enter task description" rows={4} />
                </Form.Item>
              </div>

              {/* Right Column - Status & Timeline */}
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ fontSize: '16px', color: '#1890ff' }}>Status & Timeline</strong>
                </div>

                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select>
                    <Option value="pending">Pending</Option>
                    <Option value="in_progress">In Progress</Option>
                    <Option value="waiting">Waiting</Option>
                    <Option value="completed">Completed</Option>
                    <Option value="archive">Archive</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="completion_date"
                  label="Due Date"
                  rules={[{ required: true, message: 'Please select due date' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Time Remaining</div>
                  <div>
                    <Tag color={getTimeStatusColor(selectedTask.time_status)} style={{ padding: '4px 12px', fontSize: '14px' }}>
                      {formatDaysRemaining(selectedTask.days_remaining, selectedTask.status, selectedTask.completion_date)}
                    </Tag>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Priority Level</div>
                  <div>
                    <Tag color={selectedTask.time_status === 'overdue' ? 'error' : selectedTask.time_status === 'urgent' ? 'warning' : 'success'}
                         style={{ padding: '4px 12px', fontSize: '14px' }}>
                      {selectedTask.time_status === 'overdue' ? 'HIGH - OVERDUE' :
                       selectedTask.time_status === 'urgent' ? 'MEDIUM - URGENT' : 'NORMAL'}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '16px', color: '#1890ff' }}>Additional Information</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Created On</div>
                  <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px' }}>
                    {dayjs(selectedTask.created_at).format('DD/MM/YYYY HH:mm')}
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Last Updated</div>
                  <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px' }}>
                    {dayjs(selectedTask.updated_at).format('DD/MM/YYYY HH:mm')}
                  </div>
                </div>
              </div>

              <Form.Item
                name="position"
                label="Position/Priority"
                style={{ marginTop: '12px' }}
              >
                <Input type="number" placeholder="Enter position number" />
              </Form.Item>
            </div>

            {/* Comments Section */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '16px', color: '#1890ff' }}>Comments</strong>
              </div>

              {/* Add Comment */}
              <div style={{ marginBottom: '16px' }}>
                <Input.TextArea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  style={{ marginBottom: '8px' }}
                />
                <Button
                  type="primary"
                  onClick={handleAddComment}
                  disabled={!commentContent.trim()}
                >
                  Add Comment
                </Button>
              </div>

              {/* Comments List */}
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {commentsLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No comments yet</div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} style={{
                      marginBottom: '12px',
                      padding: '12px',
                      border: '1px solid #f0f0f0',
                      borderRadius: '6px',
                      backgroundColor: '#fafafa'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          {editingComment === comment.id ? (
                            <div>
                              <Input.TextArea
                                defaultValue={comment.content}
                                onPressEnter={(e) => {
                                  if (e.shiftKey) return; // Allow shift+enter for new lines
                                  e.preventDefault();
                                  handleEditComment(comment.id, e.target.value);
                                }}
                                onBlur={(e) => handleEditComment(comment.id, e.target.value)}
                                autoFocus
                                rows={2}
                              />
                            </div>
                          ) : (
                            <div style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                              {comment.content}
                            </div>
                          )}
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            <strong>{comment.author}</strong> • {comment.formatted_created_at}
                          </div>
                        </div>
                        <div style={{ marginLeft: '12px' }}>
                          <Space size="small">
                            <Button
                              type="link"
                              size="small"
                              onClick={() => setEditingComment(editingComment === comment.id ? null : comment.id)}
                              style={{ padding: '2px 4px' }}
                            >
                              {editingComment === comment.id ? 'Cancel' : 'Edit'}
                            </Button>
                            <Button
                              type="link"
                              danger
                              size="small"
                              onClick={() => handleDeleteComment(comment.id)}
                              style={{ padding: '2px 4px' }}
                            >
                              Delete
                            </Button>
                          </Space>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default TasksModule;
