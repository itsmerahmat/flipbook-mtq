import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, title }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-2 relative animate-fade-in">
                <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 text-gray-500" aria-label="Tutup">
                    <X className="w-4 h-4" />
                </button>
                {title && <h3 className="font-bold text-lg px-6 pt-6 pb-2">{title}</h3>}
                <div className="px-6 pb-6 pt-2">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
