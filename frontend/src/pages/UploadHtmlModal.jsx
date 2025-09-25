// UploadHtmlModal.jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, FileText, Loader2 } from 'lucide-react';

const UploadHtmlModal = ({ isOpen, onClose, onGenerate, isLoading }) => {
    const [file, setFile] = useState(null);

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/html': ['.html', '.htm'] },
        multiple: false
    });

    const handleGenerateClick = () => {
        if (file) {
            onGenerate(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">توليد المحتوى من كراسة الشروط</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X className="h-5 w-5 text-slate-600" /></button>
                </div>
                <p className="text-slate-600 mb-5">
                    يرجى تحميل ملف كراسة الشروط والمواصفات بصيغة (HTML) ليقوم الذكاء الاصطناعي بتحليله وتوليد محتوى مخصص لهذه المنافسة.
                </p>

                <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400'}`}>
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center">
                        <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
                        {file ? (
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                                <FileText size={20} />
                                <span>{file.name}</span>
                            </div>
                        ) : (
                            isDragActive ?
                                <p className="text-teal-600">أفلت الملف هنا...</p> :
                                <p className="text-slate-500">اسحب وأفلت الملف هنا، أو انقر للاختيار</p>
                        )}
                        <span className="text-xs text-slate-400 mt-2">الملفات المسموح بها: HTML, HTM</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} disabled={isLoading} className="py-2.5 px-5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition disabled:opacity-50">
                        إلغاء
                    </button>
                    <button onClick={handleGenerateClick} disabled={isLoading || !file} className="py-2.5 px-5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Sparkles size={16} />}
                        <span>{isLoading ? 'جاري التحليل...' : 'توليد المحتوى'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadHtmlModal;