import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import Axios from '../../Axios';
import './Register.css';

function Register() {
    const navigate = useNavigate();

    const handleOk = async (values) => {


        const fullUserData = {
            ...values
        };

        try {
            const response = await Axios.post(`/api/auth/register`, fullUserData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Registration response:', response.message);
            message.success('Registration successful');
            navigate('/login');
        } catch (error) {
            console.error('Registration failed', error.response.data);
            message.error('Registration failed');
        }
    };


    return (
        <div className='register-container'>
            <div className='register-header'>
                Telefon Rehberi
            </div>

            <Form onFinish={handleOk} layout="vertical" className='register-form'>
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Lütfen Kullanıcuı Adınızı Giriniz!' }]}
                >
                    <Input placeholder="Kullanıcı Adı" />
                </Form.Item>
                <Form.Item
                    name="email"
                    rules={[
                        { type: 'email', message: 'Geçersiz Email!' },
                        { required: true, message: 'Lütfen email adresinizi giriniz!' }
                    ]}
                >
                    <Input placeholder="Email" />
                </Form.Item>
                <Form.Item name="name" rules={[{ required: true, message: 'Lütfen isminizi giriniz!' }]}>
                    <Input placeholder="Isim" />
                </Form.Item>
                <Form.Item name="surname" rules={[{ required: true, message: 'Lütfen soyadınızı giriniz!' }]}>
                    <Input placeholder="Soy Isim" />
                </Form.Item>
                <Form.Item
                    name="phone_number"
                    rules={[{ required: true, message: 'Lütfen telefon numaranızı giriniz!' }]}
                >
                    <Input placeholder="Telefon Numarası" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Lütfen şifrenizi giriniz!' }]}
                >
                    <Input.Password placeholder="Şifre" />
                </Form.Item>
                <Form.Item
                    name="confirm_password"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Şifrenizi tekrar giriniz!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Şifreler uyumlu değil!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Şifre Tekrar" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="register-form-button">
                        Kayıt Ol
                    </Button>
                </Form.Item>
                <Form.Item className="login-link">
                    <Link to="/login">Hesabın var mı? Giriş Yap</Link>
                </Form.Item>
            </Form>

        </div>
    );
}

export default Register;

