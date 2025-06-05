import React from 'react';
import Modal from './Modal';

interface TOCItem {
    title: string;
    page: number;
}

interface TOCModalProps {
    open: boolean;
    onClose: () => void;
    toc: TOCItem[];
    goToPage: (page: number) => void;
}

const TOCModal: React.FC<TOCModalProps> = ({ open, onClose, toc, goToPage }) => (
    <Modal open={open} onClose={onClose} title="Daftar Isi">
        <div className="w-full max-w-3xl px-2 sm:px-2 max-h-[80vh] overflow-y-auto">
            <ul className="space-y-1">
                {toc.map(item => (
                    <li key={item.page}>
                        <button className="text-left w-full hover:underline" onClick={() => { goToPage(item.page); onClose(); }}>{item.title}</button>
                    </li>
                ))}
            </ul>
        </div>
    </Modal>
);

export default TOCModal;
