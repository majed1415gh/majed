import React, { useState, useEffect } from 'react';
import { 
    CalendarDays, Clock, Trash2, Edit, Link as LinkIcon, Award, 
    Hash, Tag, Calendar, Send, CheckCircle, Activity, DollarSign 
} from 'lucide-react';

export const CompetitionCard = ({ comp, t, onEdit, onShowDetails }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(comp.deadline) - +new Date();
            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                setTimeLeft(`${days} يوم ${hours} ساعة ${minutes} دقيقة`);
            } else {
                setTimeLeft('انتهى الوقت');
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000);

        return () => clearInterval(timer);
    }, [comp.deadline]);

    const currencyFormat = (value) => {
        if (value === 0) return 'مجاناً';
        return value != null ? value.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }) : 'غير محدد';
    };

    const StatusBadge = ({ status }) => (
        <span className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-100 rounded-full">
            {t(`status_${status}`)}
        </span>
    );
    
    const DetailRow = ({ icon, label, value, isLast = false }) => (
        <div className={`flex justify-between items-center py-1.5 ${!isLast ? 'border-b border-slate-100' : ''}`}>
            <div className="flex items-center gap-3 text-slate-500">
                {icon}
                <span className="font-medium">{label}</span>
            </div>
            <div className="text-slate-700 text-left">{value}</div>
        </div>
    );

    const truncateName = (name) => {
        const words = name.split(' ');
        if (words.length > 6) {
            return words.slice(0, 6).join(' ') + '.....';
        }
        return name;
    };

    return (
        <div onClick={() => onShowDetails(comp)} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer">
            <div className="p-4 bg-[#fcfcfc]">
                <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-teal-700 leading-tight">{truncateName(comp.name)}</h3>
                </div>
                <p className="text-sm text-slate-500 mt-1">{comp.governmentEntity}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600 bg-white border border-slate-200 p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-slate-400" />
                        <span>{new Date(comp.dateAdded).toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                        <Clock size={16} className="text-slate-400" />
                        <span>{timeLeft}</span>
                    </div>
                </div>
            </div>

            <div className="p-4 text-sm flex-1">
                <div>
                    <DetailRow 
                        icon={<Hash size={16} className="text-slate-400" />}
                        label={t('referenceNumberShort')}
                        value={<span className="font-semibold">{comp.referenceNumber}</span>}
                    />
                    <DetailRow 
                        icon={<Tag size={16} className="text-slate-400" />}
                        label={t('competitionType')}
                        value={<span>{comp.competitionType}</span>}
                    />
                    <DetailRow 
                        icon={<Calendar size={16} className="text-slate-400" />}
                        label={t('contractDuration')}
                        value={<span>{comp.contractDuration}</span>}
                    />
                    <DetailRow 
                        icon={<Send size={16} className="text-slate-400" />}
                        label={t('submissionMethod')}
                        value={<span>{comp.submissionMethod}</span>}
                    />
                    <DetailRow 
                        icon={<CheckCircle size={16} className="text-slate-400" />}
                        label={t('etimadStatus')}
                        value={<span>{comp.etimadStatus}</span>}
                    />
                    <DetailRow 
                        icon={<Activity size={16} className="text-slate-400" />}
                        label={t('status')}
                        value={<StatusBadge status={comp.status} />}
                    />
                    <DetailRow 
                        icon={<DollarSign size={16} className="text-slate-400" />}
                        label={t('brochureValue')}
                        value={<span className="font-bold text-slate-800">{currencyFormat(comp.brochureCost)}</span>}
                        isLast={true}
                    />
                </div>
            </div>

            <div className="px-4 pb-3">
            {(comp.awarded_supplier || comp.supplierName) && (comp.award_amount || comp.awardValue) ? (
                <div className="bg-[#fcfcfc] border border-slate-200 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-full">
                                <Award className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-600 mb-1">إعلان الترسية</p>
                                <p className="text-sm font-semibold text-slate-700">{comp.awarded_supplier || comp.supplierName}</p>
                            </div>
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-slate-500 mb-1">قيمة الترسية</p>
                            <p className="text-base font-bold text-slate-700">{currencyFormat(comp.award_amount || comp.awardValue)}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-[#fcfcfc] border border-slate-200 rounded-xl p-3 text-center shadow-sm">
                    <p className="text-sm text-slate-500 font-medium">لم يتم إعلان الترسية بعد</p>
                </div>
            )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); alert('سيتم تفعيل الحذف لاحقًا'); }} className="p-2 text-slate-500 rounded-md hover:bg-slate-200 hover:text-red-600 transition-colors" title={t('delete')}>
                        <Trash2 size={18} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(comp); }} className="p-2 text-slate-500 rounded-md hover:bg-slate-200 hover:text-slate-800 transition-colors" title={t('edit')}>
                        <Edit size={18} />
                    </button>
                    <a href={comp.competitionUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 text-slate-500 rounded-md hover:bg-slate-200 hover:text-slate-800 transition-colors" title="رابط المنافسة">
                        <LinkIcon size={18} />
                    </a>
                </div>
                <button onClick={(e) => { e.stopPropagation(); alert('سيتم تفعيل إنشاء العرض لاحقًا'); }} className="flex-1 bg-teal-600 text-white py-2 px-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm text-center">
                    {t('createProposal')}
                </button>
            </div>
        </div>
    );
};