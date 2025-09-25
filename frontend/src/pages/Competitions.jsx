// src/pages/Competitions.jsx

import React, { useState } from 'react';
import { PlusCircle, Search, ArrowRight, ArrowLeft, Briefcase, ChevronLeft, Filter, ChevronDown } from 'lucide-react';
import { CompetitionCard } from '../components/competitions/CompetitionCard';

const Competitions = ({ t, onAddNewCompetition, MOCK_COMPETITIONS, onEditCompetition, onShowDetails }) => {
    const [activeStatus, setActiveStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    
    const ITEMS_PER_PAGE = 6;

    const processTabs = [
        { id: 'for_review', label: t('status_tab_for_review') },
        { id: 'brochure_purchased', label: t('status_tab_brochure_purchased') },
        { id: 'proposal_submitted', label: t('status_tab_proposal_submitted') },
        { id: 'awarded', label: t('status_tab_awarded') },
        { id: 'claim_submitted', label: t('status_tab_claim_submitted') },
        { id: 'finished', label: t('status_tab_finished') },
    ];
    
    const standaloneTabs = [
        { id: 'all', label: t('status_tab_all') },
        { id: 'not_submitted', label: t('status_tab_not_submitted') },
        { id: 'cancelled', label: t('status_tab_cancelled') },
    ];

    // Calculate the count of competitions for each status
    const competitionCounts = MOCK_COMPETITIONS.reduce((acc, comp) => {
        acc[comp.status] = (acc[comp.status] || 0) + 1;
        return acc;
    }, {});

    const filteredCompetitions = MOCK_COMPETITIONS.filter(comp => {
        const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              comp.referenceNumber.includes(searchTerm);
        const matchesStatus = activeStatus === 'all' || comp.status === activeStatus;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredCompetitions.length / ITEMS_PER_PAGE);
    const paginatedCompetitions = filteredCompetitions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleStatusChange = (statusId) => {
        setActiveStatus(statusId);
        setCurrentPage(1);
    };

    const isProcessTabActive = processTabs.some(p => p.id === activeStatus);
    
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-800">{t('allCompetitions')}</h2>
                <button 
                    onClick={onAddNewCompetition} 
                    className="py-2.5 px-5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center justify-center gap-2 transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                    <PlusCircle size={20}/> {t('newCompetition')}
                </button>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="relative flex-grow max-w-md">
                         <Search className="absolute top-1/2 -translate-y-1/2 right-4 h-5 w-5 text-slate-400 pointer-events-none" />
                         <input 
                            type="text" 
                            placeholder={t('searchByReferenceOrLink')} 
                            value={searchTerm} 
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                            className="w-full bg-slate-50 border-slate-200 focus:border-teal-500 focus:ring-teal-500 rounded-lg p-3 pr-12 transition-colors duration-300" 
                         />
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                        {standaloneTabs.map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => handleStatusChange(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-300 ease-in-out ${
                                    activeStatus === tab.id 
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-md' 
                                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="border-t border-slate-200 pt-4">
                    <button 
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                        className="w-full flex justify-between items-center"
                    >
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-500" />
                            <h3 className="text-sm font-medium text-slate-700">تصفية حسب مرحلة المنافسة:</h3>
                        </div>
                        <ChevronDown size={20} className={`text-slate-500 transition-transform duration-300 ${isFilterVisible ? 'rotate-180' : 'rotate-0'}`} />
                    </button>

                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFilterVisible ? 'max-h-[500px] opacity-100 pt-4' : 'max-h-0 opacity-0'}`}>
                        <div className="flex-grow overflow-hidden">
                            <div className="flex items-center justify-center overflow-x-auto py-2 -my-2 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                                {processTabs.map((tab, index) => {
                                    const count = competitionCounts[tab.id] || 0;
                                    let scaleClass = 'scale-100 hover:scale-105';
                                    if (isProcessTabActive) {
                                        scaleClass = activeStatus === tab.id 
                                            ? 'scale-110 z-10'
                                            : 'scale-90 opacity-75';
                                    }

                                    return (
                                        <div key={tab.id} className="flex items-center flex-shrink-0">
                                            <button 
                                                onClick={() => handleStatusChange(tab.id)}
                                                className={`flex items-center gap-2 pl-2 pr-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out transform ${scaleClass} ${activeStatus === tab.id ? 'rounded-full bg-teal-100 text-teal-800' : 'rounded-lg hover:rounded-full text-slate-600 hover:bg-slate-100'}`}
                                            >
                                                <span className="whitespace-nowrap">{tab.label}</span>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 transition-all duration-300 ${activeStatus === tab.id ? 'bg-teal-600 text-white border-teal-600 font-semibold' : 'bg-white text-slate-500 border-slate-300 font-medium'}`}>
                                                    {count}
                                                </div>
                                            </button>
                                            
                                            {index < processTabs.length - 1 && (
                                                <div className={`flex items-center w-12 mx-2 flex-shrink-0 transition-opacity duration-300 ${isProcessTabActive && activeStatus !== tab.id && activeStatus !== processTabs[index+1]?.id ? 'opacity-50' : ''}`}>
                                                    <div className="flex-grow h-px bg-slate-200"></div>
                                                    <ChevronLeft size={16} className="text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {paginatedCompetitions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedCompetitions.map(comp => ( <CompetitionCard key={comp.id} comp={comp} t={t} onEdit={onEditCompetition} onShowDetails={onShowDetails} /> ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                    <Briefcase size={48} className="mx-auto text-slate-300" />
                    <h3 className="mt-4 text-xl font-semibold text-slate-700">لا توجد منافسات</h3>
                    <p className="mt-2 text-slate-500">لم يتم العثور على منافسات تطابق معايير البحث الحالية.</p>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <ArrowLeft size={16} /> <span>السابق</span>
                    </button>
                    <span className="text-sm text-slate-600 font-medium">{t('page')} <span className="font-bold text-slate-800">{currentPage}</span> {t('of')} <span className="font-bold text-slate-800">{totalPages}</span></span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <span>التالي</span> <ArrowRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Competitions;