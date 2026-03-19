import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LogIn, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useAdmin } from '../../Components/Context/AdminContext';


export default function AdminLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAdmin();

    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
            rememberMe: false
        },
        validationSchema: Yup.object({
            username: Yup.string()
                .email('Invalid email address')
                .required('Email is required'),
            password: Yup.string()
                .required('Password is required')
                .min(6, 'Password must be at least 6 characters'),
        }),
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            try {
                const result = await login({
                    username: values.username,
                    password: values.password,
                });

                if (result.success) {
                    // Store email for display purposes
                    localStorage.setItem('adminEmail', values.username);
                    navigate('/admin');
                } else {
                    setFieldError('general', result.error);
                }
            } catch (error) {
                setFieldError('general', 'An unexpected error occurred');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#8B5E3C]/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#8B5E3C]/5 rounded-full blur-3xl"></div>
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#8B5E3C] rounded-2xl shadow-lg mb-4">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1
                        className="text-3xl font-bold text-[#2C2C2C] mb-2"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Marvel Steel
                    </h1>
                    <p className="text-[#2C2C2C]/70">
                        Admin Portal
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {formik.errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {formik.errors.general}
                            </div>
                        )}

                        {/* Email/Username Field */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-[#2C2C2C]/70 mb-2"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C2C2C]/40" />
                                <input
                                    id="username"
                                    type="email"
                                    {...formik.getFieldProps('username')}
                                    placeholder="Enter your email"
                                    className={`w-full h-12 pl-10 pr-3 rounded-lg bg-white border ${formik.touched.username && formik.errors.username
                                            ? 'border-red-500'
                                            : 'border-[#2C2C2C]/10'
                                        } focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm`}
                                />
                            </div>
                            {formik.touched.username && formik.errors.username && (
                                <p className="mt-1 text-xs text-red-500">{formik.errors.username}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-[#2C2C2C]/70 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C2C2C]/40" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    {...formik.getFieldProps('password')}
                                    placeholder="••••••••"
                                    className={`w-full h-12 pl-10 pr-10 rounded-lg bg-white border ${formik.touched.password && formik.errors.password
                                            ? 'border-red-500'
                                            : 'border-[#2C2C2C]/10'
                                        } focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2C2C2C]/40 hover:text-[#2C2C2C]/60 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {formik.touched.password && formik.errors.password && (
                                <p className="mt-1 text-xs text-red-500">{formik.errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center">
                            <input
                                id="rememberMe"
                                type="checkbox"
                                {...formik.getFieldProps('rememberMe')}
                                checked={formik.values.rememberMe}
                                className="w-4 h-4 text-[#8B5E3C] border-[#2C2C2C]/20 rounded focus:ring-[#8B5E3C]"
                            />
                            <label htmlFor="rememberMe" className="ml-2 text-sm text-[#2C2C2C]/70">
                                Remember me
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="w-full h-12 bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {formik.isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>

                        {/* Demo Credentials Hint */}
                        <div className="text-center">
                            <p className="text-xs text-[#2C2C2C]/50">
                                Use your admin credentials
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-xs text-[#2C2C2C]/50">
                    © {new Date().getFullYear()} Marvel Steel. All rights reserved.
                </p>
            </div>
        </div>
    );
}