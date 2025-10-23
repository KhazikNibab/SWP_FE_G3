import React, { useEffect, useMemo, useState } from "react";
import { Table, Input, Space, Button, message } from "antd";
import api from "../../config/axios";

// Contract management table — mirrors the Car table behavior but for contracts
const Contract = () => {
  // Data state
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);

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
  }, []);

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
        ? [
            c.id,
            c.customerName,
            c.customerEmail,
            c.customerPhone,
            c.vehicleId,
            c.vehicleModel,
            c.vehicleManufacturer,
          ]
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

  const columns = [
    {
      title: "ID",
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
    { title: "Phone", dataIndex: "customerPhone", key: "customerPhone" },
    { title: "Email", dataIndex: "customerEmail", key: "customerEmail" },
    { title: "Model", dataIndex: "vehicleModel", key: "vehicleModel" },
    {
      title: "Manufacturer",
      dataIndex: "vehicleManufacturer",
      key: "vehicleManufacturer",
    },
    {
      title: "Price",
      dataIndex: "vehiclePrice",
      key: "vehiclePrice",
      sorter: (a, b) => (a.vehiclePrice || 0) - (b.vehiclePrice || 0),
      render: (v) => currency(v),
    },
    {
      title: "Contract Date",
      dataIndex: "contractDate",
      key: "contractDate",
      sorter: (a, b) =>
        new Date(a.contractDate || 0) - new Date(b.contractDate || 0),
      render: (d) => (d ? new Date(d).toLocaleString() : ""),
    },
    {
      title: "Promotion",
      dataIndex: "promotionAmount",
      key: "promotionAmount",
      sorter: (a, b) => (a.promotionAmount || 0) - (b.promotionAmount || 0),
      render: (v) => currency(v),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
      render: (v) => currency(v),
    },
    {
      title: "Payment Method ID",
      dataIndex: "paymentMethodId",
      key: "paymentMethodId",
      sorter: (a, b) => (a.paymentMethodId || 0) - (b.paymentMethodId || 0),
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethodDisplayName",
      key: "paymentMethodDisplayName",
    },
    { title: "Status", dataIndex: "paymentStatus", key: "paymentStatus" },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          allowClear
          placeholder="Search by ID, customer, email, or vehicle"
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
    </>
  );
};

export default Contract;
