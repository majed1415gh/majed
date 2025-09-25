const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const supabase = require('../config/supabaseClient');
const { getBrowserInstance } = require('../services/browser');

// --- Middleware لرفع الملفات ---
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// GET: /api/competitions -> للحصول على جميع المناقصات
router.get('/', async (req, res) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization?.replace('Bearer ', ''));
    if (userError || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('user_id', user.id)
        .order('dateAdded', { ascending: false });
        
    if (error) {
        console.error('❌ Error fetching competitions:', error.message);
        return res.status(500).json({ message: 'Failed to fetch data from Supabase.', details: error.message });
    }
    res.status(200).json(data);
});

// GET: /api/competitions/scraped -> للحصول على المناقصات المسحوبة
router.get('/scraped', async (req, res) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization?.replace('Bearer ', ''));
    if (userError || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { data, error } = await supabase
        .from('scraped_competitions')
        .select('*')
        .eq('user_id', user.id)
        .order('scraped_at', { ascending: false });
        
    if (error) {
        console.error('❌ Error fetching scraped competitions:', error.message);
        return res.status(500).json({ message: 'Failed to fetch scraped competitions.', details: error.message });
    }
    res.status(200).json(data);
});

// POST: /api/competitions/search -> للبحث عن مناقصة
router.post('/search', async (req, res) => {
    const { searchInput } = req.body;
    if (!searchInput) {
        return res.status(400).json({ message: 'Please provide a reference number or a competition URL.' });
    }

    try {
        console.log(`🔍 Searching for competition: ${searchInput}`);
        const referenceNumber = searchInput.startsWith('https://') ? extractReferenceFromUrl(searchInput) : searchInput;
        if (!referenceNumber) throw new Error('Could not extract reference number from input.');
        
        const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization?.replace('Bearer ', ''));
        if (userError || !user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { data: existingMainComp, error: mainCheckError } = await supabase
            .from('competitions')
            .select('*')
            .eq('referenceNumber', referenceNumber)
            .eq('user_id', user.id)
            .maybeSingle();
        if (mainCheckError) throw mainCheckError;
        
        if (existingMainComp) {
            console.log('✅ Found in main table.');
            existingMainComp.source = 'existing';
            existingMainComp.message = 'المنافسة موجودة بالفعل في قاعدة البيانات';
            return res.status(200).json(existingMainComp);
        }

        const { data: scrapedComp, error: scrapedError } = await supabase
            .from('scraped_competitions')
            .select('*')
            .eq('reference_number', referenceNumber)
            .eq('user_id', user.id)
            .maybeSingle();
        if (scrapedError) throw scrapedError;

        if (scrapedComp) {
            console.log('✅ Found in scraped table.');
            const formattedComp = {
                id: scrapedComp.id, name: scrapedComp.name, referenceNumber: scrapedComp.reference_number, brochureCost: scrapedComp.brochure_cost,
                competitionType: scrapedComp.competition_type, contractDuration: scrapedComp.contract_duration, governmentEntity: scrapedComp.government_entity,
                etimadStatus: scrapedComp.etimad_status, submissionMethod: scrapedComp.submission_method, deadline: scrapedComp.deadline,
                competitionUrl: scrapedComp.competition_url, competitionPurpose: scrapedComp.competition_purpose, guaranteeRequired: scrapedComp.guarantee_required,
                awardedSupplier: scrapedComp.awarded_supplier, awardAmount: scrapedComp.award_amount, source: 'scraped_preview',
                message: 'البيانات متاحة للعرض - اضغط حفظ لإضافتها لقاعدة البيانات', lastUpdated: scrapedComp.scraped_at
            };
            return res.status(200).json(formattedComp);
        }

        console.log('🕷️ Scraping live from Etimad...');
        const scrapedData = await scrapeCompetitionData(searchInput);
        if (!scrapedData.referenceNumber) throw new Error("Could not scrape the reference number. The competition might not exist.");

        scrapedData.source = 'newly_scraped_preview';
        scrapedData.message = 'تم سحب البيانات بنجاح - اضغط حفظ لإضافتها لقاعدة البيانات';
        res.status(200).json(scrapedData);

    } catch (error) {
        console.error("❌ Error in search-competition:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// POST: /api/competitions -> لحفظ أو تحديث مناقصة
router.post('/', async (req, res) => {
    const { id, ...compData } = req.body;
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization?.replace('Bearer ', ''));
    if (userError || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    for (const key in compData) {
        if (compData[key] === '' || compData[key] === undefined) {
            compData[key] = null;
        }
    }

    if (id) {
        const { data, error } = await supabase
            .from('competitions')
            .update(compData)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();
        if (error) return res.status(500).json({ message: 'Failed to update competition.', details: error.message });
        res.status(200).json({ message: 'Competition updated successfully', competition: data });
    } else {
        const { data, error } = await supabase
            .from('competitions')
            .insert({ ...compData, user_id: user.id })
            .select()
            .single();
        if (error) return res.status(500).json({ message: 'Failed to add competition.', details: error.message });
        res.status(201).json({ message: 'Competition added successfully', competition: data });
    }
});

// DELETE: /api/competitions/:id -> لحذف مناقصة
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization?.replace('Bearer ', ''));
    if (userError || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { error } = await supabase
        .from('competitions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
    if (error) return res.status(500).json({ message: 'Failed to delete competition.' });
    res.status(200).json({ message: 'Competition deleted successfully.' });
});

// --- Attachments APIs ---
router.post('/:competitionId/attachments', upload.single('file'), async (req, res) => {
    const { competitionId } = req.params;
    const { file_type, original_name } = req.body;
    const file = req.file;
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization?.replace('Bearer ', ''));
    if (userError || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!file) return res.status(400).send({ message: 'No file uploaded.' });

    const displayName = original_name || file.originalname;
    const filePath = `${competitionId}/${Date.now()}${path.extname(displayName)}`;

    const { data: uploadData, error: uploadError } = await supabase.storage.from('attachments').upload(filePath, file.buffer, { contentType: file.mimetype });
    if (uploadError) return res.status(500).json({ message: 'Failed to upload file to storage.', details: uploadError.message });

    const { data: dbData, error: dbError } = await supabase.from('attachments').insert({
        competition_id: competitionId, 
        file_name: displayName, 
        file_path: uploadData.path, 
        file_type: file_type || 'attachment',
        user_id: user.id
    }).select().single();

    if (dbError) return res.status(500).json({ message: 'Failed to save attachment info.', details: dbError.message });
    res.status(201).json({ message: 'File uploaded successfully.', attachment: dbData });
});

router.get('/:competitionId/attachments', async (req, res) => {
    const { competitionId } = req.params;
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization?.replace('Bearer ', ''));
    if (userError || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('competition_id', competitionId)
        .eq('user_id', user.id);
    if (error) return res.status(500).json({ message: 'Failed to fetch attachments.' });
    res.status(200).json(data);
});

// --- NEW ENDPOINT for Terms File ---
router.post('/:competitionId/upload-terms', upload.single('termsFile'), async (req, res) => {
    const { competitionId } = req.params;
    const file = req.file;
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization?.replace('Bearer ', ''));
    if (userError || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const filePath = `${competitionId}/terms-and-conditions-${Date.now()}.html`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file.buffer, {
            contentType: 'text/html',
            upsert: true
        });

    if (uploadError) {
        console.error('❌ Storage upload error:', uploadError.message);
        return res.status(500).json({ message: 'Failed to upload terms file to storage.', details: uploadError.message });
    }

    const { data: dbData, error: dbError } = await supabase
        .from('competitions')
        .update({ terms_file_path: uploadData.path })
        .eq('id', competitionId)
        .eq('user_id', user.id)
        .select()
        .single();

    if (dbError) {
        console.error('❌ DB update error:', dbError.message);
        await supabase.storage.from('attachments').remove([uploadData.path]);
        return res.status(500).json({ message: 'Failed to save file path to competition record.', details: dbError.message });
    }

    console.log(`✅ Successfully uploaded terms file for competition ${competitionId} at path: ${uploadData.path}`);
    res.status(200).json({
        message: 'Terms file uploaded and linked successfully.',
        competition: dbData
    });
});

//--- Helper Functions ---
function extractReferenceFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const tenderId = urlObj.searchParams.get('TenderID');
        return tenderId;
    } catch (error) {
        console.error('Error extracting reference from URL:', error);
        return null;
    }
}
async function scrapeCompetitionData(input) {
    const browser = await getBrowserInstance();
    let page = null;
    console.log(`1. [New Request] Opening new page for input: ${input}`);

    try {
        page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        const isUrl = input && input.startsWith('https://tenders.etimad.sa');
        let competitionUrl = '';
        let deadlineFromSearch = null;
        let ref = isUrl ? null : input;

        if (isUrl) {
            console.log(`2. URL detected, navigating directly...`);
            competitionUrl = input;
            await page.goto(competitionUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        } else {
            const tendersUrl = 'https://tenders.etimad.sa/Tender/AllTendersForVisitor';
            console.log(`2. No URL detected, searching by reference number: ${ref}`);
            await page.goto(tendersUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            
            await page.waitForSelector('#searchBtnColaps', { visible: true });
            await page.click('#searchBtnColaps');
            
            await page.waitForSelector('a[href="#dates"]', { visible: true });
            await page.evaluate(selector => document.querySelector(selector).click(), 'a[href="#dates"]');
            
            console.log("3. Setting publication date filter to 'Any time'...");
            await page.waitForSelector('#PublishDateId', { visible: true });
            await page.select('#PublishDateId', '1');
            console.log("   ✅ Filter set successfully.");

            await page.waitForSelector('#txtReferenceNumber', { visible: true });
            await page.type('#txtReferenceNumber', ref);

            await page.waitForSelector('#searchBtn', { visible: true });
            await page.click('#searchBtn');
            
            console.log(`4. Searching for the card with reference number: ${ref}`);
            
            const specificCardXPath = `//div[contains(@class, 'tender-card') and .//text()[contains(., '${ref}')]]`;
            
            try {
                await page.waitForSelector(`xpath/${specificCardXPath}`, { timeout: 10000 });
            } catch (e) {
                 throw new Error(`Competition with reference number ${ref} not found on the page.`);
            }
           
            console.log("5. Specific card found. Proceeding to scrape from it.");
            
            const cardHandle = await page.evaluateHandle((xpath) => {
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                return result.singleNodeValue;
            }, specificCardXPath);

            if (!cardHandle.asElement()) {
                throw new Error(`Could not get a handle for the card with reference number ${ref}.`);
            }

            console.log("6. Scraping deadline from the correct card...");
            deadlineFromSearch = await cardHandle.evaluate((card) => {
                const allElements = Array.from(card.querySelectorAll('span, p, div, li'));
                const deadlineLabelElement = allElements.find(el => el.innerText && el.innerText.trim().includes('آخر موعد لتقديم العروض'));
                
                if (deadlineLabelElement) {
                    const parentText = deadlineLabelElement.parentElement.innerText;
                    const regex = /آخر موعد لتقديم العروض\s*(\d{4}-\d{2}-\d{2})\s*(\d{2}:\d{2})/;
                    const match = parentText.match(regex);
                    
                    if (match && match[1] && match[2]) {
                        return `${match[1]} ${match[2]}`;
                    }
                }
                return null;
            });
            console.log(`7. Deadline found: ${deadlineFromSearch}`);

            const detailsLinkHandle = await cardHandle.asElement().$('a[href*="DetailsForVisitor"]');
             if (!detailsLinkHandle) {
                throw new Error("Could not find details link in the correct competition card.");
            }
            
            competitionUrl = await detailsLinkHandle.evaluate(a => a.href);

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
                detailsLinkHandle.click()
            ]);
        }
        
        console.log("8. Details page is ready for scraping.");
        const detailsHeaderXPath = "//h2[contains(., 'تفاصيل المنافسة')]";
        await page.waitForSelector(`xpath/${detailsHeaderXPath}`, { timeout: 20000 });

        console.log("9. Scraping basic data from details page...");
        const competitionData = await page.evaluate(() => {
            const data = {};
            const headingsMap = { 
                "اسم المنافسة": "name", "الرقم المرجعي": "referenceNumber", "قيمة وثائق المنافسة": "brochureCost", 
                "نوع المنافسة": "competitionType", "مدة العقد": "contractDuration", "الجهة الحكوميه": "governmentEntity", 
                "حالة المنافسة": "etimadStatus", "طريقة تقديم العروض": "submissionMethod", "آخر موعد لتقديم العروض": "deadline_details",
                "الغرض من المنافسة": "competition_purpose", "مطلوب ضمان الإبتدائي": "guarantee_required"
            };
            
            const findDataByLabel = (labelText) => {
                const labels = Array.from(document.querySelectorAll('.etd-item-title, .label, h3, span, p'));
                const targetLabel = labels.find(el => el.innerText && el.innerText.trim().includes(labelText));
                if (targetLabel && targetLabel.nextElementSibling) {
                    let valueElement = targetLabel.nextElementSibling;
                    if (valueElement && valueElement.innerText.trim()) return valueElement.innerText.trim();
                } else if (targetLabel) {
                    let parent = targetLabel.parentElement;
                     if (parent && parent.innerText.includes(labelText)) return parent.innerText.replace(labelText, '').trim();
                }
                return null;
            };
            
            for (const [arabicLabel, englishKey] of Object.entries(headingsMap)) {
                data[englishKey] = findDataByLabel(arabicLabel);
            }
            
            if (!data.name) data.name = document.querySelector('h2')?.innerText.trim() || null;
            if (data.brochureCost) {
                data.brochureCost = parseFloat(data.brochureCost.replace(/[^0-9.]/g, '')) || 0;
            }
            return data;
        });

        console.log("10. Attempting to scrape award results...");
        let awardData = { awardedSupplier: null, awardAmount: null };
        
        try {
            const awardingTabSelector = '#awardingStepTab';
            const awardingTabExists = await page.$(awardingTabSelector);
            
            if (awardingTabExists) {
                console.log("11. Found awarding tab, clicking...");
                await page.click(awardingTabSelector);
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const awardTableData = await page.evaluate(() => {
                    const data = { awardedSupplier: null, awardAmount: null };
                    const awardHeader = Array.from(document.querySelectorAll('h4')).find(h => 
                        h.innerText && h.innerText.includes('قائمة الموردين المرسى عليهم')
                    );
                    
                    if (awardHeader) {
                        let currentElement = awardHeader.nextElementSibling;
                        while (currentElement) {
                            if (currentElement.tagName === 'TABLE') {
                                const firstRow = currentElement.querySelector('tbody tr');
                                if (firstRow) {
                                    const cells = firstRow.querySelectorAll('td');
                                    if (cells.length >= 3) {
                                        data.awardedSupplier = cells[0].innerText.trim();
                                        const awardAmountText = cells[2].innerText.trim();
                                        const awardAmountMatch = awardAmountText.match(/[\d.,]+/);
                                        if (awardAmountMatch) {
                                            data.awardAmount = parseFloat(awardAmountMatch[0].replace(/,/g, '')) || null;
                                        }
                                    }
                                }
                                break;
                            }
                            currentElement = currentElement.nextElementSibling;
                        }
                    } else if (document.body.innerText.includes('لم يتم اعلان نتائج الترسية بعد')) {
                        data.awardedSupplier = 'لم يتم اعلان نتائج الترسية بعد';
                    }
                    return data;
                });
                awardData = awardTableData;
                console.log(`12. Award data scraped: Supplier: ${awardData.awardedSupplier}, Amount: ${awardData.awardAmount}`);
            } else {
                console.log("11. Awarding tab not found, setting default values...");
                awardData = { awardedSupplier: 'غير متاح', awardAmount: null };
            }
        } catch (error) {
            console.error('Error scraping award data:', error.message);
            awardData = { awardedSupplier: 'خطأ في جلب البيانات', awardAmount: null };
        }

        competitionData.deadline = deadlineFromSearch;
        competitionData.awarded_supplier = awardData.awardedSupplier;
        competitionData.award_amount = awardData.awardAmount;

        if (!competitionData.deadline && competitionData.deadline_details) {
            console.log("Using deadline from details page as a fallback.");
            const match = competitionData.deadline_details.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
            if (match) {
                const date = new Date(match[3], match[2] - 1, match[1], match[4], match[5]);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                competitionData.deadline = `${year}-${month}-${day} ${hours}:${minutes}`;
            }
        }
        delete competitionData.deadline_details;
        
        competitionData.competitionUrl = competitionUrl;
        console.log("13. All data scraped successfully!", competitionData);
        return competitionData;

    } catch (error) {
        console.error(`Error during scraping process: ${error.message}`);
        throw new Error(error.message);
    } finally {
        if (page) {
            await page.close();
            console.log("14. Page closed, browser remains open for new requests.");
        }
    }
}


module.exports = router;