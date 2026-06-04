import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAdmin } from '../../Components/Context/AdminContext';
import { apiFetch } from '../../utils/apiClient';

export default function ChangePassword() {
    const navigate = useNavigate();
    const { mustChangePassword, clearMustChangePassword } = useAdmin();

    const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.new_password.length < 8) {
            setError('New password must be at least 8 characters.');
            return;
        }
        if (form.new_password !== form.confirm_password) {
            setError('Passwords do not match.');
            return;
        }
        if (form.new_password === form.current_password) {
            setError('New password must differ from your current password.');
            return;
        }

        setSubmitting(true);
        try {
            await apiFetch('/api/v1/admin/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    current_password: form.current_password,
                    new_password: form.new_password,
                }),
            });
            clearMustChangePassword();
            navigate('/admin', { replace: true });
        } catch (err) {
            setError(err.message || 'Failed to change password. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const PasswordField = ({ label, name, show, onToggle }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-[#2C2C2C]/70 mb-2">
                {label}
            </label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C2C2C]/40" />
                <input
                    id={name}
                    name={name}
                    type={show ? 'text' : 'password'}
                    value={form[name]}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-10 rounded-lg bg-white border border-[#2C2C2C]/10 focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2C2C2C]/40 hover:text-[#2C2C2C]/60 transition-colors"
                >
                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#8B5E3C]/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#8B5E3C]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#8B5E3C] rounded-2xl shadow-lg mb-4">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Set New Password
                    </h1>
                    {mustChangePassword && (
                        <div className="flex items-center justify-center gap-2 mt-3 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            You must change your password before continuing.
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <PasswordField
                            label="Current Password"
                            name="current_password"
                            show={showCurrent}
                            onToggle={() => setShowCurrent(v => !v)}
                        />
                        <PasswordField
                            label="New Password"
                            name="new_password"
                            show={showNew}
                            onToggle={() => setShowNew(v => !v)}
                        />
                        <PasswordField
                            label="Confirm New Password"
                            name="confirm_password"
                            show={showConfirm}
                            onToggle={() => setShowConfirm(v => !v)}
                        />

                        <p className="text-xs text-[#2C2C2C]/50">
                            Password must be at least 8 characters and different from your current password.
                        </p>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full h-12 bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5" />
                                    Update Password
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-xs text-[#2C2C2C]/50">
                    © {new Date().getFullYear()} Marvel Steel. All rights reserved.
                </p>
            </div>
        </div>
    );
}
