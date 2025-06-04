import React from 'react';
import Modal from './Modal';

export interface NoteItem {
    page: number;
    text: string;
    createdAt: string;
}

interface NotesModalProps {
    open: boolean;
    onClose: () => void;
    noteInput: string;
    setNoteInput: (v: string) => void;
    saveNote: () => void;
    notesForCurrentPage: NoteItem[];
    currentPage: number;
}

const NotesModal: React.FC<NotesModalProps> = ({ open, onClose, noteInput, setNoteInput, saveNote, notesForCurrentPage, currentPage }) => (
    <Modal open={open} onClose={onClose} title={`Catatan Halaman ${currentPage + 1}`}>
        <textarea className="w-full border rounded px-2 py-1 mb-2" rows={3} value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Tulis catatan..." />
        <button className="mb-2 px-2 py-1 bg-green-500 text-white rounded" onClick={saveNote}>Simpan Catatan</button>
        <div className="mt-2">
            <div className="font-semibold">Catatan Tersimpan:</div>
            {notesForCurrentPage.length === 0 ? (
                <div className="text-gray-500">Belum ada catatan di halaman ini</div>
            ) : (
                <ul className="space-y-2">
                    {notesForCurrentPage.map((n, i) => (
                        <li key={i} className="border-b pb-1">
                            <div className="text-gray-700 whitespace-pre-line">{n.text}</div>
                            <div className="text-xs text-gray-400">Halaman {n.page + 1} • {new Date(n.createdAt).toLocaleString()}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </Modal>
);

export default NotesModal;
