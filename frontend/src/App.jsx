// src/App.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // ++ إضافة: استيراد Supabase

// استيراد المكونات والصفحات
import Login from './pages/Login';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import Dashboard from './pages/Dashboard';
import Competitions from './pages/Competitions';
import CompanyProfile from './pages/CompanyProfile';
import CompanyProfilePage from './pages/CompanyProfilePage';
import AddCompetitionModal from './components/AddCompetitionModal';
import SuccessModal from './components/SuccessModal';
import CompetitionDetail from './pages/CompetitionDetail';
import { translations } from './i18n/translations';

export default function App() {
    const [language, setLanguage] = useState('ar');
    const [currentUser, setCurrentUser] = useState(null); // سيتغير هذا الآن بواسطة Supabase
    const [page, setPage] = useState('dashboard'); // سنغير القيمة الافتراضية
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [companyProfile, setCompanyProfile] = useState(null);
    const [editingCompetition, setEditingCompetition] = useState(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [competitions, setCompetitions] = useState([]);
    const [selectedCompetition, setSelectedCompetition] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true); // ++ إضافة: حالة لمعرفة جلب المستخدم

    // ++ بداية الكود الجديد: إدارة جلسة المستخدم ++
    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setCurrentUser(session?.user ?? null);
            setLoadingUser(false);
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUser(session?.user ?? null);
            // الانتقال إلى لوحة التحكم بعد تسجيل الدخول بنجاح
            if (_event === 'SIGNED_IN') {
                setPage('dashboard');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);
    // ++ نهاية الكود الجديد ++

    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser) return;
            
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                
                const response = await fetch('http://localhost:3001/api/company-profile', {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setCompanyProfile(data);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        if(currentUser) fetchProfile();
    }, [currentUser]);
    
     useEffect(() => {
        const fetchCompetitions = async () => {
            if (!currentUser) return;
            
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                
                const response = await fetch('http://localhost:3001/api/competitions', {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setCompetitions(data);
                }
            } catch (error) {
                console.error('Error fetching competitions:', error);
            }
        };

        if(currentUser) fetchCompetitions();

    }, [currentUser]);

    const t = (key) => (translations[language] && translations[language][key]) || key;

    useEffect(() => {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    // -- حذف دالة handleLogin القديمة --

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        // لا حاجة لتغيير الصفحة، onAuthStateChange سيتكفل بالأمر
    };

    const navigate = (pageName) => {
        setPage(pageName);
        setSelectedCompetition(null);
    }
    
    const handleSaveProfile = (data) => {
        setCompanyProfile(data);
        console.log("Profile data saved in App state:", data);
    };

    const handleStartEdit = (competition) => {
        setEditingCompetition(competition);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingCompetition(null);
        setIsModalOpen(true);
    };

    const handleViewDetails = (competition) => {
        setSelectedCompetition(competition);
    };
    
    const handleSaveCompetition = (competitionData) => {
        if (editingCompetition) {
            setCompetitions(competitions.map(c => 
                c.id === editingCompetition.id ? { ...c, ...competitionData, brochureCost: Number(competitionData.brochureCost) || 0 } : c
            ));
        } else {
            const nextId = competitions.length > 0 ? Math.max(...competitions.map(c => c.id)) + 1 : 1;
            const competitionWithDefaults = {
                id: nextId, proposalId: null, dateAdded: new Date().toISOString().split('T')[0],
                ...competitionData, brochureCost: Number(competitionData.brochureCost) || 0,
            };
            setCompetitions([competitionWithDefaults, ...competitions]);
        }
        setIsModalOpen(false);
        setEditingCompetition(null);
        setIsSuccessModalOpen(true);
    };

    // ++ تعديل العرض الشرطي ++
    if (loadingUser) {
        return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
    }
    
    if (!currentUser) {
        return <Login t={t} />;
    }

    const renderPage = () => {
       // ... (محتوى الدالة يبقى كما هو)
       if (selectedCompetition) {
        return <CompetitionDetail 
                    competition={selectedCompetition} 
                    onBack={() => setSelectedCompetition(null)} 
                    t={t} 
                />;
        }

        switch (page) {
            case 'dashboard': 
                return <Dashboard t={t} navigate={navigate} onAddNewCompetition={handleAddNew} MOCK_COMPETITIONS={competitions} MOCK_USER={currentUser} />;
            case 'competitions': 
                return <Competitions t={t} onAddNewCompetition={handleAddNew} onEditCompetition={handleStartEdit} onShowDetails={handleViewDetails} MOCK_COMPETITIONS={competitions} />;
            case 'profile': 
                return <CompanyProfile t={t} />;
            case 'about':
                return <CompanyProfilePage 
                            initialProfileData={companyProfile}
                            onSaveProfile={handleSaveProfile}
                        />;
            default: 
                return <Dashboard t={t} navigate={navigate} onAddNewCompetition={handleAddNew} MOCK_COMPETITIONS={competitions} MOCK_USER={currentUser}/>;
        }
    };

    return (
        <>
            <style>{`
                /* ... (الأنماط تبقى كما هي) ... */
            `}</style>
            <div className="flex min-h-screen">
                {/* ... (بقية JSX تبقى كما هي) ... */}
                <Sidebar t={t} navigate={navigate} currentPage={page} onAddNewCompetition={() => setIsModalOpen(true)} />
                <div className="flex-1 flex flex-col">
                    <Header t={t} language={language} setLanguage={setLanguage} user={currentUser} onLogout={handleLogout} />
                    <main className="flex-1 p-6 sm:p-8">
                         <div className="max-w-7xl mx-auto">
                            {renderPage()}
                        </div>
                    </main>
                </div>
                {isModalOpen && <AddCompetitionModal t={t} onClose={() => { setIsModalOpen(false); setEditingCompetition(null); }} onSave={handleSaveCompetition} competitionToEdit={editingCompetition} />}
                <SuccessModal 
                    isOpen={isSuccessModalOpen}
                    onClose={() => setIsSuccessModalOpen(false)}
                />
            </div>
        </>
    );
}