// src/AccountManagementPage.js
import React, { useState } from "react";
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Typography,
  Menu,
} from "antd";
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

// --- Mock Data ---
// In a real application, this would come from an API
const initialUsers = [
  {
    msnv: "EMP1001",
    email: "EMP1001@evmotion.com",
    phone: "123-456-7890",
    role: "Sales Manager",
  },
  {
    msnv: "EMP1002",
    email: "EMP1002@evmotion.com",
    phone: "234-567-8901",
    role: "Technician",
  },
  {
    msnv: "EMP1003",
    email: "EMP1003@evmotion.com",
    phone: "345-678-9012",
    role: "Finance Officer",
  },
  {
    msnv: "EMP1004",
    email: "EMP1004@evmotion.com",
    phone: "456-789-0123",
    role: "Sales Associate",
  },
];

// --- Helper Function ---
const generatePassword = () => {
  const length = 10;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

const AccountManagementPage = () => {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // --- Modal and Form Handlers ---

  const showAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        // --- Update Logic ---
        setUsers(
          users.map((user) =>
            user.msnv === editingUser.msnv ? { ...user, ...values } : user
          )
        );
        message.success("Account updated successfully!");
      } else {
        // --- Create Logic ---
        if (users.some((user) => user.msnv === values.msnv)) {
          message.error("Employee ID (MSNV) already exists!");
          return;
        }
        setUsers([{ ...values, role: "New Role" }, ...users]); // Add to the top of the list
        message.success("Account created successfully!");
      }
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.log("Validation Failed:", error);
    }
  };

  const handleDelete = (msnv) => {
    setUsers(users.filter((user) => user.msnv !== msnv));
    message.success("Account deleted successfully!");
  };

  const handleAutoGeneratePassword = () => {
    const newPassword = generatePassword();
    form.setFieldsValue({ password: newPassword });
    message.info("New password generated!");
  };

  // --- Table Column Definitions ---

  const columns = [
    {
      title: "Employee ID (MSNV)",
      dataIndex: "msnv",
      key: "msnv",
      sorter: (a, b) => a.msnv.localeCompare(b.msnv),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone Number", dataIndex: "phone", key: "phone" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete the account"
            description="Are you sure you want to delete this account?"
            onConfirm={() => handleDelete(record.msnv)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="max-h-screen bg-slate-100">
      <Sider width={220} className="!bg-slate-800">
        <div className="h-16 flex items-center justify-center text-white text-2xl font-bold">
          <span className="font-light text-sky-400">EV</span>Motion
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          className="!bg-slate-800"
          items={[
            { key: "1", icon: <TeamOutlined />, label: "Account Management" },
            // Add other admin links here
          ]}
        />
      </Sider>
      <Layout>
        <Header className="!bg-white !p-0 border-b border-slate-200">
          <div className="flex justify-between items-center h-full px-6">
            <Title level={3} className="!mb-0">
              Admin Dashboard
            </Title>
            <div className="flex items-center space-x-4">
              <span>Admin User</span>
              <UserOutlined className="text-xl" />
            </div>
          </div>
        </Header>
        <Content className="m-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <Title level={4} className="!mb-0">
                User Account Management
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={showAddModal}
              >
                Add New Account
              </Button>
            </div>
            <Table columns={columns} dataSource={users} rowKey="msnv" />
          </motion.div>
        </Content>
      </Layout>

      {/* --- Add/Edit Modal --- */}
      <Modal
        title={
          <Title level={4}>
            {editingUser ? "Edit Account" : "Provision New Account"}
          </Title>
        }
        open={isModalOpen}
        onOk={handleFormSubmit}
        onCancel={handleCancel}
        okText={editingUser ? "Save Changes" : "Create Account"}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          name="accountForm"
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="msnv"
            label="Employee ID (MSNV)"
            rules={[
              { required: true, message: "Please input the Employee ID!" },
            ]}
          >
            <Input disabled={!!editingUser} placeholder="e.g., EMP1005" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please input a valid email!",
              },
            ]}
          >
            <Input placeholder="e.g., user@evmotion.com" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: "Please input the phone number!" },
            ]}
          >
            <Input placeholder="e.g., 555-123-4567" />
          </Form.Item>
          {!editingUser && ( // Only show password field on create
            <Form.Item label="Initial Password" required>
              <Space.Compact className="w-full">
                <Form.Item
                  name="password"
                  noStyle
                  rules={[
                    {
                      required: true,
                      message: "Please provide an initial password!",
                    },
                  ]}
                >
                  <Input.Password placeholder="Enter or generate a password" />
                </Form.Item>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleAutoGeneratePassword}
                >
                  Generate
                </Button>
              </Space.Compact>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Layout>
  );
};

export default AccountManagementPage;
