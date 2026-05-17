import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';

export default function MediaViewer({ isOpen, onClose, mediaItems = [], initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    containScroll: 'trimSnaps',
    dragFree: true,
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(currentIndex);
    }
  }, [emblaApi, currentIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  }, [mediaItems.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  }, [mediaItems.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (!isOpen || mediaItems.length === 0) return null;

  const currentMedia = mediaItems[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center backdrop-blur-sm"
        onDoubleClick={onClose}
      >
        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-[110] bg-gradient-to-b from-black/50 to-transparent">
          <div className="text-white text-sm font-medium">
            {currentIndex + 1} / {mediaItems.length}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Main Media Display */}
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-full max-h-full flex items-center justify-center select-none"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x;
              if (swipe < -100) handleNext();
              else if (swipe > 100) handlePrev();
            }}
          >
            {currentMedia.media_type === 'image' ? (
              <img
                src={currentMedia.media_url}
                alt="Media"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl pointer-events-none"
              />
            ) : (
              <div className="relative group">
                <video
                  src={currentMedia.media_url}
                  className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                  autoPlay={isPlaying}
                  muted={isMuted}
                  loop
                  controls
                />
                <div className="absolute bottom-16 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-black/50 text-white border-0 backdrop-blur-md"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-black/50 text-white border-0 backdrop-blur-md"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation Arrows */}
          {mediaItems.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12 hidden md:flex"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12 hidden md:flex"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail Carousel Below */}
        {mediaItems.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-4xl mx-auto overflow-hidden" ref={emblaRef}>
              <div className="flex gap-2">
                {mediaItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                      index === currentIndex ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    {item.media_type === 'image' ? (
                      <img src={item.media_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
