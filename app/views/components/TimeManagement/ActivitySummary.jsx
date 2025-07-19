import React, { useState, useMemo } from "react";
import {
  Card,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  DatePicker,
  Table,
  Tabs,
} from "antd";
import {
  BarChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// Extend dayjs with the plugin
dayjs.extend(isSameOrBefore);

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ActivitySummary = ({ timeSlots, tags, selectedDate }) => {
  const [summaryType, setSummaryType] = useState("day");
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, "day"),
    dayjs(),
  ]);

  const getTagById = (tagId) => {
    return tags.find((tag) => tag.id === tagId);
  };

  const calculateSummary = useMemo(() => {
    let startDate, endDate;

    switch (summaryType) {
      case "day":
        startDate = selectedDate;
        endDate = selectedDate;
        break;
      case "week":
        startDate = selectedDate.startOf("week");
        endDate = selectedDate.endOf("week");
        break;
      case "month":
        startDate = selectedDate.startOf("month");
        endDate = selectedDate.endOf("month");
        break;
      case "custom":
        // Check if dateRange is valid
        if (dateRange && dateRange[0] && dateRange[1]) {
          startDate = dateRange[0];
          endDate = dateRange[1];
        } else {
          // Fallback to current day if dateRange is invalid
          startDate = selectedDate;
          endDate = selectedDate;
        }
        break;
      default:
        startDate = selectedDate;
        endDate = selectedDate;
    }

    const summary = {
      totalSlots: 0,
      plannedSlots: 0,
      completedSlots: 0,
      actualSlots: 0,
      tagHours: {},
      plannedTagHours: {},
      actualTagHours: {},
      dailyBreakdown: {},
    };

    // Iterate through date range
    let currentDate = startDate.clone();
    while (currentDate.isSameOrBefore(endDate, "day")) {
      const dateKey = currentDate.format("YYYY-MM-DD");
      const daySlots = timeSlots[dateKey] || {};

      summary.dailyBreakdown[dateKey] = {
        date: currentDate.format("YYYY-MM-DD"),
        total: 0,
        planned: 0,
        completed: 0,
        actual: 0,
      };

      Object.values(daySlots).forEach((slot) => {
        summary.totalSlots++;
        summary.dailyBreakdown[dateKey].total++;

        if (slot.planned) {
          summary.plannedSlots++;
          summary.dailyBreakdown[dateKey].planned++;

          // Count planned tag hours (0.5 hours per slot)
          if (slot.plannedTags) {
            slot.plannedTags.forEach((tagId) => {
              if (!summary.plannedTagHours[tagId]) {
                summary.plannedTagHours[tagId] = 0;
              }
              summary.plannedTagHours[tagId] += 0.5;

              if (!summary.tagHours[tagId]) {
                summary.tagHours[tagId] = { planned: 0, actual: 0 };
              }
              summary.tagHours[tagId].planned += 0.5;
            });
          }
        }

        if (slot.actual) {
          summary.actualSlots++;
          summary.dailyBreakdown[dateKey].actual++;

          // Count actual tag hours
          if (slot.actualTags) {
            slot.actualTags.forEach((tagId) => {
              if (!summary.actualTagHours[tagId]) {
                summary.actualTagHours[tagId] = 0;
              }
              summary.actualTagHours[tagId] += 0.5;

              if (!summary.tagHours[tagId]) {
                summary.tagHours[tagId] = { planned: 0, actual: 0 };
              }
              summary.tagHours[tagId].actual += 0.5;
            });
          }
        }

        if (slot.completed) {
          summary.completedSlots++;
          summary.dailyBreakdown[dateKey].completed++;
        }
      });

      currentDate = currentDate.add(1, "day");
    }

    return summary;
  }, [timeSlots, summaryType, selectedDate, dateRange]);

  const completionRate = calculateSummary.plannedSlots > 0
    ? (calculateSummary.completedSlots / calculateSummary.plannedSlots) * 100
    : 0;

  const tagSummaryData = Object.entries(calculateSummary.tagHours).map(([tagId, hours]) => {
    const tag = getTagById(parseInt(tagId));
    return {
      key: tagId,
      tag: tag ? tag.name : "Unknown",
      color: tag ? tag.color : "#1890ff",
      plannedHours: hours.planned || 0,
      actualHours: hours.actual || 0,
      difference: (hours.actual || 0) - (hours.planned || 0),
    };
  }).sort((a, b) => (b.plannedHours + b.actualHours) - (a.plannedHours + a.actualHours));

  const dailyBreakdownData = Object.values(calculateSummary.dailyBreakdown).map(day => ({
    key: day.date,
    date: dayjs(day.date).format("MMM D"),
    planned: day.planned * 0.5,
    actual: day.actual * 0.5,
    completed: day.completed * 0.5,
    completionRate: day.planned > 0 ? (day.completed / day.planned) * 100 : 0,
  }));

  const tagColumns = [
    {
      title: "Tag",
      dataIndex: "tag",
      key: "tag",
      render: (text, record) => (
        <Tag color={record.color}>{text}</Tag>
      ),
    },
    {
      title: "Planned (hrs)",
      dataIndex: "plannedHours",
      key: "plannedHours",
      render: (hours) => hours.toFixed(1),
      sorter: (a, b) => a.plannedHours - b.plannedHours,
    },
    {
      title: "Actual (hrs)",
      dataIndex: "actualHours",
      key: "actualHours",
      render: (hours) => hours.toFixed(1),
      sorter: (a, b) => a.actualHours - b.actualHours,
    },
    {
      title: "Difference",
      dataIndex: "difference",
      key: "difference",
      render: (diff) => (
        <span style={{ color: diff >= 0 ? "#52c41a" : "#ff4d4f" }}>
          {diff > 0 ? "+" : ""}{diff.toFixed(1)}h
        </span>
      ),
      sorter: (a, b) => a.difference - b.difference,
    },
  ];

  const dailyColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Planned (hrs)",
      dataIndex: "planned",
      key: "planned",
      render: (hours) => hours.toFixed(1),
    },
    {
      title: "Actual (hrs)",
      dataIndex: "actual",
      key: "actual",
      render: (hours) => hours.toFixed(1),
    },
    {
      title: "Completed (hrs)",
      dataIndex: "completed",
      key: "completed",
      render: (hours) => hours.toFixed(1),
    },
    {
      title: "Completion Rate",
      dataIndex: "completionRate",
      key: "completionRate",
      render: (rate) => (
        <Progress
          percent={rate}
          size="small"
          status={rate >= 80 ? "success" : rate >= 60 ? "active" : "exception"}
          showInfo={false}
        />
      ),
    },
  ];

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card size="small">
          <Space>
            <Text strong>Summary for:</Text>
            <Select
              value={summaryType}
              onChange={setSummaryType}
              style={{ width: 120 }}
            >
              <Option value="day">Today</Option>
              <Option value="week">This Week</Option>
              <Option value="month">This Month</Option>
              <Option value="custom">Custom Range</Option>
            </Select>
            {summaryType === "custom" && (
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="MMM D, YYYY"
              />
            )}
          </Space>
        </Card>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Statistic
              title="Total Hours Planned"
              value={calculateSummary.plannedSlots * 0.5}
              suffix="hrs"
              prefix={<ClockCircleOutlined />}
              precision={1}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Hours Completed"
              value={calculateSummary.completedSlots * 0.5}
              suffix="hrs"
              prefix={<CheckCircleOutlined />}
              precision={1}
              valueStyle={{ color: "#52c41a" }}
            />
          </Col>
        </Row>

        <Card size="small">
          <div style={{ marginBottom: "8px" }}>
            <Text strong>Completion Rate</Text>
          </div>
          <Progress
            percent={completionRate}
            status={completionRate >= 80 ? "success" : completionRate >= 60 ? "active" : "exception"}
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
          />
        </Card>

        <Tabs defaultActiveKey="tags">
          <TabPane tab="By Tags" key="tags">
            <Table
              dataSource={tagSummaryData}
              columns={tagColumns}
              pagination={false}
              size="small"
            />
          </TabPane>
          <TabPane tab="Daily Breakdown" key="daily">
            <Table
              dataSource={dailyBreakdownData}
              columns={dailyColumns}
              pagination={false}
              size="small"
            />
          </TabPane>
        </Tabs>
      </Space>
    </div>
  );
};

export default ActivitySummary;
