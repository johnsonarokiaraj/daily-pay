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
} from "@ant-design/icons";

// Import components
import TransactionApp from "./TransactionApp";
import ReportsApp from "./ReportsApp";
import BudgetsApp from "./BudgetsApp";
import TagsApp from "./TagsApp";

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
    if (path === "/budgets") return "budgets";
    if (path === "/tags") return "tags";
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
      key: "budgets",
      icon: <WalletOutlined />,
      label: "Budgets",
      path: "/budgets",
    },
    {
      key: "tags",
      icon: <TagsOutlined />,
      label: "Tags",
      path: "/tags",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider width={250} breakpoint="lg" collapsedWidth="0">
        <div
          style={{
            padding: "24px 16px",
            textAlign: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            marginBottom: "16px",
          }}
        >
          <Title
            level={3}
            style={{
              color: "white",
              margin: 0,
              fontWeight: "bold",
            }}
          >
            💰 Daily Pay
          </Title>
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
            <Route path="/budgets" element={<BudgetsApp />} />
            <Route path="/tags" element={<TagsApp />} />
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
