import React, { useState } from 'react';
import Modal from './Modal';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

    return (
        <footer className="bg-secondary text-white py-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <span className="text-white text-sm">⚡</span>
                        </div>
                        <span className="text-lg font-bold text-white">FitTrack</span>
                    </div>
                    <p className="text-slate-400 text-sm">© {currentYear} FitTrack. Все права защищены.</p>
                    <button
                        onClick={() => setIsAboutModalOpen(true)}
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                        О проекте
                    </button>
                </div>
            </div>

            <Modal
                isOpen={isAboutModalOpen}
                onClose={() => setIsAboutModalOpen(false)}
                title="О проекте"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Данная работа выполнена студентом Казанского Федерального Университета,
                        направление Прикладная информатика, группа 09-253,
                        Богдановым Артуром Владимировичем.
                    </p>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsAboutModalOpen(false)}
                            className="btn-secondary"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            </Modal>
        </footer>
    );
};

export default Footer; 