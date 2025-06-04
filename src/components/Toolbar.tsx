import React from 'react';
import { List, Bookmark, Search, StickyNote, Share2 } from 'lucide-react';

interface ToolbarProps {
    onTOC: () => void;
    onBookmarks: () => void;
    onSearch: () => void;
    onNotes: () => void;
    onShare: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onTOC, onBookmarks, onSearch, onNotes, onShare }) => (
    <div className="flex gap-2 justify-center mt-4 mb-2 z-20">
        <button onClick={onTOC} className="p-2 bg-white rounded shadow hover:bg-gray-100" title="Daftar Isi"><List className="w-5 h-5" /></button>
        <button onClick={onBookmarks} className="p-2 bg-white rounded shadow hover:bg-gray-100" title="Bookmark"><Bookmark className="w-5 h-5" /></button>
        <button onClick={onSearch} className="p-2 bg-white rounded shadow hover:bg-gray-100" title="Cari"><Search className="w-5 h-5" /></button>
        <button onClick={onNotes} className="p-2 bg-white rounded shadow hover:bg-gray-100" title="Catatan"><StickyNote className="w-5 h-5" /></button>
        <button onClick={onShare} className="p-2 bg-white rounded shadow hover:bg-gray-100" title="Bagikan"><Share2 className="w-5 h-5" /></button>
    </div>
);

export default Toolbar;
