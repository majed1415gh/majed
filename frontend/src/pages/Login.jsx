// src/pages/Login.jsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // استيراد Supabase client

const Login = ({ t }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [error, setError] = useState('');

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // التحقق من صحة رقم الجوال السعودي
        if (!/^05[0-9]{8}$/.test(phone)) {
            setError('الرجاء إدخال رقم جوال سعودي صالح يبدأ بـ 05.');
            return;
        }
        setLoading(true);
        const formattedPhone = `+966${phone.slice(1)}`;

        try {
            // استخدام الواجهة الخلفية التي أنشأناها لإرسال الرمز
            const response = await fetch('http://localhost:3001/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formattedPhone })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'فشل إرسال الرمز');
            
            setStep('otp');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const formattedPhone = `+966${phone.slice(1)}`;

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: otp,
                type: 'sms',
            });
            if (error) throw error;
            if (!data.session) {
                throw new Error("فشل التحقق. قد يكون الرمز غير صحيح أو انتهت صلاحيته.");
            }
            // App.jsx سيقوم بالتعرف على تغيير حالة المصادقة تلقائيًا
        } catch (err) {
            setError(err.message || 'حدث خطأ غير متوقع.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // النصوص الديناميكية بناءً على حالة العرض (تسجيل دخول أو إنشاء حساب)
    const title = isLoginView ? 'تسجيل الدخول' : 'إنشاء حساب';
    const subtitle = `يرجى إدخال رقم جوالك ${isLoginView ? 'لتسجيل الدخول إلى عادل' : 'لإنشاء حساب جديد'}`;
    const buttonText = isLoginView ? 'تسجيل الدخول' : 'إنشاء حساب';
    const switchViewText = isLoginView ? 'ليس لديك حساب؟ إنشاء حساب' : 'لديك حساب بالفعل؟ تسجيل الدخول';
    const termsText = 'بتسجيلك، فإنك توافق على شروط الخدمة و سياسة الخصوصية';

    const renderPhoneStep = () => (
        <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 text-right mb-1">رقم الجوال *</label>
                <input
                    id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xxxxxxxx" required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-left" dir="ltr"
                />
            </div>
            <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'لحظات...' : buttonText}
                </button>
            </div>
        </form>
    );

    const renderOtpStep = () => (
         <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="text-center text-sm text-gray-600">
                <p>أدخل الرمز المكون من 6 أرقام الذي أرسلناه إلى</p>
                <p className="font-semibold" dir="ltr">{phone}</p>
                 <button type="button" onClick={() => { setStep('phone'); setError(''); }} className="mt-1 text-xs font-medium text-teal-600 hover:text-teal-500">
                    تغيير الرقم؟
                 </button>
            </div>
            <div>
                 <label htmlFor="otp" className="block text-sm font-medium text-gray-700 text-right mb-1">رمز التحقق *</label>
                <input
                    id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                    placeholder="------" required maxLength="6"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-center text-2xl tracking-[0.5em]" dir="ltr"
                />
            </div>
            <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'جاري التحقق...' : 'تحقق'}
                </button>
            </div>
        </form>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 bg-cover" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-48 0c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z\" fill=\"%23e2e8f0\" fill-opacity=\"0.4\" fill-rule=\"evenodd\"/%3E%3C/svg%3E')" }}>
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200 animate-fade-in">
                <div className="text-center">
                    <h2 className="mt-4 text-4xl font-bold text-gray-800">{title}</h2>
                    <p className="mt-2 text-base text-gray-600">{subtitle}</p>
                </div>

                {error && <p className="text-center text-sm font-semibold text-red-700 bg-red-100 p-3 rounded-lg">{error}</p>}

                {step === 'phone' ? renderPhoneStep() : renderOtpStep()}

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-gray-400 font-medium">أو</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div>
                    <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-full shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 disabled:opacity-50">
                        <img src="https://www.google.com/favicon.ico" alt="Google icon" className="w-5 h-5 ml-3" />
                        {isLoginView ? 'التسجيل عبر Google' : 'التسجيل عبر Google'}
                    </button>
                </div>
                
                <div className="text-center mt-4">
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(''); setStep('phone'); setPhone(''); }} className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline">
                        {switchViewText}
                    </button>
                </div>
                
                {!isLoginView && (
                    <p className="text-xs text-center text-gray-500 px-4">{termsText}</p>
                )}
            </div>
        </div>
    );
};

export default Login;