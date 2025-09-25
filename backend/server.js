// server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- استيراد المسارات (Routes) ---
const companyProfileRoutes = require('./routes/companyProfile');
const competitionsRoutes = require('./routes/competitions');
const proposalsRoutes = require('./routes/proposals');
const { router: authRoutes, authenticateUser } = require('./routes/auth'); // <-- تحديث الاستيراد

// --- استيراد الخدمات (Services) ---
const { getBrowserInstance } = require('./services/browser');
const supabase = require('./config/supabaseClient'); 

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- استخدام المسارات ---
app.use('/api/auth', authRoutes); // <-- إضافة جديدة
app.use('/api/company-profile', authenticateUser, companyProfileRoutes);
app.use('/api/competitions', authenticateUser, competitionsRoutes);
app.use('/api/proposals', authenticateUser, proposalsRoutes);


// --- تشغيل الخادم ---
app.listen(PORT, () => {
    console.log(`🚀 Modular Server is now running on http://localhost:${PORT}`);
    
    if (supabase) {
        console.log('✅ Successfully connected to Supabase.');
    }
    
    getBrowserInstance();
});