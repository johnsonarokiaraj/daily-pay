import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Button,
  Form,
  Typography,
  Space,
  Statistic,
  Tabs,
  Select,
  message,
} from "antd";
import {
  CalendarOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import dayjs from "dayjs";
import axios from "axios";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend,
);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

const ReportsApp = () => {
  const [reportsData, setReportsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTag, setSelectedTag] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await axios.get("/api/reports", { params: filters });
      if (response.data) {
        setReportsData(response.data);
      }
    } catch (error) {
      message.error("Failed to load reports");
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    if (dates) {
      setDateRange(dates);
      const filters = {
        start_date: dates[0].format("DD-MM-YYYY"),
        end_date: dates[1].format("DD-MM-YYYY"),
      };
      if (selectedTag) {
        filters.filter = selectedTag;
      }
      fetchReports(filters);
    }
  };

  const handleTagFilter = (tag) => {
    setSelectedTag(tag);
    const filters = {
      start_date: dateRange[0].format("DD-MM-YYYY"),
      end_date: dateRange[1].format("DD-MM-YYYY"),
    };
    if (tag) {
      filters.filter = tag;
    }
    fetchReports(filters);
  };

  // Chart.js configurations
  const categoryBarData = {
    labels: (reportsData.tag_amounts || []).map((item) => item.category),
    datasets: [
      {
        label: "Amount (₹)",
        data: (reportsData.tag_amounts || []).map((item) => item.amount),
        backgroundColor: [
          "#1677ff",
          "#52c41a",
          "#fa8c16",
          "#722ed1",
          "#eb2f96",
          "#13c2c2",
          "#f5222d",
          "#a0d911",
          "#fadb14",
          "#2f54eb",
        ],
        borderColor: [
          "#1677ff",
          "#52c41a",
          "#fa8c16",
          "#722ed1",
          "#eb2f96",
          "#13c2c2",
          "#f5222d",
          "#a0d911",
          "#fadb14",
          "#2f54eb",
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoryBarOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `₹${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `₹${value}`;
          },
        },
      },
    },
  };

  const monthlyTrendsData = {
    labels: [
      ...new Set((reportsData.monthly_trends || []).map((item) => item.month)),
    ],
    datasets: [
      {
        label: "Credit",
        data: [
          ...new Set(
            (reportsData.monthly_trends || []).map((item) => item.month),
          ),
        ].map((month) => {
          const creditItem = (reportsData.monthly_trends || []).find(
            (item) => item.month === month && item.type === "credit",
          );
          return creditItem ? creditItem.amount : 0;
        }),
        backgroundColor: "#52c41a",
        borderColor: "#52c41a",
      },
      {
        label: "Debit",
        data: [
          ...new Set(
            (reportsData.monthly_trends || []).map((item) => item.month),
          ),
        ].map((month) => {
          const debitItem = (reportsData.monthly_trends || []).find(
            (item) => item.month === month && item.type === "debit",
          );
          return debitItem ? debitItem.amount : 0;
        }),
        backgroundColor: "#ff4d4f",
        borderColor: "#ff4d4f",
      },
    ],
  };

  const monthlyTrendsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `₹${value}`;
          },
        },
      },
    },
  };

  const dailyTrendsData = {
    labels: [
      ...new Set((reportsData.daily_trends || []).map((item) => item.day)),
    ],
    datasets: [
      {
        label: "Credit",
        data: [
          ...new Set((reportsData.daily_trends || []).map((item) => item.day)),
        ].map((day) => {
          const creditItem = (reportsData.daily_trends || []).find(
            (item) => item.day === day && item.type === "credit",
          );
          return creditItem ? creditItem.amount : 0;
        }),
        borderColor: "#52c41a",
        backgroundColor: "rgba(82, 196, 26, 0.1)",
        tension: 0.4,
      },
      {
        label: "Debit",
        data: [
          ...new Set((reportsData.daily_trends || []).map((item) => item.day)),
        ].map((day) => {
          const debitItem = (reportsData.daily_trends || []).find(
            (item) => item.day === day && item.type === "debit",
          );
          return debitItem ? debitItem.amount : 0;
        }),
        borderColor: "#ff4d4f",
        backgroundColor: "rgba(255, 77, 79, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const dailyTrendsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `₹${value}`;
          },
        },
      },
    },
  };

  const creditDebitPieData = {
    labels: (reportsData.credit_debit_breakdown || []).map((item) => item.type),
    datasets: [
      {
        data: (reportsData.credit_debit_breakdown || []).map(
          (item) => item.amount,
        ),
        backgroundColor: ["#52c41a", "#ff4d4f"],
        borderColor: ["#52c41a", "#ff4d4f"],
        borderWidth: 1,
      },
    ],
  };

  const creditDebitPieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed;
            return `${label}: ₹${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  const yearComparisonData = {
    labels: (reportsData.yearly_comparison || []).map((item) => item.month),
    datasets: [
      {
        label: "Current Year",
        data: (reportsData.yearly_comparison || []).map(
          (item) => item.current_year || 0,
        ),
        backgroundColor: "#1677ff",
        borderColor: "#1677ff",
        type: "bar",
      },
      {
        label: "Last Year",
        data: (reportsData.yearly_comparison || []).map(
          (item) => item.last_year || 0,
        ),
        borderColor: "#ff7875",
        backgroundColor: "rgba(255, 120, 117, 0.1)",
        type: "line",
        tension: 0.4,
      },
    ],
  };

  const yearComparisonOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `₹${value}`;
          },
        },
      },
    },
  };

  const { summary = {} } = reportsData;
  const availableTags = [
    ...new Set((reportsData.tag_amounts || []).map((item) => item.category)),
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
          <BarChartOutlined style={{ marginRight: "8px" }} />
          Financial Reports & Analytics
        </Title>
        <Text type="secondary">
          Comprehensive insights into your spending patterns and trends
        </Text>
      </div>

      {/* Controls */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>Date Range:</Text>
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={handleDateChange}
              format="DD-MM-YYYY"
              allowClear={false}
            />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<CalendarOutlined />}
              onClick={() => {
                const thisMonth = [
                  dayjs().startOf("month"),
                  dayjs().endOf("month"),
                ];
                setDateRange(thisMonth);
                handleDateChange(thisMonth);
              }}
            >
              This Month
            </Button>
          </Col>
          <Col>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => {
                const thisYear = [
                  dayjs().startOf("year"),
                  dayjs().endOf("year"),
                ];
                setDateRange(thisYear);
                handleDateChange(thisYear);
              }}
            >
              This Year
            </Button>
          </Col>
          <Col>
            <Text strong style={{ marginLeft: "16px" }}>
              Filter by Tag:
            </Text>
          </Col>
          <Col>
            <Select
              style={{ width: 200 }}
              placeholder="Select a tag"
              allowClear
              value={selectedTag}
              onChange={handleTagFilter}
            >
              {availableTags.map((tag) => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={summary.total_transactions || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Amount"
              value={summary.total_amount || 0}
              precision={2}
              prefix="₹"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Average Transaction"
              value={summary.avg_transaction || 0}
              precision={2}
              prefix="₹"
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Categories"
              value={(reportsData.tag_amounts || []).length}
              prefix={<PieChartOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Chart Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                Category Analysis
              </span>
            }
            key="overview"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card
                  title="Spending by Category"
                  size="small"
                  loading={loading}
                >
                  {(reportsData.tag_amounts || []).length > 0 ? (
                    <div style={{ height: "300px" }}>
                      <Bar
                        data={categoryBarData}
                        options={categoryBarOptions}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "60px 0",
                        color: "#999",
                      }}
                    >
                      No category data available for the selected period
                    </div>
                  )}
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card
                  title="Credit vs Debit Breakdown"
                  size="small"
                  loading={loading}
                >
                  {(reportsData.credit_debit_breakdown || []).length > 0 ? (
                    <div style={{ height: "300px" }}>
                      <Pie
                        data={creditDebitPieData}
                        options={creditDebitPieOptions}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "60px 0",
                        color: "#999",
                      }}
                    >
                      No credit/debit data available
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <LineChartOutlined />
                Monthly Trends
              </span>
            }
            key="monthly"
          >
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card title="Monthly Credit vs Debit Trends" loading={loading}>
                  {(reportsData.monthly_trends || []).length > 0 ? (
                    <div style={{ height: "400px" }}>
                      <Bar
                        data={monthlyTrendsData}
                        options={monthlyTrendsOptions}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "60px 0",
                        color: "#999",
                      }}
                    >
                      No monthly trend data available for the selected period
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <LineChartOutlined />
                Daily Trends
              </span>
            }
            key="daily"
          >
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card title="Daily Transaction Trends" loading={loading}>
                  {(reportsData.daily_trends || []).length > 0 ? (
                    <div style={{ height: "400px" }}>
                      <Line
                        data={dailyTrendsData}
                        options={dailyTrendsOptions}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "60px 0",
                        color: "#999",
                      }}
                    >
                      No daily trend data available for the selected period
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <RiseOutlined />
                Year Comparison
              </span>
            }
            key="yearly"
          >
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card title="Year-over-Year Comparison" loading={loading}>
                  {(reportsData.yearly_comparison || []).length > 0 ? (
                    <div style={{ height: "400px" }}>
                      <Bar
                        data={yearComparisonData}
                        options={yearComparisonOptions}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "60px 0",
                        color: "#999",
                      }}
                    >
                      No yearly comparison data available
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ReportsApp;
