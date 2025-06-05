import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Bookmark, BookmarkCheck, List, Search, StickyNote, Share2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';
import { useIsMobile } from '@/hooks/use-mobile';
import { Maximize2, Minimize2 } from 'lucide-react';
import Modal from './Modal';
import Toolbar from './Toolbar';
import NotesModal, { NoteItem } from './NotesModal';
import BookmarksModal from './BookmarksModal';
import TOCModal from './TOCModal';
import SearchModal from './SearchModal';

interface HadithItem {
  number: string;
  arab: string;
  id: string;
  judul: string;
}

const API_URLS = [
  'https://islamic-api.vwxyz.id/hadits/arbain',
  'https://islamic-api.vwxyz.id/hadits/arbain?page=2',
  'https://islamic-api.vwxyz.id/hadits/arbain?page=3',
];

const FlipBook: React.FC = () => {
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const isMobile = useIsMobile();
  const flipBookRef = useRef<React.ComponentRef<typeof HTMLFlipBook> | null>(null);
  const flipBookContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Fitur tambahan (bookmark, notes, search, TOC, dsb) tetap sama
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [noteInput, setNoteInput] = useState('');

  // Fetch hadiths from API
  useEffect(() => {
    setIsLoading(true);
    Promise.all(API_URLS.map(url => fetch(url).then(r => r.json())))
      .then(results => {
        const all = results.flatMap(r => r.data.items);
        setHadiths(all);
        setIsLoading(false);
      });
  }, []);

  // TOC
  const toc = [
    { title: 'Cover', page: 0 },
    ...hadiths.map((h, idx) => ({ title: `${h.number}. ${h.judul}`, page: idx + 1 })),
    { title: 'Back Cover', page: hadiths.length + 1 },
  ];

  // Bookmark logic
  const toggleBookmark = (page: number) => {
    setBookmarks((prev) => prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page]);
  };

  // Note logic
  const saveNote = () => {
    if (!noteInput.trim()) return;
    setNotes(prev => [
      ...prev,
      { page: currentPage, text: noteInput, createdAt: new Date().toISOString() }
    ]);
  };

  // Search logic (judul/id/arab)
  const handleSearch = () => {
    if (!searchQuery) return setSearchResults([]);
    const query = searchQuery.trim().toLowerCase();
    let results: number[] = [];
    if (/^\d+$/.test(query)) {
      const idx = parseInt(query, 10) - 1;
      if (idx >= 0 && idx < hadiths.length) results = [idx + 1];
    } else {
      results = hadiths
        .map((h, idx) => ({ idx: idx + 1, h }))
        .filter(({ h }) => h.judul.toLowerCase().includes(query) || h.id.toLowerCase().includes(query) || h.arab.includes(query))
        .map(({ idx }) => idx);
    }
    setSearchResults(results);
  };

  // Progress bar
  const progress = ((currentPage + 1) / toc.length) * 100;

  // Share logic (copy url + halaman)
  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?page=${currentPage}`;
    navigator.clipboard.writeText(url);
    alert('Link halaman telah disalin!');
  };

  // Fullscreen handlers
  const handleFullscreen = () => {
    const elem = flipBookContainerRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  // Bookmark: load & save ke localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flipbook-bookmarks');
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('flipbook-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Notes: load & save ke localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flipbook-notes');
    if (saved) setNotes(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('flipbook-notes', JSON.stringify(notes));
  }, [notes]);

  // Reset searchQuery dan noteInput hanya saat modal ditutup
  useEffect(() => {
    if (!showSearch) setSearchQuery('');
  }, [showSearch]);
  useEffect(() => {
    if (!showNotes) setNoteInput('');
  }, [showNotes]);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8">
        <div className="flex items-center justify-center h-64 sm:h-96">
          <div className="text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Loading hadiths...</h3>
            <p className="text-gray-600">Please wait while we prepare your reading experience.</p>
          </div>
        </div>
      </div>
    );
  }

  // Hitung apakah jumlah total halaman (cover depan + isi + cover belakang) genap
  const totalWithCovers = hadiths.length + 2;
  const needBlank = totalWithCovers % 2 !== 0;

  const pages = [
    // Cover depan
    (
      <div key="cover-front" className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#a9744f] to-[#6e4b27] text-center select-none">
        <div className="flex flex-col items-center justify-center text-center h-full w-full">
          <img
            src="https://www.ulm.ac.id/id/wp-content/uploads/2015/05/Logo-Unlam.png"
            alt="Logo ULM"
            className="object-contain mx-auto mb-4"
            style={{ width: 'clamp(64px, 20vw, 120px)', height: 'clamp(64px, 20vw, 120px)' }}
          />
          <h2 className="text-2xl font-bold text-white mb-2">SirohNawawi</h2>
          <p className="text-gray-200">Click to open the book</p>
        </div>
      </div>
    ),
    // Halaman isi hadith
    ...hadiths.map((h, idx) => (
      <div key={h.number} className="w-full h-full flex flex-col items-center justify-center bg-white px-2 py-6 sm:px-8 sm:py-10 select-text">
        <div className="text-xs text-gray-400 mb-2">Hadith {h.number}</div>
        <div className="text-2xl sm:text-3xl text-right font-serif leading-loose mb-4" dir="rtl" lang="ar">{h.arab}</div>
        <div className="text-base sm:text-lg text-gray-800 mb-2 font-bold text-center">{h.judul}</div>
        <div className="text-sm sm:text-base text-gray-700 text-center whitespace-pre-line">{h.id}</div>
      </div>
    )),
    // Halaman kosong jika perlu
    ...(needBlank ? [<div key="blank" className="w-full h-full bg-white" />] : []),
    // Cover belakang
    (
      <div key="cover-back" className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6e4b27] to-[#a9744f] text-center select-none">
        <div className="flex flex-col items-center justify-center text-center h-full w-full">
          <h2 className="text-2xl font-bold text-[#5b3a1b] mb-2">The End</h2>
          <p className="text-white">Thank you for reading!</p>
        </div>
      </div>
    ),
  ];

  const handlePrev = () => {
    lockVerticalScroll();
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };
  const handleNext = () => {
    lockVerticalScroll();
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };
  const onFlip = (e: { data: number }) => {
    setCurrentPage(e.data);
  };

  // Helper untuk pindah halaman flipbook
  const goToPage = (page: number) => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flip(page);
    }
  };

  // Responsive size & mode
  const flipBookProps = isMobile
    ? {
      width: 320,
      height: 480,
      minWidth: 180,
      maxWidth: 400,
      minHeight: 240,
      maxHeight: 600,
      usePortrait: true,
    }
    : {
      width: 400,
      height: 600,
      minWidth: 315,
      maxWidth: 800,
      minHeight: 400,
      maxHeight: 900,
      usePortrait: false,
    };

  // Untuk menampilkan catatan di halaman aktif
  const notesForCurrentPage = notes.filter(n => n.page === currentPage);

  // Scroll lock helper
  const lockVerticalScroll = () => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100vw';
    document.body.style.overflowY = 'hidden';
    setTimeout(() => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollY);
    }, 400);
  };

  return (
    <div ref={flipBookContainerRef} className="w-full max-w-6xl mx-auto px-2 sm:px-4 relative">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded mt-2 mb-2 overflow-hidden">
        <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
      {/* Modal: TOC */}
      <TOCModal open={showTOC} onClose={() => setShowTOC(false)} toc={toc} goToPage={goToPage} />
      {/* Modal: Bookmarks */}
      <BookmarksModal open={showBookmarks} onClose={() => setShowBookmarks(false)} bookmarks={bookmarks} goToPage={goToPage} />
      {/* Modal: Search */}
      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} searchResults={searchResults} goToPage={goToPage} />
      {/* Modal: Notes */}
      <NotesModal open={showNotes} onClose={() => setShowNotes(false)} noteInput={noteInput} setNoteInput={setNoteInput} saveNote={saveNote} notesForCurrentPage={notesForCurrentPage} currentPage={currentPage} />
      <div className="flex justify-center">
        <HTMLFlipBook
          ref={flipBookRef}
          size="stretch"
          drawShadow={true}
          flippingTime={700}
          startZIndex={0}
          autoSize={true}
          className="mx-auto shadow-2xl"
          style={{ margin: '0 auto' }}
          startPage={0}
          maxShadowOpacity={0.5}
          showCover={true}
          renderOnlyPageLengthChange={true}
          mobileScrollSupport={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          disableFlipByClick={false}
          showPageCorners={true}
          onFlip={onFlip}
          {...flipBookProps}
        >
          {pages}
        </HTMLFlipBook>
        {/* Bookmark tombol di halaman aktif */}
        <button
          className={`absolute right-4 top-4 z-10 p-2 rounded-full bg-white shadow ${bookmarks.includes(currentPage) ? 'text-yellow-500' : 'text-gray-400'}`}
          onClick={() => toggleBookmark(currentPage)}
          title="Bookmark halaman ini"
        >
          {bookmarks.includes(currentPage) ? <BookmarkCheck className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
        </button>
      </div>
      {/* Toolbar fitur pindah ke bawah */}
      <Toolbar
        onTOC={() => setShowTOC(v => !v)}
        onBookmarks={() => setShowBookmarks(v => !v)}
        onSearch={() => setShowSearch(v => !v)}
        onNotes={() => setShowNotes(v => !v)}
        onShare={handleShare}
      />
      <div className="flex flex-col items-center mt-4 gap-2">
        <div className="flex gap-4">
          <button
            onClick={handlePrev}
            className="px-4 py-2 rounded bg-[#a9744f] text-white font-semibold shadow hover:bg-[#6e4b27] transition disabled:opacity-50"
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 rounded bg-[#a9744f] text-white font-semibold shadow hover:bg-[#6e4b27] transition disabled:opacity-50"
            disabled={currentPage === pages.length - 1}
          >
            Next
          </button>
          <button
            onClick={handleFullscreen}
            className={`p-2 rounded bg-white shadow hover:bg-gray-100 ${isFullscreen ? 'text-blue-500' : 'text-gray-400'}`}
            title={isFullscreen ? 'Keluar Fullscreen' : 'Masuk Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div className="text-center mt-4 text-gray-600">
        <p className="text-sm">
          Click or swipe to turn pages. Total hadiths: {hadiths.length}
        </p>
      </div>
    </div>
  );
};

export default FlipBook;
