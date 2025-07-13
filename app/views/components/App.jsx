import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import { Layout, Menu, Typography, Avatar, Button } from "antd";
import {
  DashboardOutlined,
  TransactionOutlined,
  BarChartOutlined,
  WalletOutlined,
  TagsOutlined,
  UserOutlined,
  CloudDownloadOutlined,
  EyeOutlined,
  AimOutlined,
  FileTextOutlined,
  RobotOutlined,
  BellOutlined,
  BulbOutlined,
  CalculatorOutlined,
  SettingOutlined,
  UserOutlined as UserCogOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import DailyPayLogo from "../../javascript/components/DailyPayLogo";

// Import components
import TransactionApp from "./TransactionApp";
import ReportsApp from "./ReportsApp";
import TagsApp from "./TagsApp";
import ViewsApp from "./ViewsApp";
import DataBackupApp from "./DataBackupApp";
import TargetsApp from "./TargetsApp";
import CompareViewsDashboard from "./Transaction/CompareViewsDashboard";
import TagInsightsBoardDetail from "./Transaction/TagInsightsBoardDetail";
import TasksModule from "../../javascript/components/TasksModule";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;
const { SubMenu } = Menu;

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Determine selected key based on current route
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === "/transactions") return "transactions";
    if (path === "/reports") return "reports";
    if (path === "/tags") return "tags";
    if (path === "/views") return "views";
    if (path === "/backup") return "backup";
    if (path === "/targets") return "targets";
    if (path === "/compare") return "compare";
    if (path === "/tasks") return "tasks";
    if (path === "/reminders") return "reminders";
    if (path === "/insights") return "insights";
    if (path === "/budget_assistant") return "budget_assistant";
    if (path === "/preferences") return "preferences";
    return "transactions";
  };

  const selectedKey = getSelectedKey();

  // Get the parent menu key for opening the correct submenu
  const getOpenKeys = () => {
    const path = location.pathname;
    if (
      ["/transactions", "/views", "/compare", "/targets", "/reports"].includes(
        path,
      )
    ) {
      return ["finance"];
    }
    if (
      ["/tasks", "/reminders", "/insights", "/budget_assistant"].includes(path)
    ) {
      return ["assistance"];
    }
    if (["/tags", "/backup", "/preferences"].includes(path)) {
      return ["settings"];
    }
    return ["finance"];
  };

  const [openKeys, setOpenKeys] = useState(getOpenKeys());

  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Professional Sidebar */}
      <Sider
        width={280}
        breakpoint="lg"
        collapsedWidth="80"
        collapsed={collapsed}
        style={{
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "80px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ color: "#3b82f6", fontSize: "24px" }}>💰</div>
            {!collapsed && (
              <span
                style={{
                  color: "white",
                  fontSize: "20px",
                  fontWeight: "700",
                  transition: "all 0.3s ease",
                }}
              >
                Daily Pay
              </span>
            )}
          </div>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              border: "none",
              background: "none",
            }}
          />
        </div>

        {/* Navigation Menu with Groups */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          style={{
            background: "transparent",
            border: "none",
            padding: "20px 0",
          }}
          theme="dark"
        >
          {/* Finance Section */}
          <SubMenu
            key="finance"
            icon={<BarChartOutlined />}
            title={
              <span
                style={{
                  fontWeight: "600",
                  color: "#cbd5e1",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "14px",
                }}
              >
                Finance
              </span>
            }
            style={{
              background: "transparent",
              borderRadius: "0 24px 24px 0",
              marginRight: "12px",
            }}
          >
            <Menu.Item
              key="transactions"
              icon={<TransactionOutlined />}
              style={{
                borderRadius: "0 24px 24px 0",
                marginRight: "12px",
                marginLeft: "0",
              }}
            >
              <Link
                to="/transactions"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Transactions
              </Link>
            </Menu.Item>
            <Menu.Item
              key="views"
              icon={<EyeOutlined />}
              style={{
                borderRadius: "0 24px 24px 0",
                marginRight: "12px",
                marginLeft: "0",
              }}
            >
              <Link
                to="/views"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Views
              </Link>
            </Menu.Item>
            <Menu.Item
              key="compare"
              icon={<DashboardOutlined />}
              style={{
                borderRadius: "0 24px 24px 0",
                marginRight: "12px",
                marginLeft: "0",
              }}
            >
              <Link
                to="/compare"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Compare Dashboard
              </Link>
            </Menu.Item>
            <Menu.Item
              key="targets"
              icon={<AimOutlined />}
              style={{
                borderRadius: "0 24px 24px 0",
                marginRight: "12px",
                marginLeft: "0",
              }}
            >
              <Link
                to="/targets"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Targets
              </Link>
            </Menu.Item>
            <Menu.Item
              key="reports"
              icon={<FileTextOutlined />}
              style={{
                borderRadius: "0 24px 24px 0",
                marginRight: "12px",
                marginLeft: "0",
              }}
            >
              <Link
                to="/reports"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Reports
              </Link>
            </Menu.Item>
          </SubMenu>

          {/* Personal Assistance Section */}
          <SubMenu
            key="assistance"
            icon={<RobotOutlined />}
            title={
              <span
                style={{
                  fontWeight: "600",
                  color: "#cbd5e1",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "14px",
                }}
              >
                Personal Assistance
              </span>
            }
            style={{
              background: "transparent",
              borderRadius: "0 24px 24px 0",
              marginRight: "12px",
            }}
          >
            <Menu.Item
              key="reminders"
              icon={<BellOutlined />}
              style={{
                borderRadius: "0 24px 24px 0",
                marginRight: "12px",
                marginLeft: "0",
              }}
            >
              <Link
                to="/reminders"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Smart Reminders
              </Link>
            </Menu.Item>
            <Menu.Item
              key="insights"
              icon={<BulbOutlined />}
              style={{
                borderRadius: "0 24px 24px 0",
                marginRight: "12px",
                marginLeft: "0",
              }}
            >
              <Link
                to="/insights"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                AI Insights
              </Link>
            </Menu.Item>
            <Menu.Item
              key="budget_assistant"
              icon={<CalculatorOutlined />}
              style={{
                borderRadius: "0 24px 24px 0",
                marginRight: "12px",
                marginLeft: "0",
              }}
            >
              <Link
                to="/budget_assistant"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Budget Assistant
              </Link>
            </Menu.Item>
            <Menu.Item
              key="tasks"
              icon={<CheckSquareOutlined />}
              style={{
                borderRadius: "0 24px 24px 0",
                marginRight: "12px",
                marginLeft: "0",
              }}
            >
              <Link
                to="/tasks"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Tasks
              </Link>
            </Menu.Item>
          </SubMenu>

          {/* Settings Section */}
          <SubMenu
            key="settings"
            icon={<SettingOutlined />}
            title={
              <span
                style={{
                  fontWeight: "600",
                  color: "#cbd5e1",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "14px",
                }}
              >
                Settings
              </span>
            }
            style={{
              background: "transparent",
              borderRadius: "0 24px 24px 0",
              marginRight: "12px",
            }}
          >
            <Menu.Item
              key="tags"
              icon={<TagsOutlined />}
              style={{
                borderRadius: "0 24px 24px 0",
                marginRight: "12px",
                marginLeft: "0",
              }}
            >
              <Link
                to="/tags"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Tags
              </Link>
            </Menu.Item>
            <Menu.Item
              key="backup"
              icon={<CloudDownloadOutlined />}
              style={{
                borderRadius: "0 24px 24px 0",
                marginRight: "12px",
                marginLeft: "0",
              }}
            >
              <Link
                to="/backup"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Data Backup
              </Link>
            </Menu.Item>
            <Menu.Item
              key="preferences"
              icon={<UserCogOutlined />}
              style={{
                borderRadius: "0 24px 24px 0",
                marginRight: "12px",
                marginLeft: "0",
              }}
            >
              <Link
                to="/preferences"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Preferences
              </Link>
            </Menu.Item>
          </SubMenu>
        </Menu>

        {/* User Profile Section */}
        {!collapsed && (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              right: "20px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.05)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <Avatar
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  flexShrink: 0,
                }}
                icon={<UserOutlined />}
              />
              <div style={{ flex: 1, color: "white" }}>
                <div style={{ fontSize: "14px", fontWeight: "600" }}>
                  Personal Account
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Free Plan
                </div>
              </div>
            </div>
          </div>
        )}
      </Sider>

      <Layout>
        {/* Professional Header */}
        <Header
          style={{
            background: "white",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            position: "sticky",
            top: 0,
            zIndex: 100,
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              <span>Dashboard</span>
              <span style={{ fontSize: "10px" }}>›</span>
              <span style={{ color: "#1e293b", fontWeight: "500" }}>
                {(() => {
                  const currentSection = openKeys[0];
                  if (currentSection === "finance") return "Finance";
                  if (currentSection === "assistance")
                    return "Personal Assistance";
                  if (currentSection === "settings") return "Settings";
                  return "Finance";
                })()}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              type="text"
              icon={<SearchOutlined />}
              style={{
                color: "#64748b",
                border: "none",
                borderRadius: "8px",
                padding: "10px",
              }}
            />
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{
                color: "#64748b",
                border: "none",
                borderRadius: "8px",
                padding: "10px",
                position: "relative",
              }}
            ></Button>
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              style={{
                color: "#64748b",
                border: "none",
                borderRadius: "8px",
                padding: "10px",
              }}
            />
          </div>
        </Header>

        {/* Main Content */}
        <Content
          style={{
            background: "#f8fafc",
            padding: "32px 24px",
            flex: 1,
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/transactions" replace />} />
            <Route path="/transactions" element={<TransactionApp />} />
            <Route path="/reports" element={<ReportsApp />} />
            <Route path="/tags" element={<TagsApp />} />
            <Route path="/views" element={<ViewsApp />} />
            <Route path="/backup" element={<DataBackupApp />} />
            <Route path="/targets" element={<TargetsApp />} />
            <Route path="/compare" element={<CompareViewsDashboard />} />
            <Route
              path="/tag_insights_boards/:id"
              element={<TagInsightsBoardDetail />}
            />
            <Route path="/tasks" element={<TasksModule />} />
            {/* Placeholder routes for new sections */}
            <Route
              path="/reminders"
              element={
                <div style={{ padding: "20px", textAlign: "center" }}>
                  Smart Reminders - Coming Soon
                </div>
              }
            />
            <Route
              path="/insights"
              element={
                <div style={{ padding: "20px", textAlign: "center" }}>
                  AI Insights - Coming Soon
                </div>
              }
            />
            <Route
              path="/budget_assistant"
              element={
                <div style={{ padding: "20px", textAlign: "center" }}>
                  Budget Assistant - Coming Soon
                </div>
              }
            />
            <Route
              path="/preferences"
              element={
                <div style={{ padding: "20px", textAlign: "center" }}>
                  Preferences - Coming Soon
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/transactions" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
