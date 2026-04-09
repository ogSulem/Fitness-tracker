import React, { useState } from 'react';
import Modal from './Modal';
import { useLang } from '../context/LanguageContext';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const { t } = useLang();

    return (
        <footer className="bg-slate-900 dark:bg-slate-950 text-white py-8 mt-auto border-t border-slate-700 dark:border-slate-800 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                            <span className="text-white text-sm">⚡</span>
                        </div>
                        <span className="text-lg font-bold text-white">FitTrack</span>
                    </div>
                    <p className="text-slate-400 text-sm">© {currentYear} FitTrack. {t('footer_rights')}</p>
                    <button
                        onClick={() => setIsAboutModalOpen(true)}
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                        {t('footer_about')}
                    </button>
                </div>
            </div>

            <Modal
                isOpen={isAboutModalOpen}
                onClose={() => setIsAboutModalOpen(false)}
                title={t('footer_about')}
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-slate-300">{t('footer_about_body')}</p>
                    <div className="flex justify-end">
                        <button onClick={() => setIsAboutModalOpen(false)} className="btn-secondary">
                            {t('footer_close')}
                        </button>
                    </div>
                </div>
            </Modal>
        </footer>
    );
};

export default Footer;
