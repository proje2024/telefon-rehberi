import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, message } from 'antd';
import Axios from '../../Axios';
import { useAuth } from '../../Authenticator';
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { handleLoginSuccess } = useAuth();

    const onFinish = async (values) => {
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        const formData = new URLSearchParams();
        formData.append('username', values.username);
        formData.append('password', values.password);

        try {
            let loginResponse = await Axios.post('/api/auth/login', formData, config);

            if (loginResponse.status === 200) {
                const { access_token, refresh_token } = loginResponse.data;
                localStorage.setItem("token", access_token);
                localStorage.setItem("refreshToken", refresh_token);
                Axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

                try {
                    const userResponse = await Axios.get('/api/auth/me');
                    if (userResponse.status === 200) {
                        const user = userResponse.data;
                        localStorage.setItem("userId", user.id);
                        localStorage.setItem("user", JSON.stringify(user));
                        message.success('Giriş yapıldı!');
                        handleLoginSuccess();
                        navigate('/home');
                    }
                } catch (error) {
                    console.error('Kullanıcı detayları alınırken hata ile karşılaşıldı:', error);
                    message.error('Kullanıcı detayları alınırken hata ile karşılaşıldı!');
                    setError('Kullanıcı detayları alınırken hata ile karşılaşıldı!');
                }
            }
        } catch (error) {
            console.error('Giriş başarısız:', error);
            message.error('Kullanıcı Adı veya Şifre yanlış!');
            setError('Kullanıcı Adı veya Şifre yanlış!');
        }
    };


    return (
        <div className='login-container'>
            <div className='login-header'>
                Telefon Rehberi
            </div>
            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
            >
                <Form.Item
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    rules={[{ required: true, message: 'Lütfen Kullanıcı Adınızı Giriniz!' }]}
                >
                    <Input placeholder="Kullanıcı Adı" />
                </Form.Item>
                <Form.Item
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    rules={[{ required: true, message: 'Lütfen Şifrenizi Giriniz!' }]}
                >
                    <Input
                        type="password"
                        placeholder="Şifre"
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        Giriş Yap
                    </Button>
                </Form.Item>
                <div className="register-link">
                    <Link to="/register">Hesap Oluştur</Link>
                </div>
            </Form>
            {error && <p className="login-error-text">{error}</p>}
        </div>
    );
}


export default Login;
