import React, { useState, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import HTMLFlipBook from 'react-pageflip';

// Set up PDF.js worker untuk Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface FlipBookProps {
  pdfUrl: string;
}

const FlipBook: React.FC<FlipBookProps> = ({ pdfUrl }) => {
  const [totalPages, setTotalPages] = useState(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pdfDocRef = useRef<any>(null);

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

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
      <div className="flex justify-center">
        <HTMLFlipBook
          width={320}
          height={480}
          size="stretch"
          minWidth={220}
          maxWidth={800}
          minHeight={300}
          maxHeight={900}
          drawShadow={true}
          flippingTime={700}
          usePortrait={true}
          startZIndex={0}
          autoSize={true}
          className="mx-auto shadow-2xl"
          style={{ width: '100%', maxWidth: 400, height: 'auto' }}
          startPage={0}
          maxShadowOpacity={0.5}
          showCover={false}
          mobileScrollSupport={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          disableFlipByClick={false}
          showPageCorners={true}
        >
          {pageImages.map((img, idx) => (
            <div
              key={idx}
              className="w-full h-full flex items-center justify-center bg-white"
              style={{ minHeight: 300 }}
            >
              <img
                src={img}
                alt={`Page ${idx + 1}`}
                className="w-full h-full object-contain select-none"
                draggable={false}
                style={{ maxHeight: '100%', maxWidth: '100%' }}
              />
            </div>
          ))}
        </HTMLFlipBook>
      </div>
      <div className="text-center mt-6 text-gray-600">
        <p className="text-sm">
          Click or swipe to turn pages. Total pages: {totalPages}
        </p>
      </div>
    </div>
  );
};

export default FlipBook;
