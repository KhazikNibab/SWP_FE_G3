import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Input,
  Space,
  Button,
  message,
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
} from "antd";
import { useSelector } from "react-redux";
import { ROLES } from "../../components/auth/roles";
import api from "../../config/axios";

// Contract management table — mirrors the Car table behavior but for contracts
const Contract = () => {
  const account = useSelector((s) => s.account);
  const role = account?.role;
  const canCreateContract =
    role === ROLES.ADMIN ||
    role === ROLES.DEALER_MANAGER ||
    role === ROLES.DEALER_STAFF;
  // Data state
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal / create-contract state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  // UI state
  const [searchText, setSearchText] = useState("");
  const [paymentStatus, setPaymentStatus] = useState();

  // Try to fetch contracts from the API
  const fetchContracts = async () => {
    setLoading(true);
    try {
      // Adjust this endpoint to match your backend (e.g., "/contracts" or "/sale-contracts")
      let res;
      try {
        res = await api.get("/sale-contracts");
      } catch {
        // Fallback to a generic path if the first one fails
        res = await api.get("/contracts");
      }

      const data = res?.data;
      if (!Array.isArray(data)) {
        message.error("Unexpected response for contracts (expected an array)");
        setContracts([]);
        return;
      }
      setContracts(data);
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
      message.error("Failed to load contract data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
    // prefetch customers for the create modal (best-effort)
    fetchCustomers();
  }, []);

  // Fetch list of customers for the create-contract modal (best-effort)
  const fetchCustomers = async () => {
    try {
      let res;
      try {
        res = await api.get("/customers");
      } catch (e) {
        res = await api.get("/users");
      }
      const data = res?.data;
      if (Array.isArray(data)) setCustomers(data);
    } catch (err) {
      // non-fatal
      console.warn("Failed to fetch customers for contract creation", err);
    }
  };

  // Unique status options for filter
  const statusOptions = useMemo(() => {
    return Array.from(new Set((contracts || []).map((c) => c.paymentStatus)))
      .filter(Boolean)
      .sort();
  }, [contracts]);

  // Client-side filtering based on search and payment status
  const filteredContracts = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return (contracts || []).filter((c) => {
      const matchSearch = q
        ? [c.id, c.customerName, c.vehicleModel]
            .map((v) => String(v || "").toLowerCase())
            .some((v) => v.includes(q))
        : true;
      const matchStatus = paymentStatus
        ? c.paymentStatus === paymentStatus
        : true;
      return matchSearch && matchStatus;
    });
  }, [contracts, searchText, paymentStatus]);

  const currency = (n) =>
    typeof n === "number" ? `$${Number(n).toLocaleString()}` : n ?? "";

  // Format to dd/MM/yyyy
  const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return "";
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const columns = [
    {
      title: "Contract ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => String(a.id).localeCompare(String(b.id)),
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      sorter: (a, b) =>
        (a.customerName || "").localeCompare(b.customerName || ""),
    },
    { title: "Vehicle Model", dataIndex: "vehicleModel", key: "vehicleModel" },
    {
      title: "Contract Date",
      dataIndex: "contractDate",
      key: "contractDate",
      sorter: (a, b) =>
        new Date(a.contractDate || 0) - new Date(b.contractDate || 0),
      render: (d) => formatDate(d),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
      render: (v) => currency(v),
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        {canCreateContract && (
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Create Contract
          </Button>
        )}
        <Input.Search
          allowClear
          placeholder="Search by ID, customer, or vehicle"
          value={searchText}
          onSearch={(val) => setSearchText(val)}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 360 }}
        />

        <select
          value={paymentStatus || ""}
          onChange={(e) => setPaymentStatus(e.target.value || undefined)}
          style={{ padding: 8, borderRadius: 6 }}
        >
          <option value="">All payment status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <Button
          onClick={() => {
            setSearchText("");
            setPaymentStatus(undefined);
          }}
        >
          Reset filters
        </Button>
      </Space>

      <Table
        dataSource={filteredContracts}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="Create Contract"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            setCreating(true);
            try {
              // normalize date
              let contractDate = values.contractDate;
              if (contractDate) {
                // moment or Date
                contractDate = contractDate.toISOString
                  ? contractDate.toISOString()
                  : new Date(contractDate).toISOString();
              }

              const payload = {
                customerName: values.customerName,
                customerPhone: values.customerPhone,
                customerEmail: values.customerEmail,
                vehicleId: values.vehicleId,
                contractDate: contractDate,
                promotionAmount: Number(values.promotionAmount) || 0,
                totalAmount: Number(values.totalAmount) || 0,
                dealerId: values.dealerId,
                paymentMethodId: Number(values.paymentMethodId) || 0,
                paymentStatus: values.paymentStatus,
              };

              try {
                await api.post("/sale-contracts", payload);
              } catch {
                await api.post("/contracts", payload);
              }

              message.success("Contract created");
              setIsModalVisible(false);
              form.resetFields();
              fetchContracts();
            } catch (err) {
              console.error(err);
              message.error("Failed to create contract");
            } finally {
              setCreating(false);
            }
          }}
        >
          <Form.Item name="customerId" label="Select Customer">
            <Select
              placeholder="Choose a customer"
              options={(customers || []).map((c) => ({
                value: c.id,
                label: c.customerName || c.name || c.email,
              }))}
              onChange={(val) => {
                const c = (customers || []).find(
                  (x) => String(x.id) === String(val)
                );
                if (c) {
                  form.setFieldsValue({
                    customerName: c.customerName || c.name || "",
                    customerPhone: c.customerPhone || c.phone || "",
                    customerEmail: c.customerEmail || c.email || "",
                  });
                }
              }}
            />
          </Form.Item>

          <Form.Item name="customerName" label="Customer Name">
            <Input disabled />
          </Form.Item>
          <Form.Item name="customerPhone" label="Customer Phone">
            <Input disabled />
          </Form.Item>
          <Form.Item name="customerEmail" label="Customer Email">
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="vehicleId"
            label="Vehicle ID"
            rules={[{ required: true, message: "Please enter vehicle id" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="contractDate"
            label="Contract Date"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="promotionAmount" label="Promotion Amount">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item
            name="totalAmount"
            label="Total Amount"
            rules={[{ required: true, message: "Please enter total amount" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item name="dealerId" label="Dealer ID">
            <Input />
          </Form.Item>

          <Form.Item name="paymentMethodId" label="Payment Method ID">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item name="paymentStatus" label="Payment Status">
            <Input />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={creating}>
                Create
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Contract;
