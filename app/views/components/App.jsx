import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import { Layout, Menu, Typography, Avatar } from "antd";
import {
  DashboardOutlined,
  TransactionOutlined,
  BarChartOutlined,
  WalletOutlined,
  TagsOutlined,
  UserOutlined,
  CloudDownloadOutlined,
  EyeOutlined,
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

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    return "transactions";
  };

  const selectedKey = getSelectedKey();

  const menuItems = [
    {
      key: "transactions",
      icon: <TransactionOutlined />,
      label: "Transactions",
      path: "/transactions",
    },
    {
      key: "reports",
      icon: <BarChartOutlined />,
      label: "Reports",
      path: "/reports",
    },
    {
      key: "tags",
      icon: <TagsOutlined />,
      label: "Tags",
      path: "/tags",
    },
    {
      key: "views",
      icon: <EyeOutlined />,
      label: "Views",
      path: "/views",
    },
    {
      key: "backup",
      icon: <CloudDownloadOutlined />,
      label: "Data Backup",
      path: "/backup",
    },
    {
      key: "targets",
      icon: <WalletOutlined />,
      label: "Targets",
      path: "/targets",
    },
    {
      key: "compare",
      icon: <BarChartOutlined />,
      label: "Compare Dashboard",
      path: "/compare",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider width={250} breakpoint="lg" collapsedWidth="0">
        {/* Logo positioned inside sidebar above the menu - made bigger to fit complete space */}
        <div
          style={{
            padding: "32px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "120px",
            background:
              "linear-gradient(135deg, rgba(22, 119, 255, 0.1), rgba(105, 192, 255, 0.05))",
          }}
        >
          <DailyPayLogo size={64} variant="light" showText={true} />
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{
            background: "transparent",
            border: "none",
          }}
          theme="dark"
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: (
              <Link
                to={item.path}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {item.label}
              </Link>
            ),
          }))}
        />
      </Sider>

      <Layout>
        {/* Header */}

        <Header
          style={{
            background: "white",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 1,
          }}
        >
          <Title
            level={4}
            style={{
              margin: 0,
              background: "linear-gradient(135deg, #1677ff 0%, #69c0ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {(menuItems.find((item) => item.key === selectedKey) || {}).label ||
              "Dashboard"}
          </Title>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar icon={<UserOutlined />} />
            <span>Welcome back!</span>
          </div>
        </Header>

        {/* Main Content */}
        <Content style={{ background: "#f5f5f5" }}>
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
