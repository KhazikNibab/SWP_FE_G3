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
// - PUT    /accounts/:id           -> update account by id
// - DELETE /accounts/:id           -> delete account by id
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
      const res = await api.get("/users");
      const data = res?.data;
      if (!Array.isArray(data)) {
        message.error("Unexpected response from /users (expected an array)");
        setAccounts([]);
        return;
      }
      setAccounts(data);
      console.log(res.data)
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

  // Log the data used by the table whenever it changes
  useEffect(() => {
    if (Array.isArray(accounts)) {
      console.log("Accounts table data:", accounts);
    } else {
      console.log("Accounts loaded (non-array):", accounts);
    }
  }, [accounts]);

  // You can derive role options here if you add role-based filters in the future.

  const onAdd = () => {
    setEditing(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const onEdit = (record) => {
    setEditing(record);
    // Only map editable fields; password isn't editable here
    form.setFieldsValue({
      email: record.email || "",
      role: record.role,
      dealerId: record.dealerId,
    });
    setIsModalOpen(true);
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/users/${encodeURIComponent(id)}`);
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
      // Expected fields
      // - Create: { email, password, role, dealerId }
      // - Update: { email, role, dealerId }
      if (editing) {
        const payload = {
          email: values.email,
          role: values.role,
          dealerId: values.dealerId,
        };
        // Update account by id
        await api.put(`/users/${encodeURIComponent(editing.id)}`, payload);
        message.success("Account updated");
      } else {
        const payload = {
          email: values.email,
          password: values.password,
          role: values.role,
          dealerId: values.dealerId,
        };
        // Create new account via admin endpoint
        await api.post("/users/admin/users", payload);
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
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) =>
        String(a.id).localeCompare(String(b.id), undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      sortDirections: ["ascend", "descend"],
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      key: "role",
      render: (_, record) => record.role || "-",
    },
    { title: "Dealer ID", dataIndex: "dealerId", key: "dealerId" },
    // {
    //   title: "Roles",
    //   key: "roles",
    //   render: (_, record) =>
    //     Array.isArray(record.roles) && record.roles.length
    //       ? record.roles.map((r) => r?.name || r?.id).join(", ")
    //       : "-",
    // },
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
            onConfirm={() => onDelete(record.id)}
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
        rowKey="id"
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
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter the email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input />
          </Form.Item>

          {!editing && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter the password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select
              placeholder="Select role"
              options={[
                { value: "DEALER_MANAGER", label: "Dealer Manager" },
                { value: "DEALER_STAFF", label: "Dealer Staff" },
                { value: "EVM_STAFF", label: "EVM Staff" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="dealerId"
            label="Dealer ID"
            rules={[{ required: true, message: "Please enter the Dealer ID" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AccountManagementPage;
