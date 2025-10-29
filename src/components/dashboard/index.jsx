import React, { useMemo, useState } from "react";
import {
  PieChartOutlined,
  TeamOutlined,
  HomeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme, Button, Tooltip } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/accountSlice";
import { ROUTE_ACCESS, hasAccess } from "../auth/roles";
const { Header, Content, Footer, Sider } = Layout;
// Helper to create menu items. We intentionally use relative route paths
// (no leading slash) for `to` so that the links are resolved relative to
// the current parent route (/dashboard). Using absolute paths like
// "/car" would cause React Router to look for a top-level route "/car",
// which may not exist and would result in a 404 when clicked from inside
// the dashboard layout.
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    // `to={key}` will be a relative link when `key` doesn't start with '/'.
    // When this Dashboard component is mounted at '/dashboard', clicking
    // a Link with to="car" navigates to '/dashboard/car' (desired).
    label: <Link to={key}>{label}</Link>,
  };
}

// Use relative paths ('car' and 'category') so the links resolve to
// '/dashboard/car' and '/dashboard/category' when clicked from inside
// the Dashboard layout. We updated this from 'bike' to 'car' after the
// Manage Bike page was renamed to Manage Car.
// Build menu items based on role. ADMIN sees an additional "Manage Accounts".
function useMenuItems(role) {
  return useMemo(() => {
    const items = [];
    if (hasAccess(role, ROUTE_ACCESS.car))
      items.push(getItem("Manage Car", "car", <PieChartOutlined />));
    if (hasAccess(role, ROUTE_ACCESS.category))
      items.push(getItem("Manage Category", "category", <PieChartOutlined />));
    if (hasAccess(role, ROUTE_ACCESS.contract))
      items.push(getItem("Manage Contract", "contract", <FileTextOutlined />));
    if (hasAccess(role, ROUTE_ACCESS.customer))
      items.push(getItem("Manage Customers", "customer", <FileTextOutlined />));
    if (hasAccess(role, ROUTE_ACCESS.testDrive))
      items.push(
        getItem("Manage TestDrive", "testDrive", <FileTextOutlined />)
      );
    if (hasAccess(role, ROUTE_ACCESS.accounts))
      items.push(getItem("Manage Accounts", "accounts", <TeamOutlined />));
    return items;
  }, [role]);
}
const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const account = useSelector((state) => state.account);
  const items = useMenuItems(account?.role);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    // Clear auth state then send the user back to homepage
    dispatch(logout());
    navigate("/");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/*
        Full-width header (above both Sider and Content) similar to homepage
        - Shows brand on the left
        - Shows user name and role on the right, with a Logout button
        - No nav links like Features/Manage Account/Pricing as requested
      */}
      <Header
        className="bg-slate-900 border-b border-slate-800"
        style={{ padding: 0 }}
      >
        <div className="px-6 h-16 flex items-center justify-between text-white">
          <div className="text-2xl font-bold">
            <Link to="/" className="text-sky-400 hover:text-sky-300">
              <span className="font-light">EV</span>Motion
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Tooltip title="Go to Home">
              <Button
                size="small"
                icon={<HomeOutlined />}
                onClick={() => navigate("/")}
                ghost
                aria-label="Go to Home"
              />
            </Tooltip>
            {account ? (
              <>
                <span className="hidden sm:inline text-slate-300">
                  {/* Prefer name when available, fallback to userId */}
                  Welcome, {account.name || account.userId} ({account.role})
                </span>
                <Button size="small" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login" className="text-sky-400 hover:underline">
                Login
              </Link>
            )}
          </div>
        </div>
      </Header>

      {/* Main app body with Sider and Content */}
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div className="demo-logo-vertical" />
          <Menu theme="dark" mode="inline" items={items} />
        </Sider>
        <Layout>
          <Content style={{ margin: "0 16px" }}>
            <Breadcrumb
              style={{ margin: "16px 0" }}
              items={[{ title: "Dashboard" }]}
            />
            <div
              style={{
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Outlet />
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Ant Design ©{new Date().getFullYear()} Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};
export default Dashboard;
