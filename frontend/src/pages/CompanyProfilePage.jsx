import React, { useState, useRef, useLayoutEffect } from 'react';
import { BookText, Eye, Target, Sparkles, CreditCard as Edit, Save, ArrowLeft, ArrowRight, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Check } from 'lucide-react';

// --- الأنماط المخصصة ---
const CustomStyles = () => (
    <style>{`
        .custom-editor[contenteditable]:empty::before {
            content: attr(data-placeholder);
            color: #94a3b8; /* slate-400 */
            pointer-events: none;
            display: block;
        }

        .custom-editor ul, .custom-editor ol {
            padding-right: 2rem;
        }
        .custom-editor ul {
            list-style: disc inside;
        }
        .custom-editor ol {
            list-style: decimal inside;
        }

        .fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .slide-in { animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    `}</style>
);

// --- مكون النافذة المنبثقة للذكاء الاصطناعي ---
const AiModal = ({ isOpen, onClose, onGenerate, activity, setActivity, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 fade-in">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-teal-100 rounded-full">
                         <Sparkles className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">توليد المحتوى بالذكاء الاصطناعي</h3>
                </div>
                <p className="text-slate-600 mb-5">اكتب اسم شركتك ونشاطها الأساسي لتوليد محتوى دقيق.</p>
                <input
                    type="text"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="مثال: شركة البناء الحديث للمقاولات العامة"
                    className="w-full p-3 border border-slate-300 rounded-lg mb-6 focus:ring-1 focus:ring-teal-500 outline-none transition"
                    dir="rtl"
                />
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} disabled={isLoading} className="py-2.5 px-5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition disabled:opacity-50">
                        إلغاء
                    </button>
                    <button onClick={onGenerate} disabled={isLoading || !activity.trim()} className="py-2.5 px-5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'توليد'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- مكون محرر النصوص المخصص ---
const SimpleRichTextEditor = ({ value, onChange, placeholder }) => {
    const editorRef = useRef(null);

    const handleContentChange = () => {
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    };
    
    useLayoutEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const execCmd = (command) => {
        document.execCommand(command, false, null);
        editorRef.current.focus();
        handleContentChange();
    };

    const ToolbarButton = ({ command, icon: Icon, title }) => (
        <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); execCmd(command); }} className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors">
            <Icon size={18} />
        </button>
    );

    return (
        <div className="border border-slate-300 rounded-lg shadow-sm focus-within:ring-1 focus-within:ring-teal-500 transition-all">
            <div className="flex flex-row-reverse items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
                <ToolbarButton command="bold" icon={Bold} title="عريض" />
                <ToolbarButton command="italic" icon={Italic} title="مائل" />
                <ToolbarButton command="underline" icon={Underline} title="تسطير" />
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <ToolbarButton command="insertUnorderedList" icon={List} title="قائمة نقطية" />
                <ToolbarButton command="insertOrderedList" icon={ListOrdered} title="قائمة رقمية" />
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <ToolbarButton command="justifyRight" icon={AlignRight} title="محاذاة لليمين" />
                <ToolbarButton command="justifyCenter" icon={AlignCenter} title="توسيط" />
                <ToolbarButton command="justifyLeft" icon={AlignLeft} title="محاذاة لليسار" />
            </div>
            <div ref={editorRef} contentEditable={true} onInput={handleContentChange} className="custom-editor w-full p-4 min-h-[250px] outline-none text-right leading-relaxed" data-placeholder={placeholder}></div>
        </div>
    );
};


// --- مكون بطاقة المعلومات ---
const InfoCard = ({ icon: Icon, title, content }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-start h-full transition-shadow hover:shadow-lg">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        <div className="text-slate-600 text-base leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
);


// --- المكون الرئيسي للصفحة ---
const CompanyProfilePage = ({ initialProfileData, onSaveProfile }) => {
    
    const isHtmlEmpty = (html) => {
        if (!html) return true;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent.trim().length === 0;
    };

    const [isEditing, setIsEditing] = useState(() => !initialProfileData || isHtmlEmpty(initialProfileData.about));
    
    const [profileData, setProfileData] = useState(
        initialProfileData || {
            about: '',
            vision: '',
            mission: '',
            services: ''
        }
    );
    const [currentStep, setCurrentStep] = useState(1);
    
    const [companyActivity, setCompanyActivity] = useState('');
    const [tempActivity, setTempActivity] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingFor, setGeneratingFor] = useState(null);

    const steps = [
        { id: 1, name: 'من نحن', key: 'about', icon: BookText, placeholder: 'اكتب هنا نبذة تعريفية عن شركتك...' },
        { id: 2, name: 'الرسالة', key: 'mission', icon: Target, placeholder: 'وضح هنا رسالة الشركة وأهدافها الأساسية...' },
        { id: 3, name: 'الرؤية', key: 'vision', icon: Eye, placeholder: 'صف هنا الرؤية المستقبلية والطموحات الكبرى للشركة...' },
        { id: 4, name: 'خدماتنا', key: 'services', icon: Sparkles, placeholder: 'اذكر أهم الخدمات أو المنتجات التي تقدمونها...' }
    ];

    const handleEditorChange = (key, content) => {
        setProfileData(prev => ({ ...prev, [key]: content }));
    };

    const handleNext = () => currentStep < steps.length && setCurrentStep(currentStep + 1);
    const handlePrev = () => currentStep > 1 && setCurrentStep(currentStep - 1);

    const handleSave = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/company-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });
            if (!response.ok) throw new Error('Failed to save profile.');
            const savedData = await response.json();
            onSaveProfile(savedData); // استدعاء الدالة من الأب لتحديث الحالة العامة
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving profile:", error);
        }
    };
    
    const generateContentForStep = async (stepKey, activity) => {
        setIsGenerating(true);
        setGeneratingFor(stepKey);
        try {
            const response = await fetch('http://localhost:3001/api/company-profile/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stepKey, activity }),
            });
            if (!response.ok) throw new Error('API request failed');
            const result = await response.json();
            if (result.text) {
                handleEditorChange(stepKey, result.text);
            } else {
                throw new Error("Invalid response structure from server.");
            }
        } catch (error) {
            console.error('Error calling generation API:', error);
        } finally {
            setIsGenerating(false);
            setGeneratingFor(null);
        }
    };

    const handleAiClick = () => {
        if (!companyActivity) {
            setTempActivity('');
            setIsModalOpen(true);
        } else {
            generateContentForStep(currentStepData.key, companyActivity);
        }
    };

    const handleModalGenerate = () => {
        if (!tempActivity.trim()) return;
        setCompanyActivity(tempActivity);
        setIsModalOpen(false);
        generateContentForStep(currentStepData.key, tempActivity);
    };

    const currentStepData = steps[currentStep - 1];

    if (!isEditing) {
        return (
             <div className="space-y-8 fade-in max-w-5xl mx-auto">
                 <div className="flex justify-between items-center pb-4 border-b-2 border-teal-500">
                    <h2 className="text-3xl font-bold text-slate-800">الملف التعريفي للشركة</h2>
                    <button onClick={() => setIsEditing(true)} className="py-2.5 px-6 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                        <Edit size={18}/> تعديل البيانات
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2"><InfoCard icon={BookText} title="من نحن" content={profileData.about} /></div>
                    {!isHtmlEmpty(profileData.mission) && <InfoCard icon={Target} title="رسالتنا" content={profileData.mission} />}
                    {!isHtmlEmpty(profileData.vision) && <InfoCard icon={Eye} title="رؤيتنا" content={profileData.vision} />}
                    {!isHtmlEmpty(profileData.services) && <div className="md:col-span-2"><InfoCard icon={Sparkles} title="خدماتنا المقدمة" content={profileData.services} /></div>}
                </div>
            </div>
        );
    }
    
    return (
        <>
            <CustomStyles />
            <AiModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onGenerate={handleModalGenerate}
                activity={tempActivity}
                setActivity={setTempActivity}
                isLoading={isGenerating && generatingFor === currentStepData.key}
            />
            <div className="space-y-6 fade-in max-w-4xl mx-auto">
                 <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-800">إعداد الملف التعريفي</h2>
                    <p className="text-slate-500 mt-2">اتبع الخطوات التالية لإكمال ملف شركتك التعريفي</p>
                 </div>
                 <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-lg">
                    <div className="mb-12">
                        <div className="flex justify-between items-center relative text-center mx-auto max-w-2xl">
                             <div className="absolute top-5 right-10 left-10 h-1 bg-slate-200 rounded-full">
                                <div 
                                    className="absolute right-0 h-full bg-teal-500 transition-all duration-500 rounded-full" 
                                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                                ></div>
                            </div>
                            {steps.map(step => (
                                <div key={step.id} className="z-10 flex flex-col items-center w-20">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                        currentStep >= step.id 
                                            ? 'bg-teal-500 border-teal-500 text-white'
                                            : 'bg-white border-slate-300'
                                    }`}>
                                        {currentStep > step.id ? <Check size={20} strokeWidth={3} /> : <step.icon size={18} className={currentStep >= step.id ? 'text-white' : 'text-slate-400'} />}
                                    </div>
                                    <span className={`mt-3 text-sm font-medium ${currentStep >= step.id ? 'text-teal-600' : 'text-slate-500'}`}>{step.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div key={currentStep} className="min-h-[350px] slide-in">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex justify-start items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                                     <currentStepData.icon className="w-5 h-5 text-slate-600" />
                                 </div>
                                <h3 className="text-xl font-bold text-slate-800">{currentStepData.name}</h3>
                            </div>
                            <button onClick={handleAiClick} disabled={isGenerating} className="py-2 px-4 bg-teal-50 text-teal-600 rounded-lg font-medium hover:bg-teal-100 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-wait">
                                {isGenerating && generatingFor === currentStepData.key ? (
                                    <>
                                       <svg className="animate-spin h-5 w-5 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                       </svg>
                                        <span>جاري التوليد...</span>
                                    </>
                                ) : ( <> <Sparkles size={16} /> <span>توليد بالذكاء الاصطناعي</span> </> )}
                            </button>
                        </div>
                        <SimpleRichTextEditor value={profileData[currentStepData.key]} onChange={(content) => handleEditorChange(currentStepData.key, content)} placeholder={currentStepData.placeholder}/>
                    </div>
                    
                    <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-8">
                        <button onClick={handlePrev} disabled={currentStep === 1} className="py-3 px-8 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 transition-colors">
                            <ArrowRight size={18} /> السابق 
                        </button>
                        {currentStep === steps.length ? (
                             <button 
                                onClick={handleSave} 
                                disabled={isHtmlEmpty(profileData.about)}
                                className="py-3 px-8 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2.5 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={18} /> حفظ وإنهاء
                             </button>
                        ) : (
                            <button onClick={handleNext} className="py-3 px-8 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2.5 transition-all shadow-md">
                                 التالي <ArrowLeft size={18} />
                            </button>
                        )}
                    </div>
                 </div>
            </div>
        </>
    );
};

export default CompanyProfilePage;