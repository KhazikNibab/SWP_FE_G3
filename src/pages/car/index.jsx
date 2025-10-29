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
  Tag,
} from "antd";
import api from "../../config/axios";
import { useSelector } from "react-redux";
import { ROLES } from "../../components/auth/roles";
// Note: The axios instance sets 'ngrok-skip-browser-warning' and 'Accept: application/json'
// headers to bypass ngrok's interstitial HTML page and request JSON directly.

const ManageCar = () => {
  const account = useSelector((s) => s.account);
  const role = account?.role;
  const canOrder =
    role === ROLES.DEALER_MANAGER ||
    role === ROLES.DEALER_STAFF ||
    role === ROLES.ADMIN;
  // Base data state (original cars from API)
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  // Per-row quantity state and requesting state
  const [orderQtyMap, setOrderQtyMap] = useState({});
  const [orderingId, setOrderingId] = useState(null);

  // UI state for Details modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  // UI state for Compare modal and table selection
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // car ids

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

  // Selected cars from the main data list
  const selectedCars = useMemo(() => {
    const idSet = new Set(selectedRowKeys);
    return (cars || []).filter((c) => idSet.has(c.id));
  }, [cars, selectedRowKeys]);

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
    {
      title: "Details",
      key: "details",
      render: (_, car) => (
        <Button
          onClick={() => {
            setSelectedCar(car);
            setDetailOpen(true);
          }}
        >
          Details
        </Button>
      ),
    },
    //order car from EVM staff (dealers + admin only)
    ...(canOrder
      ? [
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
        ]
      : []),
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

  // Row selection (limit to 3 cars for comparison)
  const rowSelection = {
    selectedRowKeys,
    onChange: (nextKeys) => {
      if (nextKeys.length > 3) {
        message.warning("You can compare up to 3 cars.");
        return;
      }
      setSelectedRowKeys(nextKeys);
    },
    // Only allow selecting rows from currently filtered list
    getCheckboxProps: (record) => ({
      disabled:
        selectedRowKeys.length >= 3 && !selectedRowKeys.includes(record.id),
    }),
  };

  // Build comparison rows from selected cars
  const baseFeatureDefs = useMemo(
    () => [
      { key: "manufacturer", label: "Manufacturer" },
      { key: "model", label: "Model" },
      {
        key: "price",
        label: "Price",
        render: (v) => `$${Number(v || 0).toLocaleString()}`,
      },
      { key: "battery", label: "Battery" },
      { key: "range", label: "Range" },
      { key: "acceleration", label: "Acceleration" },
      { key: "driveType", label: "Drive Type" },
      { key: "chargingTime", label: "Charging Time" },
      {
        key: "colorOptions",
        label: "Color Options",
        render: (arr) =>
          Array.isArray(arr) ? (
            <Space size={[6, 8]} wrap>
              {arr.map((c) => (
                <Tag key={c} color="blue">
                  {c}
                </Tag>
              ))}
            </Space>
          ) : (
            "—"
          ),
      },
    ],
    []
  );

  const comparisonRows = useMemo(() => {
    // Only show features that exist in at least one selected car
    const present = baseFeatureDefs.filter((f) =>
      selectedCars.some((c) => c[f.key] !== undefined && c[f.key] !== null)
    );
    return present;
  }, [baseFeatureDefs, selectedCars]);

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
        <Divider type="vertical" />
        <Space>
          <Button
            type="primary"
            disabled={selectedCars.length < 2}
            onClick={() => setCompareOpen(true)}
          >
            Compare ({selectedCars.length})
          </Button>
          {selectedCars.length > 0 && (
            <Button onClick={() => setSelectedRowKeys([])}>Clear</Button>
          )}
        </Space>
      </Space>

      <Table
        dataSource={filteredCars}
        columns={columns}
        rowKey="id" // Use 'id' as the unique key for each row
        rowSelection={rowSelection}
        loading={loading}
      />

      {/* Vehicle Details Modal */}
      <Modal
        open={detailOpen}
        title={
          selectedCar
            ? `Vehicle Details: ${selectedCar.manufacturer} ${selectedCar.model}`
            : "Vehicle Details"
        }
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setDetailOpen(false)}
          >
            Close
          </Button>,
        ]}
      >
        {selectedCar && (
          <Descriptions
            bordered
            size="small"
            column={1}
            labelStyle={{ width: 200 }}
          >
            <Descriptions.Item label="ID">{selectedCar.id}</Descriptions.Item>
            <Descriptions.Item label="Manufacturer">
              {selectedCar.manufacturer}
            </Descriptions.Item>
            <Descriptions.Item label="Model">
              {selectedCar.model}
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              ${Number(selectedCar.price || 0).toLocaleString()}
            </Descriptions.Item>
            {selectedCar.battery !== undefined && (
              <Descriptions.Item label="Battery">
                {selectedCar.battery}
              </Descriptions.Item>
            )}
            {selectedCar.range !== undefined && (
              <Descriptions.Item label="Range">
                {selectedCar.range}
              </Descriptions.Item>
            )}
            {selectedCar.acceleration !== undefined && (
              <Descriptions.Item label="Acceleration">
                {selectedCar.acceleration}
              </Descriptions.Item>
            )}
            {selectedCar.driveType !== undefined && (
              <Descriptions.Item label="Drive Type">
                {selectedCar.driveType}
              </Descriptions.Item>
            )}
            {selectedCar.chargingTime !== undefined && (
              <Descriptions.Item label="Charging Time">
                {selectedCar.chargingTime}
              </Descriptions.Item>
            )}
            {Array.isArray(selectedCar.colorOptions) && (
              <Descriptions.Item label="Color Options">
                <Space size={[6, 8]} wrap>
                  {selectedCar.colorOptions.map((c) => (
                    <Tag key={c} color="blue">
                      {c}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Compare Modal */}
      <Modal
        width={Math.min(1200, 300 + selectedCars.length * 260)}
        open={compareOpen}
        title={
          selectedCars.length
            ? `Compare Cars (${selectedCars.length} selected)`
            : "Compare Cars"
        }
        onCancel={() => setCompareOpen(false)}
        footer={[
          <Button key="clear" onClick={() => setSelectedRowKeys([])}>
            Clear selection
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setCompareOpen(false)}
          >
            Close
          </Button>,
        ]}
      >
        {selectedCars.length < 2 ? (
          <Typography.Text type="secondary">
            Select at least two cars to compare.
          </Typography.Text>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{ width: "100%", borderCollapse: "collapse" }}
              border="1"
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8, width: 220 }}>
                    Feature
                  </th>
                  {selectedCars.map((car) => (
                    <th
                      key={car.id}
                      style={{ textAlign: "left", padding: 8, minWidth: 220 }}
                    >
                      {car.manufacturer} {car.model}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((f) => (
                  <tr key={f.key}>
                    <td
                      style={{
                        padding: 8,
                        background: "#fafafa",
                        fontWeight: 500,
                      }}
                    >
                      {f.label}
                    </td>
                    {selectedCars.map((car) => (
                      <td key={car.id + String(f.key)} style={{ padding: 8 }}>
                        {(() => {
                          const v = car[f.key];
                          if (f.render) return f.render(v, car);
                          if (Array.isArray(v)) return v.join(", ");
                          if (v === undefined || v === null || v === "")
                            return "—";
                          return String(v);
                        })()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ManageCar;
