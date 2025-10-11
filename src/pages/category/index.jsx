import { Button, Input, Modal, Table, Form } from "antd";
import { useForm } from "antd/es/form/Form";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ManageCategory = () => {
  //data from api
  const [categories, setCategories] = useState();
  const [open, setOpen] = useState(false);
  const [form] = useForm();

  //column
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
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      //record lấy ra dữ liệu gán với id có name, description
      render: (id, record) => {
        return (
          <>
            <Button
              type="primary"
              onClick={() => {
                //open modal
                setOpen(true);
                //fill data into form
                form.setFieldsValue(record);
              }}
            >
              Edit
            </Button>
            <Button type="primary" danger>
              Delete
            </Button>
          </>
        );
      },
    },
  ];

  //lấy data từ api vứt vào table
  const fetchCategories = async () => {
    console.log("fetch data from api");

    const res = await axios.get(
      "https://68e9fe44f1eeb3f856e5b17c.mockapi.io/categories"
    );
    console.log(res.data);
    setCategories(res.data);
  };

  const handleSubmitForm = async (values) => {
    const { id } = values;
    let res;

    if (id) {
      //update
      res = await axios.put(
        "https://68e9fe44f1eeb3f856e5b17c.mockapi.io/categories",
        values
      );
    } else {
      //create new
      res = await axios.post(
        "https://68e9fe44f1eeb3f856e5b17c.mockapi.io/categories",
        values
      );
    }

    console.log(values);
    res = await axios.post(
      "https://68e9fe44f1eeb3f856e5b17c.mockapi.io/categories",
      values
    );
    console.log(res.data);
    setOpen(false);
    fetchCategories();
    form.resetFields();
    toast.success("successfully create new category");
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  //UI
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Add category
      </Button>
      <Table columns={columns} dataSource={categories} />
      <Modal
        title="Create new category"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form
          labelCol={{
            span: 24,
          }}
          form={form}
          onFinish={handleSubmitForm}
        >
          <Form.Item label="Id" name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input your name!",
              },
              {
                min: 3,
                message: "Name must be at least 3 characters long!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please input a description!",
              },
              {
                max: 200,
                message: "Description cannot exceed 200 characters!",
              },
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ManageCategory;
