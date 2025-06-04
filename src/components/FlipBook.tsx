import React, { useState, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import HTMLFlipBook from 'react-pageflip';
import { useIsMobile } from '@/hooks/use-mobile';
import { Maximize2, Minimize2 } from 'lucide-react';

// Set up PDF.js worker untuk Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface FlipBookProps {
  pdfUrl: string;
}

// Add this type above your component
type FlipEvent = { data: number };

const FlipBook: React.FC<FlipBookProps> = ({ pdfUrl }) => {
  const [totalPages, setTotalPages] = useState(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const flipBookRef = useRef<React.ComponentRef<typeof HTMLFlipBook> | null>(null);
  const isMobile = useIsMobile();
  const flipBookContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setIsLoading(true);
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        const images: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const scale = 1.5;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          images.push(canvas.toDataURL());
        }
        setPageImages(images);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setIsLoading(false);
      }
    };
    loadPDF();
  }, [pdfUrl]);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8">
        <div className="flex items-center justify-center h-64 sm:h-96">
          <div className="text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Loading your book...</h3>
            <p className="text-gray-600">Please wait while we prepare your reading experience.</p>
          </div>
        </div>
      </div>
    );
  }

  // Hitung apakah jumlah total halaman (cover depan + isi + cover belakang) genap
  const totalWithCovers = pageImages.length + 2;
  const needBlank = totalWithCovers % 2 !== 0;

  const pages = [
    // Cover depan
    (
      <div key="cover-front" className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#a9744f] to-[#6e4b27] text-center select-none">
        <div className="flex flex-col items-center justify-center text-center h-full w-full">
          <h2 className="text-2xl font-bold text-[#5b3a1b] mb-2">Digital Flipbook</h2>
          <p className="text-white">Click to open the book</p>
        </div>
      </div>
    ),
    // Halaman isi
    ...pageImages.map((img, idx) => (
      <div key={idx} className="w-full h-full flex items-center justify-center bg-white">
        <img
          src={img}
          alt={`Page ${idx + 1}`}
          className="w-full h-full object-contain select-none"
          draggable={false}
          style={{ maxHeight: '100%', maxWidth: '100%' }}
        />
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
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };
  const handleNext = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };
  const onFlip = (e: FlipEvent) => {
    setCurrentPage(e.data);
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

  return (
    <div ref={flipBookContainerRef} className="w-full max-w-6xl mx-auto px-2 sm:px-4">
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
      </div>
      <div className="flex flex-col items-center mt-6 gap-2">
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
          {/* <button
            onClick={handleFullscreen}
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-800 transition flex items-center gap-2"
            type="button"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button> */}
        </div>
      </div>
      <div className="text-center mt-4 text-gray-600">
        <p className="text-sm">
          Click or swipe to turn pages. Total pages: {totalPages}
        </p>
      </div>
    </div>
  );
};

export default FlipBook;
