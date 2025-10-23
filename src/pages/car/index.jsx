import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Input,
  message,
  Space,
  Button,
  InputNumber,
  Modal,
  Descriptions,
  Typography,
  Divider,
} from "antd";
import api from "../../config/axios";
// Note: The axios instance sets 'ngrok-skip-browser-warning' and 'Accept: application/json'
// headers to bypass ngrok's interstitial HTML page and request JSON directly.

const ManageCar = () => {
  // Base data state (original cars from API)
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  // Per-row quantity state and requesting state
  const [orderQtyMap, setOrderQtyMap] = useState({});
  const [orderingId, setOrderingId] = useState(null);

  // UI state for search and filter
  const [searchText, setSearchText] = useState("");
  const [manufacturer, setManufacturer] = useState();

  // READ: Function to fetch car data from the API
  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vehicles");
      const data = res?.data;

      // Minimal guard: ensure we pass an array to AntD Table.
      if (!Array.isArray(data)) {
        message.error("Unexpected response from /vehicles (expected an array)");
        //bang antd vẫn nhận đc array để ko bị lỗi
        setCars([]);
        return;
      }

      setCars(data);
    } catch (error) {
      console.error("Failed to fetch cars:", error);
      message.error("Failed to load car data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch cars when the component mounts
  useEffect(() => {
    fetchCars();
  }, []);

  // Derived: list of unique manufacturers for the filter dropdown
  const manufacturerOptions = useMemo(() => {
    return Array.from(new Set((cars || []).map((c) => c.manufacturer)))
      .filter(Boolean)
      .sort();
  }, [cars]);

  // Derived: client-side filtered list shown in the table
  // - Search matches id, model, or manufacturer (case-insensitive)
  // - Filter by exact manufacturer when selected
  const filteredCars = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return (cars || []).filter((car) => {
      const matchSearch = q
        ? [car.id, car.model, car.manufacturer]
            .map((v) => String(v || "").toLowerCase())
            .some((v) => v.includes(q))
        : true;
      const matchManufacturer = manufacturer
        ? car.manufacturer === manufacturer
        : true;
      return matchSearch && matchManufacturer;
    });
  }, [cars, searchText, manufacturer]);

  // Define table columns
  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => String(a.id).localeCompare(String(b.id)),
    },
    {
      title: "Manufacturer",
      dataIndex: "manufacturer",
      key: "manufacturer",
      sorter: (a, b) => a.manufacturer.localeCompare(b.manufacturer),
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      // Render price with a dollar sign and formatting
      render: (price) => `$${Number(price).toLocaleString()}`,
    },
    //order car from EVM staff
    {
      title: "Make Order",
      key: "make-order",
      render: (_, car) => {
        const qty = orderQtyMap[car.id] ?? 1;
        return (
          <Space>
            <InputNumber
              min={1}
              max={10}
              value={qty}
              onChange={(val) => handleQtyChange(car.id, val)}
              style={{ width: 90 }}
            />
            <Button
              type="primary"
              onClick={() => handleMakeOrder(car)}
              loading={orderingId === car.id}
            >
              Request
            </Button>
          </Space>
        );
      },
    },
  ];

  // Update per-row quantity
  const handleQtyChange = (carId, val) => {
    const next = Number(val) || 1;
    const clamped = Math.max(1, Math.min(10, next));
    setOrderQtyMap((prev) => ({ ...prev, [carId]: clamped }));
  };

  // Make order handler with placeholder EVM Staff request
  const handleMakeOrder = (car) => {
    const qty = orderQtyMap[car.id] ?? 1;
    if (qty < 1 || qty > 10) {
      message.error("Quantity must be between 1 and 10.");
      return;
    }

    const unitPrice = Number(car.price) || 0;
    const total = unitPrice * qty;
    const now = new Date();

    Modal.confirm({
      title: "Confirm order request",
      content: (
        <div>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Please review your order details before confirming.
          </Typography.Paragraph>
          <Descriptions
            bordered
            size="small"
            column={1}
            labelStyle={{ width: 160 }}
          >
            <Descriptions.Item label="Car ID">{car.id}</Descriptions.Item>
            <Descriptions.Item label="Manufacturer">
              {car.manufacturer}
            </Descriptions.Item>
            <Descriptions.Item label="Model">{car.model}</Descriptions.Item>
            <Descriptions.Item label="Unit Price">
              ${unitPrice.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Quantity">{qty}</Descriptions.Item>
            <Descriptions.Item label="Total">
              <strong>${total.toLocaleString()}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Recipient">
              EVM Staff (placeholder)
            </Descriptions.Item>
            <Descriptions.Item label="Requested At">
              {now.toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
          <Divider style={{ margin: "12px 0" }} />
          <Typography.Text>
            This will create a request to <strong>EVM Staff</strong>. Since that
            role isn't set up yet, we'll record it with a placeholder.
          </Typography.Text>
        </div>
      ),
      okText: "Send Request",
      cancelText: "Cancel",
      onOk: async () => {
        setOrderingId(car.id);
        const payload = {
          carId: car.id,
          quantity: qty,
          assignedTo: "EVM Staff (TBD)",
          unitPrice,
          total,
          requestedAt: now.toISOString(),
        };

        try {
          // Placeholder endpoint; replace when backend is ready
          await api.post("/evm-requests", payload);
          message.success("Order request sent to EVM Staff.");
        } catch (err) {
          console.warn("/evm-requests not available, simulating success", err);
          message.success("Order request simulated (EVM Staff placeholder).");
        } finally {
          setOrderingId(null);
        }
      },
    });
  };

  return (
    <>
      {/*
        Search + Filter bar:
        - Search: matches id/model/manufacturer
        - Filter: exact manufacturer match
        This is client-side filtering on the list fetched from /vehicles.
      */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          allowClear
          placeholder="Search by ID, model, or manufacturer"
          value={searchText}
          onSearch={(val) => setSearchText(val)}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 320 }}
        />
        <select
          value={manufacturer || ""}
          onChange={(e) => setManufacturer(e.target.value || undefined)}
          style={{ padding: 8, borderRadius: 6 }}
        >
          <option value="">All manufacturers</option>
          {manufacturerOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <Button
          onClick={() => {
            // Clear filters to restore original list
            setSearchText("");
            setManufacturer(undefined);
          }}
        >
          Reset filters
        </Button>
      </Space>

      <Table
        dataSource={filteredCars}
        columns={columns}
        rowKey="id" // Use 'id' as the unique key for each row
        loading={loading}
      />
    </>
  );
};

export default ManageCar;
