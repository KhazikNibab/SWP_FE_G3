import React, { useState } from 'react';
import './LoginPage.css';
import axios from 'axios';

// Import an icon from a library or use an SVG
const BoltIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="logo-icon"
    >
        <path
            fillRule="evenodd"
            d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
            clipRule="evenodd"
        />
    </svg>
);

// Add these SVG icon components for the toggle
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="toggle-password-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="toggle-password-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" />
    </svg>
);



const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [modal, setModal] = useState({ show: false, message: '', isError: false });


    //xử lý login
    const handleLogin = async (e) => {
        e.preventDefault(); //Khi người dùng nhấn nút "Sign In", hàm này ngăn trang bị reload lại (hành vi mặc định của form).
        setError(''); //Xóa thông báo lỗi cũ (nếu có) trước khi thực hiện đăng nhập mới.

        // This is where you would add your authentication logic
        try {
            const API_ENDPOINT = "https://68e30e928e14f4523dac632f.mockapi.io/Students";
            // Gửi yêu cầu POST với email và password
            const res = await axios.post(API_ENDPOINT, {
                email: email,
                password: password,
            });
            const users = res.data;
            const foundUser = users.find(
                (user) => user.email === email && user.password === password
            )

            // Xử lý khi đăng nhập thành công
            console.log("Login Successful", res.data);
            alert('Sign in successful!');
        } catch (err) {
            // Xử lý lỗi đăng nhập
            console.error("Login Failed", err);

            if (err.response) {
                // Server đã phản hồi với một mã trạng thái lỗi (4xx, 5xx)
                // Ví dụ: Sai email, mật khẩu
                setError(err.response.data.message || 'Email hoặc mật khẩu không chính xác.');
            } else if (err.request) {
                // Yêu cầu đã được gửi đi nhưng không nhận được phản hồi
                setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
            } else {
                // Một lỗi khác đã xảy ra
                setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
            }
        }
    };

    return (
        <main className="login-page-container">
            <div className="login-form-section">
                <div className="form-content">
                    <header className="login-header">
                        <BoltIcon />
                        <h1>EV Dealer Management</h1>
                        <p>Welcome back! Please Sign in to your account.</p>
                    </header>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="input-wrapper">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="sales@example.com"
                                required
                            />
                        </div>

                        <div className="input-wrapper">
                            <label htmlFor="password">Password</label>
                            <div className='password-input-container'>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="toggle-password-span">
                                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                                </span>
                            </div>

                        </div>

                        <div className="form-actions">
                            <a href="#" className="forgot-password-link">Forgot Password?</a>
                        </div>

                        <button type="submit" className="login-button">
                            Sign In
                        </button>
                    </form>
                </div>
                <footer className="form-footer">
                    <p>&copy; 2025 EV Dealer Systems Inc. All Rights Reserved.</p>
                </footer>
            </div>

            <div className="login-showcase-section">

                <div className="showcase-overlay">
                    <h2>The Future of Automotive Sales</h2>
                    <p>Streamline inventory, manage customer relations, and accelerate your sales with our all-in-one platform.</p>
                </div>
            </div>
        </main>
    );
}
export default LoginPage;