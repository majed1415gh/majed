const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient'); // استيراد Supabase

// POST (create or update) company profile data
router.post('/', async (req, res) => {
    const { about, mission, vision, services } = req.body;
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization?.replace('Bearer ', ''));
    if (userError || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const profilePayload = { about, mission, vision, services, updated_at: new Date() };

    try {
        const { data: existingProfile, error: fetchError } = await supabase
            .from('company_profile')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        let savedData, operationError;

        if (existingProfile) {
            console.log(`✅ Profile exists. Updating record with id: ${existingProfile.id}`);
            const { data, error } = await supabase
                .from('company_profile')
                .update(profilePayload)
                .eq('id', existingProfile.id)
                .eq('user_id', user.id)
                .select()
                .single();
            savedData = data;
            operationError = error;
        } else {
            console.log('ℹ️ No profile found. Creating a new record...');
            const { data, error } = await supabase
                .from('company_profile')
                .insert({ ...profilePayload, user_id: user.id })
                .select()
                .single();
            savedData = data;
            operationError = error;
        }

        if (operationError) {
            throw operationError;
        }

        console.log('✅ Company profile saved successfully.');
        res.status(200).json(savedData);
    } catch (error) {
        console.error('❌ Error saving company profile:', error.message);
        return res.status(500).json({ message: 'Failed to save profile.', details: error.message });
    }
});

// GET company profile data
router.get('/', async (req, res) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization?.replace('Bearer ', ''));
    if (userError || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { data, error } = await supabase
        .from('company_profile')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching company profile:', error.message);
        return res.status(500).json({ message: 'Failed to fetch profile.', details: error.message });
    }
    res.status(200).json(data);
});

// POST to generate content using Gemini API
router.post('/generate-content', async (req, res) => {
    const { stepKey, activity } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ message: "Server is missing API key for AI generation." });
    }

    const getPromptForStep = (key, act) => {
        const prompts = {
            about: `اكتب قسم "من نحن" لشركة نشاطها الأساسي هو "${act}". النص يجب أن يكون فقرة واحدة احترافية بتنسيق HTML داخل وسم <p>. **مهم جداً: قم بإرجاع محتوى وسم الـ p فقط، بدون أي نصوص تمهيدية، أو توضيحات، أو تنسيق markdown.**`,
            mission: `اكتب قسم "رسالتنا" لشركة نشاطها الأساسي هو "${act}". النص يجب أن يكون فقرة واحدة ملهمة ومختصرة بتنسيق HTML داخل وسم <p>. **مهم جداً: قم بإرجاع محتوى وسم الـ p فقط، بدون أي نصوص تمهيدية، أو توضيحات، أو تنسيق markdown.**`,
            vision: `اكتب قسم "رؤيتنا" لشركة نشاطها الأساسي هو "${act}". النص يجب أن يكون فقرة واحدة طموحة بتنسيق HTML داخل وسم <p>. **مهم جداً: قم بإرجاع محتوى وسم الـ p فقط، بدون أي نصوص تمهيدية، أو توضيحات، أو تنسيق markdown.**`,
            services: `اكتب 4 خدمات رئيسية لشركة نشاطها الأساسي هو "${act}". يجب أن يكون الناتج على شكل قائمة HTML نقطية. **مهم جداً: قم بإرجاع محتوى الوسم <ul> كاملاً بما فيه وسوم <li>، بدون أي نصوص تمهيدية、 أو عناوين、 أو توضيحات、 أو تنسيق markdown.**`
        };
        return prompts[key];
    };

    const prompt = getPromptForStep(stepKey, activity);
    if (!prompt) {
        return res.status(400).json({ message: "Invalid step key provided." });
    }

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) throw new Error(`API request failed with status ${apiResponse.status}`);

        const result = await apiResponse.json();
        let text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (text) {
            text = text.replace(/```html/g, '').replace(/```/g, '').trim();
            res.status(200).json({ text });
        } else {
            throw new Error("Invalid response structure from Gemini API.");
        }
    } catch (error) {
        console.error('❌ Error calling Gemini API from server:', error.message);
        res.status(500).json({ message: 'Failed to generate content.' });
    }
});

module.exports = router;