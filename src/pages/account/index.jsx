// src/pages/account/index.jsx
// Full CRUD page for managing user accounts, intended for ADMIN users.
// This page is designed to be rendered inside the shared Dashboard layout.
// It uses the preconfigured axios `api` instance (with token + ngrok headers).

import React, { useEffect, useState } from "react";
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
  Select,
} from "antd";
import api from "../../config/axios";

const { Title } = Typography;

// NOTE: Endpoints are assumed as /accounts with
// - GET    /accounts               -> list accounts (array)
// - POST   /accounts               -> create account (body)
// - PUT    /accounts/:userId       -> update account by userId
// - DELETE /accounts/:userId       -> delete account by userId
// If your backend differs, adjust the paths/fields below.

const AccountManagementPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // holds the row being edited (or null for create)
  const [form] = Form.useForm();

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/accounts");
      const data = res?.data;
      if (!Array.isArray(data)) {
        message.error("Unexpected response from /accounts (expected an array)");
        setAccounts([]);
        return;
      }
      setAccounts(data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
      message.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // You can derive role options here if you add role-based filters in the future.

  const onAdd = () => {
    setEditing(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const onEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const onDelete = async (userId) => {
    try {
      await api.delete(`/accounts/${encodeURIComponent(userId)}`);
      message.success("Account deleted");
      fetchAccounts();
    } catch (err) {
      console.error("Delete failed", err);
      message.error("Failed to delete account");
    }
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Expected fields: userId, name, email, phone, role
      if (editing) {
        await api.put(
          `/accounts/${encodeURIComponent(editing.userId)}`,
          values
        );
        message.success("Account updated");
      } else {
        await api.post("/accounts", values);
        message.success("Account created");
      }
      setIsModalOpen(false);
      setEditing(null);
      fetchAccounts();
    } catch (err) {
      if (err?.errorFields) {
        // validation error from form, already displayed
        return;
      }
      console.error("Submit failed", err);
      message.error("Failed to save account");
    }
  };

  const columns = [
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      sorter: (a, b) => String(a.userId).localeCompare(String(b.userId)),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => String(a.name).localeCompare(String(b.name)),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this account?"
            onConfirm={() => onDelete(record.userId)}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ background: "transparent" }}>
      {/*
				Rendered inside Dashboard, so the top header + sider are provided by the layout.
				This page only renders the content area for managing accounts.
			*/}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          User Account Management
        </Title>
        <Button type="primary" onClick={onAdd}>
          Add Account
        </Button>
      </div>

      <Table
        rowKey="userId"
        loading={loading}
        dataSource={accounts}
        columns={columns}
      />

      <Modal
        title={editing ? "Edit Account" : "Add Account"}
        open={isModalOpen}
        onOk={onSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          {/* userId is editable when creating; disabled in edit mode to avoid ID changes. */}
          <Form.Item
            name="userId"
            label="User ID"
            rules={[{ required: true, message: "Please enter the user ID" }]}
          >
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please enter a valid email",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: "Please enter the phone" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select
              placeholder="Select role"
              options={[
                { value: "ADMIN", label: "ADMIN" },
                { value: "DEALER_STAFF", label: "DEALER_STAFF" },
                { value: "EVM_STAFF", label: "EVM_STAFF" },
              ]}
            />
          </Form.Item>
          {/* If your backend requires password on create, add it here (and hide on edit). */}
        </Form>
      </Modal>
    </Layout>
  );
};

export default AccountManagementPage;
