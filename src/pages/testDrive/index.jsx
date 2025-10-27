import React, { useEffect, useMemo, useState } from "react";
import { Table, Input, Space, Button, message, Tag } from "antd";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import api from "../../config/axios";

// Helper to read query params from the URL
const useQuery = () => new URLSearchParams(useLocation().search);

// Safe access to nested values with multiple possible keys
const pick = (obj, keys, fallback = "-") => {
  for (const k of keys) {
    const parts = k.split(".");
    let val = obj;
    for (const p of parts) {
      if (val && typeof val === "object" && p in val) {
        val = val[p];
      } else {
        val = undefined;
        break;
      }
    }
    if (val !== undefined && val !== null && val !== "") return val;
  }
  return fallback;
};

const TestDrivePage = () => {
  const query = useQuery();
  const account = useSelector((s) => s.account);

  // Try to resolve dealerId in this order: URL ?dealerId= -> account.dealerId -> account.dealer.id
  const dealerIdFromUrl = query.get("dealerId");
  const dealerIdFromAccount = account?.dealerId || account?.dealer?.id;
  const dealerId = dealerIdFromUrl || dealerIdFromAccount || "";

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  const fetchTestDrives = async () => {
    if (!dealerId) {
      message.warning(
        "Dealer ID not found. Provide ?dealerId= in URL or login as Dealer Staff."
      );
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      // axios baseURL already includes /api, so we call /test-drives and pass dealerId as query param
      const res = await api.get("/test-drives", { params: { dealerId } });
      const data = res?.data;
      if (!Array.isArray(data)) {
        message.error(
          "Unexpected response from /test-drives (expected an array)"
        );
        setRows([]);
        return;
      }
      setRows(data);
    } catch (err) {
      console.error("Failed to fetch test drives:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load test drives.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestDrives();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return (rows || []).filter((r) => {
      const values = [
        pick(r, ["id", "testDriveId"], "").toString(),
        pick(r, ["customer.name", "customerName"], "").toString(),
        pick(r, ["customer.phone", "customerPhone"], "").toString(),
        pick(
          r,
          ["vehicle.model", "car.model", "vehicleModel", "carModel"],
          ""
        ).toString(),
        pick(r, ["status"], "").toString(),
        pick(r, ["scheduledAt", "scheduleAt", "scheduledTime"], "").toString(),
      ].map((v) => String(v || "").toLowerCase());
      return values.some((v) => v.includes(q));
    });
  }, [rows, search]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (_, record) => pick(record, ["id", "testDriveId"], "-"),
      sorter: (a, b) =>
        String(pick(a, ["id", "testDriveId"], "")).localeCompare(
          String(pick(b, ["id", "testDriveId"], ""))
        ),
      width: 100,
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, r) => (
        <div>
          <div>{pick(r, ["customer.name", "customerName"], "-")}</div>
          <div style={{ color: "#888" }}>
            {pick(r, ["customer.phone", "customerPhone"], "-")}
          </div>
        </div>
      ),
    },
    {
      title: "Vehicle",
      key: "vehicle",
      render: (_, r) => (
        <div>
          <div>
            {pick(
              r,
              ["vehicle.model", "car.model", "vehicleModel", "carModel"],
              "-"
            )}
          </div>
          <div style={{ color: "#888" }}>
            #{pick(r, ["vehicle.id", "car.id", "vehicleId", "carId"], "-")}
          </div>
        </div>
      ),
    },
    {
      title: "Scheduled At",
      key: "scheduledAt",
      render: (_, r) => {
        const iso = pick(r, ["scheduledAt", "scheduleAt", "scheduledTime"], "");
        if (!iso) return "-";
        try {
          return new Date(iso).toLocaleString();
        } catch {
          return String(iso);
        }
      },
      sorter: (a, b) => {
        const av = new Date(
          pick(a, ["scheduledAt", "scheduleAt", "scheduledTime"], 0)
        ).getTime();
        const bv = new Date(
          pick(b, ["scheduledAt", "scheduleAt", "scheduledTime"], 0)
        ).getTime();
        return av - bv;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v) => {
        const val = (v || "").toString().toLowerCase();
        const color =
          val === "completed"
            ? "green"
            : val === "cancelled"
            ? "red"
            : val === "scheduled"
            ? "blue"
            : "default";
        return <Tag color={color}>{v || "-"}</Tag>;
      },
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (v) => v || "-",
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          allowClear
          placeholder="Search by ID, customer, vehicle, status, or time"
          value={search}
          onSearch={(val) => setSearch(val)}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 360 }}
        />
        <Button onClick={() => setSearch("")}>Reset</Button>
        <Button onClick={fetchTestDrives} disabled={!dealerId}>
          Refresh
        </Button>
      </Space>

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey={(row) =>
          pick(row, ["id", "testDriveId"], null) ||
          `${pick(row, ["customer.phone", "customerPhone"], "")}-${pick(
            row,
            ["scheduledAt", "scheduleAt", "scheduledTime"],
            Math.random()
          )}`
        }
        loading={loading}
      />
    </>
  );
};

export default TestDrivePage;
