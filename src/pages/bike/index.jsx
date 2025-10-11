import { Table } from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageBike = () => {
  const [bikes, setBikes] = useState([]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
  ];

  const fetchBikes = async () => {
    const res = await axios.get(
      "https://68e9fe44f1eeb3f856e5b17c.mockapi.io/Bike"
    ); // lấy dữ liệu về
    console.log(res.data);
    setBikes(res.data); // lưu vào trong bikes
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  return (
    <>
      <Table dataSource={bikes} columns={columns} />
    </>
  );
};

export default ManageBike;
