import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowRight, Plus, X, Check, CheckCircle, ChevronLeft, ChevronRight, GripVertical, Trash2, FileText, FileSignature, Banknote, Building, Target, Settings, Calendar, FileCheck2, Shield, Award, Users, Calculator, CreditCard, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, ArrowUp, Sparkles, UploadCloud, Loader2, Save } from 'lucide-react';

// =====================================================================================
// Component: CustomStyles (لإضافة الأنماط المخصصة للمحرر والواجهة)
// =====================================================================================
const CustomStyles = () => (
    <style>{`
        .custom-editor[contenteditable]:empty::before {
            content: attr(data-placeholder);
            color: #94a3b8;
            pointer-events: none;
            display: block;
        }
        .custom-editor ul, .custom-editor ol { padding-right: 2rem; }
        .custom-editor ul { list-style: disc inside; }
        .custom-editor ol { list-style: decimal inside; }
        .form-input{width:100%;padding:.5rem .75rem;font-size:.875rem;border:1px solid #cbd5e1;border-radius:.375rem;box-shadow:0 1px 2px 0 rgba(0,0,0,.05);outline:none;transition:all .2s ease-in-out;background-color: white;}
        .form-input:focus{--tw-ring-color:#14b8a6;--tw-border-color:#14b8a6;box-shadow:0 0 0 1px var(--tw-border-color);border-color:var(--tw-border-color)}
        .animate-fade-in-up{animation:fadeInUp .5s ease-out forwards}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    `}</style>
);

// =====================================================================================
// Component: AiModal (لرفع ملف كراسة الشروط بتصميم جديد)
// =====================================================================================
const AiModal = ({ isOpen, onClose, onGenerate, isLoading }) => {
    const [file, setFile] = useState(null);

    const onDrop = React.useCallback(acceptedFiles => {
        if (acceptedFiles && acceptedFiles.length > 0) setFile(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/html': ['.html', '.htm'] },
        multiple: false
    });
    
    useEffect(() => {
        if (!isOpen) setFile(null);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-teal-100 rounded-full">
                        <Sparkles className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">توليد المحتوى من كراسة الشروط</h3>
                </div>
                <p className="text-slate-600 mb-5">
                    قم بتحميل ملف كراسة الشروط والمواصفات (HTML)، ليقوم الذكاء الاصطناعي بتحليله وتوليد محتوى مخصص لهذا القسم.
                </p>
                <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400'}`}>
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center">
                        <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
                        {file ? (
                            <div className="flex items-center gap-2 text-green-600 font-medium"><FileText size={20} /><span>{file.name}</span></div>
                        ) : (
                            <p className="text-slate-500">{isDragActive ? 'أفلت الملف هنا...' : 'اسحب وأفلت الملف أو انقر للاختيار'}</p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} disabled={isLoading} className="py-2.5 px-5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition disabled:opacity-50">إلغاء</button>
                    <button onClick={() => file && onGenerate(file)} disabled={isLoading || !file} className="py-2.5 px-5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : null}
                        <span>{isLoading ? 'جاري التحليل...' : 'توليد المحتوى'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// =====================================================================================
// Component: RichTextEditor (محرر النصوص المطور مع خيارات محاذاة)
// =====================================================================================
const RichTextEditor = ({ value, onChange, placeholder }) => {
    const editorRef = useRef(null);
    useLayoutEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
    }, [value]);

    const execCmd = (command) => {
        document.execCommand(command, false, null);
        editorRef.current.focus();
        onChange(editorRef.current.innerHTML);
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
            <div
                ref={editorRef}
                contentEditable={true}
                onInput={() => onChange(editorRef.current.innerHTML)}
                className="custom-editor w-full p-4 min-h-[300px] h-auto overflow-y-auto outline-none text-right leading-relaxed"
                dangerouslySetInnerHTML={{ __html: value || '' }}
                data-placeholder={placeholder}
            ></div>
        </div>
    );
};

// =====================================================================================
// Component: TocListItem (عنصر في جدول المحتويات مع تحسين تجربة المستخدم)
// =====================================================================================
const TocListItem = ({ item, index, type, updateTocItemTitle, removeTocItem, dragHandlers, dragItem }) => {
    return (
        <div
            draggable="true"
            {...dragHandlers}
            className={`group bg-white rounded-lg flex items-center gap-3 p-2 transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105 cursor-move ${dragItem.current?.position === index && dragItem.current?.type === type ? 'opacity-40' : 'opacity-100'}`}
        >
            <GripVertical className="h-5 w-5 text-slate-400 cursor-grab flex-shrink-0" />
            <span className="font-bold text-teal-600 text-lg w-6 text-center">{String(index + 1).padStart(2, '0')}</span>
            <input
                type="text"
                value={item.title}
                onChange={(e) => updateTocItemTitle(type, item.id, e.target.value)}
                placeholder="عنوان القسم"
                className="form-input flex-grow p-1 text-slate-700 font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
            <button
                onClick={() => removeTocItem(type, item.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
};

// =====================================================================================
// Component: TocColumn (عمود مخصص لمحتويات العرض الفني أو المالي)
// =====================================================================================
const TocColumn = ({ type, title, items, icon: Icon, addTocItem, updateTocItemTitle, removeTocItem, dragItem, dragHandlers }) => (
    <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-300/10 overflow-hidden">
        <div className="p-4 bg-[#fcfcfc] text-center flex justify-center items-center gap-3">
            <Icon className="h-6 w-6 text-teal-600" />
            <h3 className="text-xl font-bold text-slate-700">{title}</h3>
        </div>
        <div className="p-4">
            <div className="space-y-2">
                {items.map((item, index) => (
                    <TocListItem 
                        key={item.id} 
                        item={item} 
                        index={index} 
                        type={type} 
                        updateTocItemTitle={updateTocItemTitle} 
                        removeTocItem={removeTocItem} 
                        dragItem={dragItem} 
                        dragHandlers={{ 
                            onDragStart: (e) => dragHandlers.handleDragStart(e, index, type), 
                            onDragEnter: (e) => dragHandlers.handleDragEnter(e, index), 
                            onDragEnd: () => dragHandlers.handleDrop(type), 
                            onDragOver: (e) => e.preventDefault(), 
                        }} 
                    />
                ))}
            </div>
            <div className="flex justify-center mt-4">
                <button 
                    onClick={() => addTocItem(type)} 
                    className="h-10 w-10 flex items-center justify-center bg-slate-200/70 text-slate-500 rounded-full hover:bg-teal-500 hover:text-white hover:scale-110 transition-all duration-200" 
                    title="إضافة بند جديد">
                    <Plus className="h-5 w-5" />
                </button>
            </div>
        </div>
    </div>
);


// =====================================================================================
// Component: ProposalWizard (المكون الرئيسي بالتصميم المحدث)
// =====================================================================================
const ProposalWizard = ({ competition, onBack }) => {
    // --- STATE MANAGEMENT ---
    const [wizardState, setWizardState] = useState({ phase: 'toc', step: 1 });
    const [proposal, setProposal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);
    
    const initialToc = {
        technical: [
            { id: 't1', title: 'من نحن ؟', icon: Building },
            { id: 't2', title: 'نطاق المشروع', icon: Target },
            { id: 't3', title: 'منهجية تنفيذ الأعمال', icon: Settings },
            { id: 't4', title: 'الجدول الزمني', icon: Calendar },
            { id: 't5', title: 'خطة إدارة المشروع', icon: FileCheck2 },
            { id: 't6', title: 'خطة إدارة المخاطر', icon: Shield },
            { id: 't7', title: 'الخبرات السابقة', icon: Award },
            { id: 't8', title: 'فريق العمل', icon: Users },
        ],
        financial: [
            { id: 'f1', title: 'خطاب عرض السعر', icon: FileText },
            { id: 'f2', title: 'جدول الأسعار', icon: Calculator },
            { id: 'f3', title: 'جدول الدفعات', icon: CreditCard },
        ],
    };

    // --- DATA FETCHING & SAVING ---
    useEffect(() => {
        const loadProposal = async () => {
            setIsLoading(true);
            try {
                await new Promise(res => setTimeout(res, 500)); 
                setProposal({ content: {}, ...initialToc });
            } catch (error) {
                console.error("Failed to load proposal:", error);
                setProposal({ content: {}, ...initialToc });
            } finally {
                setIsLoading(false);
            }
        };
        loadProposal();
    }, [competition.id]);

    const saveProposal = async () => {
        setIsSaving(true);
        try {
            await new Promise(res => setTimeout(res, 1000));
            alert("تم حفظ التقدم بنجاح!");
        } catch (error) {
            console.error("Failed to save proposal:", error);
            alert("فشل حفظ التقدم.");
        } finally {
            setIsSaving(false);
        }
    };
    
    // --- GENERAL HANDLERS ---
    const updateProposal = (key, value) => setProposal(prev => ({ ...prev, [key]: value }));

    const handleAiGenerate = async (termsFile = null) => {
        setIsGenerating(true);
        if (isModalOpen) setIsModalOpen(false);

        const currentTocItem = proposal.technical[wizardState.step - 1];
        if (!currentTocItem) {
            setIsGenerating(false);
            return;
        }

        try {
            const formData = new FormData();
            if (termsFile) {
                formData.append('termsFile', termsFile);
            }
            formData.append('stepKey', currentTocItem.title);
            formData.append('competitionData', JSON.stringify(competition));

            const response = await fetch('http://localhost:3001/api/proposals/generate-from-html', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'فشل توليد المحتوى');
            updateProposal('content', { ...proposal.content, [currentTocItem.id]: result.generatedText });

        } catch (error) {
            alert(`فشلت عملية التوليد: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const triggerAiGeneration = () => {
        if (competition.terms_file_path) {
            handleAiGenerate(null);
        } else {
            setIsModalOpen(true);
        }
    };
    
    // --- DATA FETCHING FOR SPECIFIC STEPS ---
    const fetchCompanyProfile = async () => {
        const currentTocItem = proposal.technical[wizardState.step - 1];
        try {
            const response = await fetch(`http://localhost:3001/api/company-profile/`);
            const data = await response.json();
            if(data?.about) {
                updateProposal('content', { ...proposal.content, [currentTocItem.id]: data.about });
            } else {
                alert("لم يتم العثور على بيانات النبذة التعريفية. يرجى إضافتها أولاً.");
            }
        } catch (error) {
            alert("فشل جلب بيانات النبذة التعريفية.");
        }
    };
    const fetchExperiences = () => alert("سيتم هنا جلب الخبرات السابقة من صفحة الخبرات.");
    const fetchTeam = () => alert("سيتم هنا جلب بيانات فريق العمل من صفحة الفريق.");

    // --- TOC & WIZARD NAVIGATION HANDLERS ---
    const addTocItem = (type) => {
        const newId = `${type.charAt(0)}${Date.now()}`;
        const newItem = { id: newId, title: '' };
        updateProposal(type, [...proposal[type], newItem]);
    };

    const removeTocItem = (type, id) => {
        updateProposal(type, proposal[type].filter(item => item.id !== id));
        const newContent = { ...proposal.content };
        delete newContent[id];
        updateProposal('content', newContent);
    };

    const updateTocItemTitle = (type, id, newTitle) => {
        updateProposal(type, proposal[type].map(item => item.id === id ? { ...item, title: newTitle } : item));
    };

    const proceedToContentFilling = () => {
        const allItems = [...proposal.technical, ...proposal.financial];
        if (allItems.some(item => item.title.trim() === '')) {
            alert('يرجى ملء جميع عناوين بنود جدول المحتويات.');
            return;
        }
        setWizardState({ phase: 'technical', step: 1 });
    };

    const handleDragStart = (e, position, type) => dragItem.current = { position, type };
    const handleDragEnter = (e, position) => dragOverItem.current = position;
    const handleDrop = (type) => {
        if (!dragItem.current || dragItem.current.type !== type) return;
        const list = [...proposal[type]];
        const dragItemContent = list[dragItem.current.position];
        list.splice(dragItem.current.position, 1);
        list.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        updateProposal(type, list);
    };

    const handleNextStep = () => {
        const currentPhaseSteps = proposal[wizardState.phase];
        if (wizardState.step < currentPhaseSteps.length) {
            setWizardState(prev => ({ ...prev, step: prev.step + 1 }));
        } else if (wizardState.phase === 'technical') {
            setWizardState({ phase: 'technical-complete', step: 1 });
        } else {
            alert('اكتمل العرض! يمكنك الآن تصديره.');
            onBack();
        }
    };
    const handlePrevStep = () => {
        if (wizardState.step > 1) setWizardState(prev => ({ ...prev, step: prev.step - 1 }));
    };
    const startFinancialPhase = () => setWizardState({ phase: 'financial', step: 1 });
    const setStep = (newStep) => {
        const currentPhaseSteps = proposal[wizardState.phase];
        if (newStep >= 1 && newStep <= currentPhaseSteps.length) {
            setWizardState(prev => ({ ...prev, step: newStep }));
        }
    };

    // --- RENDER LOGIC ---
    if (isLoading) return <div className="min-h-[600px] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-teal-600" /></div>;

    const renderContent = () => {
        const { phase, step } = wizardState;
        
        if (phase === 'toc') {
            return (
                <div className="p-6 sm:p-8 bg-white animate-fade-in-up">
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 text-teal-600 mb-4"><FileText size={24} /></div>
                        <h3 className="text-2xl font-bold text-slate-800">إعداد جدول المحتويات</h3>
                        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">قم بتعريف الأقسام الرئيسية للعرض الخاص بك. يمكنك تعديل العناوين، إعادة ترتيبها بالسحب والإفلات، أو إضافة وحذف البنود حسب الحاجة.</p>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-8">
                        <TocColumn type="technical" title="العرض الفني" items={proposal.technical} icon={FileSignature} addTocItem={addTocItem} updateTocItemTitle={updateTocItemTitle} removeTocItem={removeTocItem} dragItem={dragItem} dragHandlers={{ handleDragStart, handleDragEnter, handleDrop }} />
                        <TocColumn type="financial" title="العرض المالي" items={proposal.financial} icon={Banknote} addTocItem={addTocItem} updateTocItemTitle={updateTocItemTitle} removeTocItem={removeTocItem} dragItem={dragItem} dragHandlers={{ handleDragStart, handleDragEnter, handleDrop }} />
                    </div>
                    <div className="border-t border-slate-200 mt-8 pt-6 flex items-center justify-between">
                        <button onClick={onBack} className="text-sm font-medium text-slate-600 hover:text-slate-800 hover:underline">إلغاء</button>
                        <button onClick={proceedToContentFilling} className="flex items-center gap-2 py-3 px-8 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-lg hover:opacity-90 shadow-lg shadow-teal-500/20 hover:shadow-xl transition-all transform hover:scale-105">
                            <span>التالي</span><ChevronLeft className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            );
        }
        
        if (phase === 'technical-complete') {
            return (
                <div className="p-8 text-center flex flex-col items-center justify-center animate-fade-in-up h-full min-h-[600px]">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-800">اكتمل العرض الفني بنجاح!</h3>
                    <p className="text-slate-500 mt-2 max-w-md mx-auto">لقد انتهيت من إعداد الجزء الفني من العرض. أنت الآن جاهز للانتقال إلى الجزء المالي.</p>
                    <button onClick={startFinancialPhase} className="mt-6 flex items-center gap-2 py-3 px-8 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-lg hover:opacity-90 shadow-lg shadow-teal-500/20 hover:shadow-xl transition-all transform hover:scale-105">
                        <span>ابدأ العرض المالي</span><ChevronLeft className="h-5 w-5" />
                    </button>
                </div>
            );
        }

        if (phase === 'technical' || phase === 'financial') {
            const currentPhaseSteps = proposal[phase];
            const currentTocItem = currentPhaseSteps[step - 1];
            if (!currentTocItem) return null;

            const isSpecialStep = ['من نحن ؟', 'الخبرات السابقة', 'فريق العمل'].includes(currentTocItem.title);
            const specialButtonMap = {
                'من نحن ؟': { label: 'إضافة من النبذة التعريفية', action: fetchCompanyProfile, icon: Building },
                'الخبرات السابقة': { label: 'إضافة من صفحة الخبرات', action: fetchExperiences, icon: Award },
                'فريق العمل': { label: 'إضافة من صفحة الفريق', action: fetchTeam, icon: Users },
            };
            const SpecialButton = isSpecialStep ? specialButtonMap[currentTocItem.title] : null;

            return (
                <div className="animate-fade-in-up bg-white">
                    <div className="p-6 sm:p-8 border-b border-slate-200">
                         <div className="text-center mb-4">
                             <h3 className="text-xl font-bold text-slate-700">{phase === 'technical' ? 'خطوات العرض الفني' : 'خطوات العرض المالي'}</h3>
                        </div>
                         <div className="flex justify-between items-center relative text-center mx-auto max-w-full">
                            <div className="absolute top-5 right-0 left-0 h-1 bg-slate-200 rounded-full mx-auto" style={{maxWidth: 'calc(100% - 80px)'}}>
                                <div className="absolute right-0 h-full bg-teal-500 transition-all duration-500 rounded-full" style={{ width: `${currentPhaseSteps.length > 1 ? ((step - 1) / (currentPhaseSteps.length - 1)) * 100 : 0}%` }}></div>
                            </div>
                            {currentPhaseSteps.map((stepItem, index) => (
                                <div key={stepItem.id} className="z-10 flex flex-col items-center flex-1">
                                    <button onClick={() => setStep(index + 1)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${step >= index + 1 ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-300'}`}>
                                        {step > index + 1 ? <Check size={20} strokeWidth={3} /> : (stepItem.icon ? <stepItem.icon size={18} className={step >= index + 1 ? 'text-white' : 'text-slate-400'} />: index + 1)}
                                    </button>
                                    <span className={`mt-3 text-xs text-center font-medium ${step >= index + 1 ? 'text-teal-600' : 'text-slate-500'}`}>{stepItem.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-6 sm:p-8">
                        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                {currentTocItem.icon && <currentTocItem.icon className="w-8 h-8 text-teal-600" />}
                                <h3 className="text-2xl font-bold text-slate-800">{currentTocItem.title}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                {isSpecialStep && SpecialButton && (
                                    <button onClick={SpecialButton.action} className="py-2 px-4 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 flex items-center gap-2">
                                        <SpecialButton.icon size={16} /><span>{SpecialButton.label}</span>
                                    </button>
                                )}
                                <button onClick={triggerAiGeneration} disabled={isGenerating} className="py-2 px-4 bg-teal-50 text-teal-600 rounded-lg font-medium hover:bg-teal-100 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-wait">
                                     {isGenerating ? (
                                        <><Loader2 className="animate-spin h-5 w-5 text-teal-600" /><span>جاري التوليد...</span></>
                                    ) : (
                                        <><Sparkles size={16} /><span>توليد بالذكاء الاصطناعي</span></>
                                    )}
                                </button>
                            </div>
                        </div>
                        <RichTextEditor
                            value={proposal.content[currentTocItem.id] || ''}
                            onChange={(content) => updateProposal('content', { ...proposal.content, [currentTocItem.id]: content })}
                            placeholder={`اكتب محتوى "${currentTocItem.title}" هنا...`}
                        />
                        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
                            <button onClick={handlePrevStep} disabled={step <= 1} className="flex items-center gap-2 py-3 px-6 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"><ChevronRight className="h-5 w-5" /><span>السابق</span></button>
                            <button onClick={() => setWizardState({ phase: 'toc', step: 1 })} title="العودة لجدول المحتويات" className="p-3 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300 hover:text-slate-800 transition-colors"><ArrowUp className="h-5 w-5" /></button>
                            <button onClick={handleNextStep} className="flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-lg hover:opacity-90 shadow-lg shadow-teal-500/20 transition-all transform hover:scale-105">
                                <span>{step < currentPhaseSteps.length ? 'التالي' : 'إنهاء'}</span>{step < currentPhaseSteps.length ? <ChevronLeft className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return <div className="p-8">مرحلة غير معروفة.</div>
    }

    return (
        <div dir="rtl" className="min-h-screen bg-white">
            <CustomStyles />
            <AiModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onGenerate={handleAiGenerate} isLoading={isGenerating} />
            
            <div className="p-4 sm:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                        <div className="flex items-center gap-3">
                            <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200"><ArrowRight className="h-5 w-5 text-slate-600" /></button>
                            <h2 className="text-2xl font-bold text-slate-800">إنشاء العرض - {competition.name}</h2>
                        </div>
                        <button onClick={saveProposal} disabled={isSaving} className="py-2 px-4 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 flex items-center gap-2 disabled:opacity-50">
                            {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save size={16} />}
                            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التقدم'}</span>
                        </button>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                        <div className="min-h-[600px]">
                           {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProposalWizard;