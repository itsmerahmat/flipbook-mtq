import React from 'react';
import Modal from './Modal';

interface SearchModalProps {
    open: boolean;
    onClose: () => void;
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    handleSearch: () => void;
    searchResults: { page: number, title: string }[];
    goToPage: (page: number) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ open, onClose, searchQuery, setSearchQuery, handleSearch, searchResults, goToPage }) => (
    <Modal open={open} onClose={onClose} title="Cari Halaman">
        <input type="text" className="w-full border rounded px-2 py-1 mb-2" placeholder="Cari judul atau terjemahan..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button className="mb-2 px-2 py-1 bg-blue-500 text-white rounded" onClick={handleSearch}>Cari</button>
        <ul className="space-y-1">
            {searchResults.map(result => (
                <li key={result.page}>
                    <button className="text-left w-full hover:underline" onClick={() => { goToPage(result.page); onClose(); }}>
                        Halaman {result.page + 1}: <span className="font-semibold">{result.title}</span>
                    </button>
                </li>
            ))}
        </ul>
    </Modal>
);

export default SearchModal;
