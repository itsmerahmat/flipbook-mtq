import React from 'react';
import Modal from './Modal';

interface BookmarksModalProps {
    open: boolean;
    onClose: () => void;
    bookmarks: number[];
    goToPage: (page: number) => void;
}

const BookmarksModal: React.FC<BookmarksModalProps> = ({ open, onClose, bookmarks, goToPage }) => (
    <Modal open={open} onClose={onClose} title="Bookmark">
        {bookmarks.length === 0 ? <div className="text-gray-500">Belum ada bookmark</div> : (
            <ul className="space-y-1">
                {bookmarks.map(page => (
                    <li key={page}>
                        <button className="text-left w-full hover:underline" onClick={() => { goToPage(page); onClose(); }}>Halaman {page + 1}</button>
                    </li>
                ))}
            </ul>
        )}
    </Modal>
);

export default BookmarksModal;
