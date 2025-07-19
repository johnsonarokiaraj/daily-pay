import React, { useState, useEffect } from "react";
import {
  Layout,
  Calendar,
  Modal,
  List,
  Card,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  DatePicker,
  message,
  Tabs,
  Progress,
  Badge,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CalendarOutlined,
  TagsOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TimeSlotManager from "./TimeManagement/TimeSlotManager";
import ActivitySummary from "./TimeManagement/ActivitySummary";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const TimeManagement = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [timeSlots, setTimeSlots] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [activities, setActivities] = useState([]);
  const [tags, setTags] = useState([
    { id: 1, name: "Work", color: "#1890ff" },
    { id: 2, name: "Personal", color: "#52c41a" },
    { id: 3, name: "Exercise", color: "#fa541c" },
    { id: 4, name: "Learning", color: "#722ed1" },
    { id: 5, name: "Meeting", color: "#eb2f96" },
    { id: 6, name: "Break", color: "#13c2c2" },
  ]);

  // Generate time slots (48 slots of 30 minutes each)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const endHour = minute === 30 ? hour + 1 : hour;
        const endMinute = minute === 30 ? 0 : 30;
        const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;

        slots.push({
          id: `${hour}-${minute}`,
          startTime,
          endTime,
          display: `${startTime} - ${endTime}`,
        });
      }
    }
    return slots;
  };

  const timeSlotsList = generateTimeSlots();

  // Load data from localStorage
  useEffect(() => {
    const savedTimeSlots = localStorage.getItem("timeManagement_timeSlots");
    const savedActivities = localStorage.getItem("timeManagement_activities");
    const savedTags = localStorage.getItem("timeManagement_tags");

    if (savedTimeSlots) {
      setTimeSlots(JSON.parse(savedTimeSlots));
    }
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities));
    }
    if (savedTags) {
      setTags(JSON.parse(savedTags));
    }
  }, []);

  // Save data to localStorage
  const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const getDateKey = (date) => {
    return date.format("YYYY-MM-DD");
  };

  const getDateTimeSlots = (date) => {
    const dateKey = getDateKey(date);
    return timeSlots[dateKey] || {};
  };

  const onDateSelect = (date) => {
    setSelectedDate(date);
  };

  const onTimeSlotClick = (slot) => {
    setSelectedTimeSlot(slot);
    setIsModalVisible(true);
  };

  const updateTimeSlot = (slotId, data) => {
    const dateKey = getDateKey(selectedDate);
    const updatedTimeSlots = {
      ...timeSlots,
      [dateKey]: {
        ...timeSlots[dateKey],
        [slotId]: data,
      },
    };
    setTimeSlots(updatedTimeSlots);
    saveToStorage("timeManagement_timeSlots", updatedTimeSlots);
  };

  const deleteTimeSlot = (slotId) => {
    const dateKey = getDateKey(selectedDate);
    const updatedTimeSlots = { ...timeSlots };
    if (updatedTimeSlots[dateKey]) {
      delete updatedTimeSlots[dateKey][slotId];
      if (Object.keys(updatedTimeSlots[dateKey]).length === 0) {
        delete updatedTimeSlots[dateKey];
      }
    }
    setTimeSlots(updatedTimeSlots);
    saveToStorage("timeManagement_timeSlots", updatedTimeSlots);
  };

  const addCustomTag = (tagName, color = "#1890ff") => {
    const newTag = {
      id: Date.now(),
      name: tagName,
      color: color,
    };
    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    saveToStorage("timeManagement_tags", updatedTags);
    return newTag.id;
  };

  // New function to handle copying time slots across multiple slots
  const copyTimeSlotToRange = (sourceSlotId, targetSlotId, sourceData) => {
    const dateKey = getDateKey(selectedDate);
    const sourceIndex = timeSlotsList.findIndex(slot => slot.id === sourceSlotId);
    const targetIndex = timeSlotsList.findIndex(slot => slot.id === targetSlotId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const startIndex = Math.min(sourceIndex, targetIndex);
    const endIndex = Math.max(sourceIndex, targetIndex);

    // Calculate the total duration
    const duration = (endIndex - startIndex + 1) * 0.5; // 0.5 hours per slot
    const startTime = timeSlotsList[startIndex].startTime;
    const endTime = timeSlotsList[endIndex].endTime;

    // Create extended activity data
    const extendedActivity = {
      ...sourceData,
      isExtended: true,
      duration: duration,
      extendedTimeRange: `${startTime} - ${endTime}`,
      startSlotId: timeSlotsList[startIndex].id,
      endSlotId: timeSlotsList[endIndex].id,
    };

    // Update all slots in the range
    const updatedTimeSlots = { ...timeSlots };
    if (!updatedTimeSlots[dateKey]) {
      updatedTimeSlots[dateKey] = {};
    }

    for (let i = startIndex; i <= endIndex; i++) {
      const slotId = timeSlotsList[i].id;
      updatedTimeSlots[dateKey][slotId] = {
        ...extendedActivity,
        slotIndex: i - startIndex, // Track position in the extended activity
        isFirstSlot: i === startIndex,
        isLastSlot: i === endIndex,
      };
    }

    setTimeSlots(updatedTimeSlots);
    saveToStorage("timeManagement_timeSlots", updatedTimeSlots);

    message.success(`Activity extended to ${duration} hour${duration !== 1 ? 's' : ''} (${startTime} - ${endTime})`);
  };

  // Calendar cell renderer to show activity indicators
  const dateCellRender = (value) => {
    const dateKey = getDateKey(value);
    const daySlots = timeSlots[dateKey];

    if (!daySlots) return null;

    const plannedCount = Object.values(daySlots).filter(slot => slot.planned).length;
    const completedCount = Object.values(daySlots).filter(slot => slot.actual && slot.completed).length;

    return (
      <div style={{ fontSize: "12px" }}>
        {plannedCount > 0 && (
          <Badge
            count={plannedCount}
            style={{ backgroundColor: "#1890ff", fontSize: "10px" }}
            title={`${plannedCount} planned activities`}
          />
        )}
        {completedCount > 0 && (
          <Badge
            count={completedCount}
            style={{ backgroundColor: "#52c41a", fontSize: "10px", marginLeft: "4px" }}
            title={`${completedCount} completed activities`}
          />
        )}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
        <div style={{ marginBottom: "24px" }}>
          <Title level={2} style={{ margin: 0, color: "#1e293b" }}>
            <ClockCircleOutlined style={{ marginRight: "12px", color: "#3b82f6" }} />
            Time Management
          </Title>
          <Text type="secondary">Plan your day and track your activities • Drag to extend activities across time slots</Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <Card
              title="Calendar View"
              extra={
                <Space>
                  <Button
                    type="primary"
                    icon={<CalendarOutlined />}
                    onClick={() => setSelectedDate(dayjs())}
                  >
                    Today
                  </Button>
                </Space>
              }
            >
              <Calendar
                value={selectedDate}
                onSelect={onDateSelect}
                dateCellRender={dateCellRender}
                style={{ background: "white" }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Card
                title={`Schedule for ${selectedDate.format("MMMM D, YYYY")}`}
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={() => {
                      setSelectedTimeSlot(null);
                      setIsModalVisible(true);
                    }}
                  >
                    Add Activity
                  </Button>
                }
              >
                <TimeSlotManager
                  date={selectedDate}
                  timeSlots={timeSlotsList}
                  dateTimeSlots={getDateTimeSlots(selectedDate)}
                  onTimeSlotClick={onTimeSlotClick}
                  onCopyTimeSlot={copyTimeSlotToRange}
                  tags={tags}
                />
              </Card>

              <Tabs defaultActiveKey="summary">
                <TabPane tab="Summary" key="summary">
                  <ActivitySummary
                    timeSlots={timeSlots}
                    tags={tags}
                    selectedDate={selectedDate}
                  />
                </TabPane>
              </Tabs>
            </Space>
          </Col>
        </Row>

        <Modal
          title={selectedTimeSlot ? "Edit Time Slot" : "Add Activity"}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={600}
        >
          <TimeSlotEditor
            timeSlot={selectedTimeSlot}
            date={selectedDate}
            tags={tags}
            onSave={(data) => {
              if (selectedTimeSlot) {
                updateTimeSlot(selectedTimeSlot.id, data);
              }
              setIsModalVisible(false);
              message.success("Activity saved successfully");
            }}
            onDelete={(slotId) => {
              deleteTimeSlot(slotId);
              setIsModalVisible(false);
              message.success("Activity deleted successfully");
            }}
            onAddTag={addCustomTag}
          />
        </Modal>
      </div>
    </DndProvider>
  );
};

// Time Slot Editor Component
const TimeSlotEditor = ({ timeSlot, date, tags, onSave, onDelete, onAddTag }) => {
  const [form, setForm] = useState({
    planned: "",
    plannedTags: [],
    actual: "",
    actualTags: [],
    completed: false,
    notes: "",
  });

  useEffect(() => {
    if (timeSlot) {
      // Load existing data for the time slot
      const dateKey = date.format("YYYY-MM-DD");
      const savedData = JSON.parse(localStorage.getItem("timeManagement_timeSlots") || "{}");
      const slotData = (savedData[dateKey] && savedData[dateKey][timeSlot.id]) || {};

      setForm({
        planned: slotData.planned || "",
        plannedTags: slotData.plannedTags || [],
        actual: slotData.actual || "",
        actualTags: slotData.actualTags || [],
        completed: slotData.completed || false,
        notes: slotData.notes || "",
      });
    }
  }, [timeSlot, date]);

  const handleSubmit = () => {
    if (!form.planned && !form.actual) {
      message.error("Please add either a planned or actual activity");
      return;
    }

    onSave({
      ...form,
      timeSlot: timeSlot ? timeSlot.display : "",
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div>
      {timeSlot && (
        <div style={{ marginBottom: "16px", padding: "12px", background: "#f5f5f5", borderRadius: "6px" }}>
          <Text strong>{timeSlot.display}</Text>
        </div>
      )}

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={5}>Planned Activity</Title>
          <Input.TextArea
            placeholder="What do you plan to do during this time?"
            value={form.planned}
            onChange={(e) => setForm({ ...form, planned: e.target.value })}
            rows={2}
          />
          <div style={{ marginTop: "8px" }}>
            <Select
              mode="multiple"
              placeholder="Add tags for planned activity"
              value={form.plannedTags}
              onChange={(value) => setForm({ ...form, plannedTags: value })}
              style={{ width: "100%" }}
            >
              {tags.map((tag) => (
                <Option key={tag.id} value={tag.id}>
                  <Tag color={tag.color}>{tag.name}</Tag>
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Title level={5}>Actual Activity</Title>
          <Input.TextArea
            placeholder="What did you actually do during this time?"
            value={form.actual}
            onChange={(e) => setForm({ ...form, actual: e.target.value })}
            rows={2}
          />
          <div style={{ marginTop: "8px" }}>
            <Select
              mode="multiple"
              placeholder="Add tags for actual activity"
              value={form.actualTags}
              onChange={(value) => setForm({ ...form, actualTags: value })}
              style={{ width: "100%" }}
            >
              {tags.map((tag) => (
                <Option key={tag.id} value={tag.id}>
                  <Tag color={tag.color}>{tag.name}</Tag>
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Title level={5}>Notes</Title>
          <Input.TextArea
            placeholder="Additional notes..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            type={form.completed ? "primary" : "default"}
            icon={form.completed ? <CheckCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => setForm({ ...form, completed: !form.completed })}
          >
            {form.completed ? "Completed" : "Mark as Complete"}
          </Button>

          <Space>
            {timeSlot && (
              <Popconfirm
                title="Are you sure you want to delete this activity?"
                onConfirm={() => onDelete(timeSlot.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
            )}
            <Button onClick={() => {}}>Cancel</Button>
            <Button type="primary" onClick={handleSubmit}>
              Save
            </Button>
          </Space>
        </div>
      </Space>
    </div>
  );
};

export default TimeManagement;
