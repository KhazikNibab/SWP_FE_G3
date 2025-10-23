import React, { useEffect, useMemo, useState } from "react";
import { Table, Input, message, Space, Button, Modal, Form } from "antd";
import api from "../../config/axios";

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  // Edit modal state for Customer
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editOriginalPhone, setEditOriginalPhone] = useState("");
  const [form] = Form.useForm();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers");
      const data = res?.data;
      if (!Array.isArray(data)) {
        message.error(
          "Unexpected response from /customers (expected an array)"
        );
        setCustomers([]);
        return;
      }
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      message.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return customers;
    return (customers || []).filter((c) =>
      [c?.phone, c?.name, c?.email, c?.address, c?.note]
        .map((v) => String(v ?? "").toLowerCase())
        .some((v) => v.includes(q))
    );
  }, [customers, searchText]);

  const columns = [
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      sorter: (a, b) =>
        String(a.phone || "").localeCompare(String(b.phone || "")),
      render: (v) => v || "-",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) =>
        String(a.name || "").localeCompare(String(b.name || "")),
      render: (v) => v || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) =>
        String(a.email || "").localeCompare(String(b.email || "")),
      render: (v) => v || "-",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (v) => v ?? "-",
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (v) => v ?? "-",
    },
    //Modal state for editing customer
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleOpenEdit(record)}>
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const handleOpenEdit = (record) => {
    setEditOriginalPhone(record?.phone || "");
    form.setFieldsValue({
      phone: record?.phone || "",
      name: record?.name || "",
      email: record?.email || "",
      address: record?.address || "",
      note: record?.note || "",
    });
    setEditOpen(true);
  };

  const handleSubmitEdit = async () => {
    try {
      setEditSubmitting(true);
      const values = await form.validateFields();
      await api.put(`/customers/${encodeURIComponent(editOriginalPhone)}`, {
        phone: values.phone ?? "",
        name: values.name ?? "",
        email: values.email ?? "",
        address: values.address ?? "",
        note: values.note ?? "",
      });
      message.success("Customer updated");
      setCustomers((prev) => {
        const idx = prev.findIndex((c) => c.phone === editOriginalPhone);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], ...values };
        return next;
      });
      setEditOpen(false);
    } catch (err) {
      if (err && err.errorFields) {
        // validation error from form; keep modal open
      } else {
        const msg =
          err?.response?.data?.message || err?.message || "Update failed";
        message.error(msg);
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          allowClear
          placeholder="Search by phone, name, email, address, or note"
          value={searchText}
          onSearch={(val) => setSearchText(val)}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 360 }}
        />
        <Button onClick={() => setSearchText("")}>Reset</Button>
      </Space>

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey={(row) =>
          row.phone || row.email || `${row.name}-${Math.random()}`
        }
        loading={loading}
      />
      {/* CUSTOMER EDIT MODAL */}
      <Modal
        title="Edit Customer"
        open={editOpen}
        onOk={handleSubmitEdit}
        onCancel={() => setEditOpen(false)}
        confirmLoading={editSubmitting}
        okText="Save"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            phone: "",
            name: "",
            email: "",
            address: "",
            note: "",
          }}
        >
          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: "Phone is required" }]}
          >
            <Input placeholder="Enter phone" />
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: "email", message: "Invalid email" }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item label="Address" name="address">
            <Input placeholder="Enter address" />
          </Form.Item>
          <Form.Item label="Note" name="note">
            <Input.TextArea
              placeholder="Enter note"
              autoSize={{ minRows: 2 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Customer;
