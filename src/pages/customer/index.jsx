import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Input,
  message,
  Space,
  Button,
  Modal,
  Form,
  // DatePicker to pick contractDate; returns a Dayjs-like object in AntD v5
  DatePicker,
  // Numeric inputs for money-ish fields
  InputNumber,
  // Select for enumerated payment statuses
  Select,
} from "antd";
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
  // Add modal state for Customer
  const [addOpen, setAddOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addForm] = Form.useForm();

  // Create Contract modal state
  const [contractOpen, setContractOpen] = useState(false); // controls modal visibility
  const [contractSubmitting, setContractSubmitting] = useState(false); // shows loading on OK
  const [contractForm] = Form.useForm(); // isolated Form instance for the contract modal
  const [selectedCustomer, setSelectedCustomer] = useState(null); // the customer row we are creating a contract for

  // Helper to sanitize phone input to digits-only and cap at 10
  const handlePhoneChange = (formInstance) => (e) => {
    const digits = String(e?.target?.value ?? "")
      .replace(/\D/g, "")
      .slice(0, 10);
    formInstance.setFieldsValue({ phone: digits });
  };

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
          <Button type="primary" onClick={() => handleOpenCreateContract(record)}>
            Create Contract
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

  // Create Contract handlers
  const handleOpenCreateContract = (record) => {
    setSelectedCustomer(record);
    // Seed the contract form with customer info (read-only fields) and sensible defaults
    contractForm.setFieldsValue({
      customerName: record?.name || "",
      customerPhone: record?.phone || "",
      customerEmail: record?.email || "",
      vehicleId: "",
      // Ask user to pick a date; we convert it to ISO string on submit
      contractDate: undefined,
      promotionAmount: 0,
      totalAmount: 0,
      dealerId: "",
      paymentMethodId: undefined,
      paymentStatus: "Pending",
    });
    setContractOpen(true);
  };

  const submitCreateContract = async () => {
    try {
      setContractSubmitting(true);
      // Validate required inputs in the modal form
      const values = await contractForm.validateFields();
      // Build payload expected by backend from form values (and selected customer as fallback)
      const payload = {
        customerName: values.customerName || selectedCustomer?.name || "",
        customerPhone: values.customerPhone || selectedCustomer?.phone || "",
        customerEmail: values.customerEmail || selectedCustomer?.email || "",
        vehicleId: values.vehicleId || "",
        // AntD DatePicker provides a Dayjs-like object; convert to ISO string. If missing, default to now.
        contractDate: values.contractDate
          ? (values.contractDate?.toDate
            ? values.contractDate.toDate().toISOString()
            : new Date(values.contractDate).toISOString())
          : new Date().toISOString(),
        promotionAmount: Number(values.promotionAmount || 0),
        totalAmount: Number(values.totalAmount || 0),
        dealerId: values.dealerId || "",
        paymentMethodId: Number(values.paymentMethodId || 0),
        paymentStatus: values.paymentStatus || "Pending",
      };

      // Try primary endpoint (/sale-contracts), then fallback to /contracts to match list page behavior
      let res;
      try {
        res = await api.post("/sale-contracts", payload);
      } catch (e1) {
        res = await api.post("/contracts", payload);
      }

      // Notify outcome and close modal; caller can refresh list elsewhere if needed
      if (res?.data) {
        message.success("Contract created");
      } else {
        message.success("Contract submitted");
      }
      setContractOpen(false);
      setSelectedCustomer(null);
      contractForm.resetFields();
    } catch (err) {
      if (err && err.errorFields) {
        // Form validation error: keep modal open so user can fix inputs
      } else {
        const msg = err?.response?.data?.message || err?.message || "Create contract failed";
        message.error(msg);
      }
    } finally {
      setContractSubmitting(false);
    }
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

  // Add customer handlers
  const handleOpenAdd = () => {
    setAddOpen(true);
    addForm.resetFields();
  };

  const handleSubmitAdd = async () => {
    try {
      setAddSubmitting(true);
      const values = await addForm.validateFields();
      const payload = {
        phone: values.phone ?? "",
        name: values.name ?? "",
        email: values.email ?? "",
        address: values.address ?? "",
        note: values.note ?? "",
      };
      const res = await api.post(`/customers`, payload);
      const created = res?.data;
      message.success("Customer created");
      if (created && typeof created === "object") {
        setCustomers((prev) => {
          // avoid duplicate by phone if exists
          const existsIdx = prev.findIndex((c) => c.phone === created.phone);
          if (existsIdx !== -1) {
            const next = [...prev];
            next[existsIdx] = { ...next[existsIdx], ...created };
            return next;
          }
          return [created, ...prev];
        });
      } else {
        // Fallback: refetch list if API does not return created entity
        fetchCustomers();
      }
      setAddOpen(false);
    } catch (err) {
      if (err && err.errorFields) {
        // validation error from form; keep modal open
      } else {
        const msg =
          err?.response?.data?.message || err?.message || "Create failed";
        message.error(msg);
      }
    } finally {
      setAddSubmitting(false);
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
        <Button type="primary" onClick={handleOpenAdd}>
          Add Customer
        </Button>
      </Space>

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey={(row) =>
          row.phone || row.email || `${row.name}-${Math.random()}`
        }
        loading={loading}
      />

      {/* CREATE CONTRACT MODAL */}
      <Modal
        title="Create Contract"
        open={contractOpen}
        onOk={submitCreateContract}
        onCancel={() => setContractOpen(false)}
        confirmLoading={contractSubmitting}
        okText="Create"
        destroyOnClose
      >
        <Form
          form={contractForm}
          layout="vertical"
          initialValues={{
            customerName: selectedCustomer?.name || "",
            customerPhone: selectedCustomer?.phone || "",
            customerEmail: selectedCustomer?.email || "",
            vehicleId: "",
            // Start empty; user picks a date in UI
            contractDate: undefined,
            promotionAmount: 0,
            totalAmount: 0,
            dealerId: "",
            paymentMethodId: undefined,
            paymentStatus: "Pending",
          }}
        >
          {/* Customer info (read-only). These are shown for context and included in the payload. */}
          <Form.Item label="Customer Name" name="customerName">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Customer Phone" name="customerPhone">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Customer Email" name="customerEmail">
            <Input disabled />
          </Form.Item>

          {/* Contract fields the user must fill in */}
          <Form.Item
            label="Vehicle ID"
            name="vehicleId"
            rules={[{ required: true, message: "Vehicle ID is required" }]}
          >
            <Input placeholder="Enter vehicle ID" />
          </Form.Item>

          <Form.Item
            label="Contract Date"
            name="contractDate"
            rules={[{ required: true, message: "Contract date is required" }]}
          >
            {/* AntD DatePicker returns a Dayjs-like object. We convert to ISO on submit. */}
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Promotion Amount" name="promotionAmount">
            {/* Money input; coerced to Number before sending */}
            <InputNumber style={{ width: "100%" }} min={0} step={100} />
          </Form.Item>

          <Form.Item
            label="Total Amount"
            name="totalAmount"
            rules={[{ required: true, message: "Total amount is required" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} step={100} />
          </Form.Item>

          <Form.Item label="Dealer ID" name="dealerId">
            <Input placeholder="Enter dealer ID" />
          </Form.Item>

          <Form.Item label="Payment Method ID" name="paymentMethodId">
            {/* Numeric identifier for payment method, if required by backend */}
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item label="Payment Status" name="paymentStatus">
            {/* Enum-like select; matches what the contracts list filters on */}
            <Select
              options={[
                { value: "Pending", label: "Pending" },
                { value: "Paid", label: "Paid" },
                { value: "Failed", label: "Failed" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
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
            rules={[
              { required: true, message: "Phone is required" },
              {
                pattern: /^\d{1,10}$/,
                message: "Phone must be numbers only, max 10 digits",
              },
            ]}
          >
            <Input
              placeholder="Enter phone"
              inputMode="numeric"
              maxLength={10}
              onChange={handlePhoneChange(form)}
            />
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

      {/* CUSTOMER ADD MODAL */}
      <Modal
        title="Add Customer"
        open={addOpen}
        onOk={handleSubmitAdd}
        onCancel={() => setAddOpen(false)}
        confirmLoading={addSubmitting}
        okText="Create"
      >
        <Form
          form={addForm}
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
            rules={[
              { required: true, message: "Phone is required" },
              {
                pattern: /^\d{1,10}$/,
                message: "Phone must be numbers only, max 10 digits",
              },
            ]}
          >
            <Input
              placeholder="Enter phone"
              inputMode="numeric"
              maxLength={10}
              onChange={handlePhoneChange(addForm)}
            />
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
