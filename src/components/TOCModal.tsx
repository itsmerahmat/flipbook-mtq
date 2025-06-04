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
        <ul className="space-y-1">
            {toc.map(item => (
                <li key={item.page}>
                    <button className="text-left w-full hover:underline" onClick={() => { goToPage(item.page); onClose(); }}>{item.title}</button>
                </li>
            ))}
        </ul>
    </Modal>
);

export default TOCModal;
