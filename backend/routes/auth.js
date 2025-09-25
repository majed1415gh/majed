// routes/auth.js

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// POST: /api/auth/send-otp
// لإرسال رمز تحقق إلى هاتف المستخدم
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required.' });
    }

    const { error } = await supabase.auth.signInWithOtp({
        phone: phone, // يجب أن يكون الرقم بالصيغة الدولية، مثال: +966512345678
    });

    if (error) {
        console.error('❌ Error sending OTP:', error.message);
        return res.status(500).json({ message: 'Failed to send OTP.', details: error.message });
    }

    res.status(200).json({ message: 'OTP sent successfully.' });
});

// POST: /api/auth/verify-otp
// للتحقق من الرمز وتسجيل دخول المستخدم
router.post('/verify-otp', async (req, res) => {
    const { phone, token } = req.body;

    if (!phone || !token) {
        return res.status(400).json({ message: 'Phone number and OTP token are required.' });
    }

    const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: token,
        type: 'sms',
    });

    if (error) {
        console.error('❌ Error verifying OTP:', error.message);
        return res.status(400).json({ message: 'Invalid OTP.', details: error.message });
    }

    if (data.session) {
        res.status(200).json({ message: 'Login successful.', session: data.session, user: data.user });
    } else {
        res.status(400).json({ message: 'Login failed. Invalid OTP.' });
    }
});

module.exports = router;