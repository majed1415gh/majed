import React, { useState } from 'react';
import { 
    Building, LayoutDashboard, Briefcase, User, PlusCircle, 
    Book, Award, Users, FileText, Menu, 
    ClipboardList // --- 1. تم استيراد أيقونة جديدة ---
} from 'lucide-react';

const Sidebar = ({ navigate, currentPage, onAddNewCompetition }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const navItems = [
        { id: 'dashboard',       label: 'لوحة التحكم',         icon: LayoutDashboard, level: 0 },
        { id: 'ALLcompetitions', label: 'كل المنافسات',       icon: Briefcase,       level: 0 },
        // --- 2. تم تغيير الأيقونة هنا ---
        { id: 'competitions',    label: 'منافساتي',           icon: ClipboardList,   level: 0 },
        { id: 'profile',         label: 'ملف الشركة',          icon: User,            level: 0 },
        { id: 'about',           label: 'النبذة التعريفية',    icon: Book,            level: 1 },
        { id: 'experience',      label: 'الخبرات السابقة',      icon: Award,           level: 1 },
        { id: 'team',            label: 'فريق العمل',          icon: Users,           level: 1 },
        { id: 'documents',       label: 'مستندات الشركة',     icon: FileText,        level: 1 },
    ];

    return (
        <aside className={`flex-col h-screen sticky top-0 hidden lg:flex bg-slate-800 text-slate-300 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'}`}>
            <div className="p-4 h-[72px] flex items-center">
                {isExpanded ? (
                    <>
                        <Building className="h-8 w-8 text-teal-400 flex-shrink-0" />
                        <h1 className="ms-3 text-2xl font-bold text-white whitespace-nowrap">منصتي</h1>
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)} 
                            className="p-2 rounded-lg hover:bg-slate-700 ms-auto"
                        >
                            <Menu className="h-6 w-6 text-white transition-transform duration-300" />
                        </button>
                    </>
                ) : (
                    <div className="w-full flex justify-center">
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)} 
                            className="p-2 rounded-lg hover:bg-slate-700"
                        >
                            <Menu className="h-6 w-6 text-white transition-transform duration-300 rotate-180" />
                        </button>
                    </div>
                )}
            </div>

            <nav className="flex-1 py-6 space-y-1">
                {navItems.map(item => (
                    <a
                        key={item.id}
                        href="#"
                        onClick={(e) => { e.preventDefault(); navigate(item.id); }}
                        className={`flex items-center py-3 transition-colors 
                            ${isExpanded ? (item.level === 1 ? 'ps-8 pe-4' : 'px-4') : 'px-4 justify-center'}
                            ${currentPage === item.id
                                ? 'bg-[#003c47] text-teal-400 font-semibold'
                                : `hover:bg-[#003c47] hover:text-white ${
                                    item.id === 'profile' ? 'text-teal-400 font-bold' 
                                    : item.level === 1 ? 'text-slate-400' 
                                    : 'text-slate-300'
                                }`
                            }`
                        }
                    >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className={`transition-all duration-200 whitespace-nowrap ${isExpanded ? 'opacity-100 ms-4' : 'opacity-0 w-0'}`}>
                            {item.label}
                        </span>
                    </a>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700">
                <button 
                    onClick={onAddNewCompetition} 
                    className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors ${isExpanded ? 'gap-2' : ''}`}
                >
                    <PlusCircle size={20} className="flex-shrink-0"/>
                    <span className={`transition-all duration-200 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                        إضافة منافسة جديدة
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;