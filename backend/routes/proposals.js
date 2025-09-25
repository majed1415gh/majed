const express = require('express');
const router = express.Router();
const multer = require('multer');
const cheerio = require('cheerio');
const supabase = require('../config/supabaseClient');

// إعداد Multer لتلقي الملفات في الذاكرة
const upload = multer({ storage: multer.memoryStorage() });

// --- Helper function to create prompt for Gemini API ---
const createPromptForStep = (stepKey, extractedText, competitionDetails) => {
    const {
        scopeOfWork, programOfWork, executionLocation, quantitiesTable,
        executionMethod, specialConditions
    } = extractedText;
    const { name, contractDuration, governmentEntity } = competitionDetails;

    const commonIntro = `بصفتك خبيرًا في كتابة العروض الفنية للمنافسات الحكومية السعودية، قم بكتابة محتوى احترافي ومقنع باللغة العربية. **الناتج يجب أن يكون بتنسيق HTML ومباشرًا بدون أي مقدمات أو ملاحظات.**`;

    const prompts = {
        'نطاق المشروع': `${commonIntro}
        اكتب قسم "نطاق المشروع" لمنافسة بعنوان "${name}" لصالح "${governmentEntity}". مدة العقد هي ${contractDuration}.
        استخدم المعلومات التالية من كراسة الشروط:
        - نطاق عمل المشروع: ${scopeOfWork}
        - برنامج العمل: ${programOfWork}
        ركز على أهداف المشروع، المخرجات المتوقعة، والفوائد التي ستحققها الجهة الحكومية.`,

        'منهجية تنفيذ الأعمال': `${commonIntro}
        اكتب قسم "منهجية تنفيذ الأعمال" لمنافسة بعنوان "${name}".
        استخدم المعلومات التالية من كراسة الشروط لوصف الخطوات والأساليب التي سيتم اتباعها:
        - كيفية تنفيذ الأعمال: ${executionMethod}
        - برنامج العمل: ${programOfWork}
        - الشروط الخاصة: ${specialConditions}
        اشرح المنهجية بشكل واضح ومنظم على شكل خطوات.`,

        'الجدول الزمني': `${commonIntro}
        اكتب قسم "الجدول الزمني" لمنافسة مدة تنفيذها هي ${contractDuration}.
        بناءً على منهجية العمل وبرنامج العمل التاليين:
        - منهجية العمل: ${programOfWork}
        - كيفية التنفيذ: ${executionMethod}
        قم بإنشاء جدول زمني مقترح على شكل قائمة HTML مرتبة (<ol>) توضح المراحل الرئيسية للمشروع والمدة الزمنية لكل مرحلة.`,

        'خطة إدارة المشروع': `${commonIntro}
        اكتب قسم "خطة إدارة المشروع" لمنافسة بعنوان "${name}".
        استخدم المعلومات التالية من كراسة الشروط:
        - نطاق العمل: ${scopeOfWork}
        - الشروط الخاصة: ${specialConditions}
        - جدول الكميات: ${quantitiesTable}
        يجب أن تغطي الخطة النقاط التالية: هيكل فريق العمل، آليات التواصل مع الجهة الحكومية، ومراقبة الجودة.`,

        'خطة إدارة المخاطر': `${commonIntro}
        اكتب قسم "خطة إدارة المخاطر" لمنافسة بعنوان "${name}".
        بناءً على نطاق العمل والشروط الخاصة التالية:
        - نطاق العمل: ${scopeOfWork}
        - الشروط الخاصة: ${specialConditions}
        حدد 3 مخاطر محتملة (مثل تأخير التوريد، مشاكل فنية) واقترح إجراءات وقائية وتصحيحية لكل منها. قدمها في قائمة HTML نقطية (<ul>).`
    };

    return prompts[stepKey] || `${commonIntro} اكتب محتوى عامًا عن "${stepKey}" لمنافسة بعنوان "${name}" مع الأخذ بالاعتبار أن نطاق العمل هو: ${scopeOfWork}.`;
};

// Endpoint لتحليل ملف HTML وتوليد المحتوى
router.post('/generate-from-html', upload.single('termsFile'), async (req, res) => {
    const { stepKey, competitionData } = req.body;
    const file = req.file;
    let competition;
    let htmlContent;

    try {
        competition = JSON.parse(competitionData);
        if (!stepKey || !competition) {
            return res.status(400).json({ message: 'stepKey and competitionData are required.' });
        }

        if (file) {
            console.log('ℹ️ Generating content from a newly uploaded file.');
            htmlContent = file.buffer.toString('utf-8');
        } else if (competition.terms_file_path) {
            console.log(`ℹ️ Generating content from existing file: ${competition.terms_file_path}`);
            const { data: fileData, error: downloadError } = await supabase.storage
                .from('attachments')
                .download(competition.terms_file_path);

            if (downloadError) {
                console.error('❌ Storage download error:', downloadError.message);
                throw new Error(`Could not download the terms file from storage. Path: ${competition.terms_file_path}`);
            }
            htmlContent = await fileData.text();
        } else {
            return res.status(400).json({ message: 'Terms file is required. Please upload one to generate content.' });
        }

        const $ = cheerio.load(htmlContent);

        const extractedText = {
            scopeOfWork: $('h5:contains("64 - نطاق عمل المشروع")').next('.col-12').text().trim(),
            programOfWork: $('h5:contains("65 - برنامج العمل")').next('.col-12').text().trim(),
            executionLocation: $('h5:contains("66 - مكان تنفيذ الأعمال")').next('.col-12').text().trim(),
            quantitiesTable: $('h5:contains("67 - جدول الكميات والأسعار")').next('.col-12').text().trim(),
            executionMethod: $('h5:contains("71 - كيفية تنفيذ الأعمال والخدمات")').next('.col-12').text().trim(),
            specialConditions: $('h4:contains("القسم العاشر : الشروط الخاصة")').next('.col-12').text().trim()
        };

        const prompt = createPromptForStep(stepKey, extractedText, competition);
        const apiKey = process.env.VITE_GEMINI_API_KEY;

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.text();
            throw new Error(`Gemini API request failed with status ${geminiResponse.status}: ${errorBody}`);
        }

        const result = await geminiResponse.json();
        let generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (generatedText) {
            generatedText = generatedText.replace(/```html/g, '').replace(/```/g, '').trim();
            res.status(200).json({ generatedText });
        } else {
            throw new Error("Invalid response structure from Gemini API.");
        }

    } catch (error) {
        console.error('❌ Error in generate-from-html:', error.message);
        res.status(500).json({ message: 'Failed to generate content from HTML file.', details: error.message });
    }
});

module.exports = router;