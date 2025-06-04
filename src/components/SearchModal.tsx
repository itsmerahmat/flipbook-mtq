import React from 'react';
import Modal from './Modal';

interface SearchModalProps {
    open: boolean;
    onClose: () => void;
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    handleSearch: () => void;
    searchResults: number[];
    goToPage: (page: number) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ open, onClose, searchQuery, setSearchQuery, handleSearch, searchResults, goToPage }) => (
    <Modal open={open} onClose={onClose} title="Cari Halaman">
        <input type="text" className="w-full border rounded px-2 py-1 mb-2" placeholder="Cari judul..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button className="mb-2 px-2 py-1 bg-blue-500 text-white rounded" onClick={handleSearch}>Cari</button>
        <ul className="space-y-1">
            {searchResults.map(page => (
                <li key={page}>
                    <button className="text-left w-full hover:underline" onClick={() => { goToPage(page); onClose(); }}>Halaman {page + 1}</button>
                </li>
            ))}
        </ul>
    </Modal>
);

export default SearchModal;
