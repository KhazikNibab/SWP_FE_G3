import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  message,
  ConfigProvider,
  theme,
} from "antd";
import {
  ThunderboltOutlined,
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { login } from "../../redux/accountSlice";

const { Title, Text, Paragraph } = Typography;

function LoginPage() {
  // --- Component State ---
  const [isLoading, setIsLoading] = useState(false);
  // Sử dụng message API của AntD để hiển thị thông báo động
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm(); // Hook để tương tác với form
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- Event Handlers ---
  // onFinish sẽ được gọi khi form được submit và đã qua validation thành công
  const onFinish = async (values) => {
    setIsLoading(true);

    // --- Giả lập gọi API ---
    try {
      const res = await api.post("/auth/login", values);
      toast.success("Successfully log in");
      navigate("/login");
      console.log(res.data);
      const { role } = res.data;
      localStorage.setItem("role", role);

      // store the state of login 
      dispatch(login(res.data))



    } catch (e) {
      message.error("login failed, please try again" + e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Giao diện chính ---
  return (
    // ConfigProvider để áp dụng dark theme cho tất cả component AntD bên trong
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#1677ff", // Màu xanh dương chủ đạo
          borderRadius: 8,
          colorBgContainer: `rgba(24, 35, 51, 0.7)`, // Màu nền cho các container như Input, Card
        },
      }}
    >
      {/* contextHolder là thành phần cần thiết để messageApi có thể hoạt động */}
      {contextHolder}
      <div
        className="min-h-screen flex items-center justify-center p-4 font-sans bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1617704548622-069f5c427505?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div> {/* Lớp phủ tối */}
        <Card
          className="relative w-full max-w-6xl"
          style={{
            backgroundColor: "rgba(17, 24, 39, 0.5)", // Màu nền bán trong suốt
            backdropFilter: "blur(12px)", // Hiệu ứng làm mờ nền
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
          bordered={false}
        >
          <Row align="middle">
            {/* Panel giới thiệu (Bên trái) */}
            <Col
              xs={0} // Ẩn trên màn hình siêu nhỏ
              md={12} // Chiếm 12/24 cột trên màn hình vừa và lớn
              className="relative p-8 lg:p-12 flex flex-col justify-end"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent rounded-l-lg"></div>
              <div className="relative">
                <Title level={2} style={{ color: "white", fontWeight: "bold" }}>
                  Tương lai của ngành ô tô là ở đây.
                </Title>
                <Paragraph style={{ color: "#d1d5db", fontSize: "1.1rem" }}>
                  Tối ưu hóa kho hàng, quản lý quan hệ khách hàng và tăng tốc
                  doanh số với nền tảng tất cả trong một của chúng tôi.
                </Paragraph>
              </div>
            </Col>

            {/* Panel Form Đăng nhập (Bên phải) */}
            <Col
              xs={24} // Chiếm toàn bộ chiều rộng trên màn hình nhỏ
              md={12} // Chiếm 12/24 cột trên màn hình vừa và lớn
              className="p-8 md:p-12 flex flex-col justify-center"
            >
              <div className="w-full max-w-md mx-auto">
                <header className="flex items-center gap-4 mb-8">
                  <Avatar
                    size={64}
                    icon={<ThunderboltOutlined />}
                    style={{ backgroundColor: "#1677ff" }}
                  />
                  <div>
                    <Title level={2} style={{ margin: 0, color: "white" }}>
                      EV Dealer Portal
                    </Title>
                    <Text type="secondary">
                      Chào mừng trở lại! Đăng nhập để tiếp tục.
                    </Text>
                  </div>
                </header>

                <Form
                  form={form}
                  name="login"
                  initialValues={{ remember: true }}
                  onFinish={onFinish}
                  layout="vertical"
                  requiredMark={false} // Ẩn dấu * màu đỏ ở label
                >
                  {/* Trường Email với Validation */}
                  <Form.Item
                    name="email"
                    label="Địa chỉ Email"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập địa chỉ email!",
                      },
                      {
                        type: "email",
                        message: "Địa chỉ email không hợp lệ!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined className="site-form-item-icon" />}
                      placeholder="admin@ev.com"
                      size="large"
                    />
                  </Form.Item>

                  {/* Trường Password với Validation */}
                  <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mật khẩu!",
                      },
                      {
                        min: 6,
                        message: "Mật khẩu phải có ít nhất 6 ký tự!",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      placeholder="••••••••"
                      size="large"
                    />
                  </Form.Item>

                  {/* Nút Submit */}
                  <Form.Item className="mt-6">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      block // Nút chiếm toàn bộ chiều rộng
                      size="large"
                    >
                      {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
                    </Button>
                  </Form.Item>
                </Form>
                <footer className="text-center mt-12">
                  <Text type="secondary" style={{ fontSize: "0.8rem" }}>
                    &copy; {new Date().getFullYear()} EV Dealer Systems Inc. All
                    Rights Reserved.
                  </Text>
                </footer>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </ConfigProvider>
  );
}

export default LoginPage;
