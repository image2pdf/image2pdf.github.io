import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  UploadCloud,
  Trash2,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Download,
  Settings2,
  Plus,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  GripVertical,
  Maximize2,
  FolderOpen
} from 'lucide-react';

const PAGE_SIZES = {
  a4: { name: 'A4 (Standard 210 × 297 mm)', width: 595.28, height: 841.89 },
  letter: { name: 'US Letter (8.5 × 11 in)', width: 612.0, height: 792.0 },
  fit: { name: 'Fit to Image Dimensions', width: null, height: null },
};

const MARGIN_SIZES = {
  none: { name: 'No Margin (0 mm)', value: 0 },
  small: { name: 'Small (5 mm)', value: 14.17 },
  standard: { name: 'Standard (10 mm)', value: 28.35 },
};

export default function ImageToPdf() {
  const [images, setImages] = useState([]);
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState('auto');
  const [margin, setMargin] = useState('none');
  const [customFilename, setCustomFilename] = useState('converted-images');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fileInputRef = useRef(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  // Format file sizes into human readable strings
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Process and load image dimensions
  const processFiles = useCallback(async (files) => {
    const validImageTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
      'image/bmp',
      'image/avif',
    ];

    const imageFiles = Array.from(files).filter(
      (file) =>
        validImageTypes.includes(file.type) ||
        /\.(jpe?g|png|webp|svg|gif|bmp|avif)$/i.test(file.name)
    );

    if (imageFiles.length === 0) {
      showToast('Please select valid image files (JPG, PNG, WebP, SVG, AVIF, BMP).');
      return;
    }

    const newItems = await Promise.all(
      imageFiles.map((file) => {
        return new Promise((resolve) => {
          const previewUrl = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            resolve({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              file,
              name: file.name,
              size: file.size,
              type: file.type || 'image/jpeg',
              previewUrl,
              width: img.naturalWidth || 800,
              height: img.naturalHeight || 600,
              rotation: 0,
            });
          };
          img.onerror = () => {
            resolve({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              file,
              name: file.name,
              size: file.size,
              type: file.type || 'image/jpeg',
              previewUrl,
              width: 800,
              height: 600,
              rotation: 0,
            });
          };
          img.src = previewUrl;
        });
      })
    );

    setImages((prev) => [...prev, ...newItems]);
    showToast(`Added ${newItems.length} image${newItems.length > 1 ? 's' : ''}`);
  }, []);

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Clipboard Paste Support
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        processFiles(e.clipboardData.files);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFiles]);

  // Rotate individual image 90° clockwise
  const handleRotate = (id) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img
      )
    );
  };

  // Move image position left/right
  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  // Delete individual image
  const handleDelete = (id) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      const target = prev.find((img) => img.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return filtered;
    });
  };

  // Clear all images
  const handleClearAll = () => {
    if (images.length === 0) return;
    if (window.confirm('Are you sure you want to remove all selected images?')) {
      images.forEach((img) => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
      setImages([]);
    }
  };

  // Card Drag-to-Reorder handlers
  const handleCardDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCardDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleCardDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setImages((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, item);
      return updated;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleCardDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Render an image onto a Canvas with exact rotation applied and convert to JPEG/PNG bytes
  const renderImageWithRotationToBytes = (item) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const { width: origW, height: origH, rotation } = item;
        const isSwapped = rotation === 90 || rotation === 270;
        const canvas = document.createElement('canvas');
        canvas.width = isSwapped ? origH : origW;
        canvas.height = isSwapped ? origW : origH;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Draw rotated on canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -origW / 2, -origH / 2, origW, origH);

        // Convert to high-quality JPEG (or PNG if transparent)
        const isPng = item.type === 'image/png' || item.name.toLowerCase().endsWith('.png');
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const quality = isPng ? undefined : 0.94;

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error('Canvas export failed'));
              return;
            }
            const buffer = await blob.arrayBuffer();
            resolve({
              bytes: new Uint8Array(buffer),
              isPng,
              effectiveWidth: canvas.width,
              effectiveHeight: canvas.height,
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => reject(new Error(`Failed to load image ${item.name}`));
      img.src = item.previewUrl;
    });
  };

  // Primary PDF Generation Routine
  const handleConvertToPdf = async () => {
    if (images.length === 0) return;

    try {
      setIsConverting(true);
      setConversionProgress(5);
      setCurrentStepIndex(1);
      setStatusMessage('Initializing PDF document structure...');

      const pdfDoc = await PDFDocument.create();
      const marginPt = MARGIN_SIZES[margin].value;
      const total = images.length;

      for (let i = 0; i < total; i++) {
        const item = images[i];
        setCurrentStepIndex(i + 1);
        setStatusMessage(`Processing Page ${i + 1} of ${total}: ${item.name}`);
        setConversionProgress(Math.round(10 + ((i + 0.6) / total) * 75));

        const { bytes, isPng, effectiveWidth, effectiveHeight } =
          await renderImageWithRotationToBytes(item);

        let embeddedImage;
        if (isPng) {
          try {
            embeddedImage = await pdfDoc.embedPng(bytes);
          } catch {
            embeddedImage = await pdfDoc.embedJpg(bytes);
          }
        } else {
          try {
            embeddedImage = await pdfDoc.embedJpg(bytes);
          } catch {
            embeddedImage = await pdfDoc.embedPng(bytes);
          }
        }

        // Determine Page Dimensions
        let pageW, pageH;

        if (pageSize === 'fit') {
          pageW = effectiveWidth + marginPt * 2;
          pageH = effectiveHeight + marginPt * 2;
        } else {
          const standardDim = PAGE_SIZES[pageSize];
          const baseW = standardDim.width;
          const baseH = standardDim.height;

          if (orientation === 'portrait') {
            pageW = Math.min(baseW, baseH);
            pageH = Math.max(baseW, baseH);
          } else if (orientation === 'landscape') {
            pageW = Math.max(baseW, baseH);
            pageH = Math.min(baseW, baseH);
          } else {
            // Auto: match image aspect ratio
            if (effectiveWidth > effectiveHeight) {
              pageW = Math.max(baseW, baseH);
              pageH = Math.min(baseW, baseH);
            } else {
              pageW = Math.min(baseW, baseH);
              pageH = Math.max(baseW, baseH);
            }
          }
        }

        const page = pdfDoc.addPage([pageW, pageH]);

        // Calculate containment scaling inside printable margins
        const availW = Math.max(pageW - marginPt * 2, 10);
        const availH = Math.max(pageH - marginPt * 2, 10);

        const scale = Math.min(availW / effectiveWidth, availH / effectiveHeight);
        const drawW = effectiveWidth * scale;
        const drawH = effectiveHeight * scale;

        const drawX = marginPt + (availW - drawW) / 2;
        const drawY = marginPt + (availH - drawH) / 2;

        page.drawImage(embeddedImage, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        });
      }

      setStatusMessage('Assembling pages and building final PDF...');
      setConversionProgress(94);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      setConversionProgress(100);
      setStatusMessage('PDF successfully created! Starting download...');

      // Trigger automatic download
      const cleanName = customFilename.trim() || 'converted-images';
      const finalFileName = cleanName.endsWith('.pdf') ? cleanName : `${cleanName}.pdf`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = finalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
        setIsConverting(false);
        setConversionProgress(0);
        setStatusMessage('');
        showToast(`Downloaded "${finalFileName}" successfully!`);
      }, 1400);
    } catch (err) {
      console.error('PDF Conversion error:', err);
      setIsConverting(false);
      setConversionProgress(0);
      setStatusMessage('');
      alert('An error occurred during PDF generation. Please ensure images are valid and uncorrupted.');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Hidden File Input for Picker */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif, image/bmp, image/avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs sm:text-sm font-medium border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* When NO images uploaded: Show Large Upload Dropzone */}
      {images.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-4 xs:p-6 sm:p-10 transition-all duration-200">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group border-2 border-dashed rounded-2xl p-6 xs:p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-red-500 bg-red-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-red-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-100/80 text-red-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-200 shadow-sm">
                <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base sm:text-xl font-bold text-slate-900">
                  Drag & drop your images here, or{' '}
                  <span className="text-red-600 underline underline-offset-2 hover:text-red-700">browse files</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Supports JPG, PNG, WebP, SVG, AVIF, BMP
                  <span className="hidden sm:inline"> • Paste from clipboard (<kbd className="px-1.5 py-0.5 bg-slate-200/80 rounded text-[10px] font-mono text-slate-700">Ctrl+V</kbd>)</span>
                </p>
              </div>

              {/* Prominent Mobile Tap Button */}
              <div className="sm:hidden pt-1">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs shadow-md shadow-red-600/20 active:scale-95 transition-transform"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Choose Images</span>
                </button>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-1.5 pt-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> 100% Client-Side Private
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-slate-100 text-slate-700">
                  No File Limits
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-slate-100 text-slate-700">
                  Lossless Quality
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* When images ARE uploaded: Main Upload Box is HIDDEN, showing the clean workspace directly */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-white rounded-2xl border transition-all duration-200 shadow-subtle p-4 xs:p-5 sm:p-8 space-y-6 ${
            isDragOver ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200'
          }`}
        >
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-bold text-xs border border-red-100 flex-shrink-0">
                {images.length} {images.length === 1 ? 'Image' : 'Images'}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Arrange & Customize Pages
              </h3>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isConverting}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer border border-red-200/60 active:scale-95 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Add More</span>
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isConverting}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Thumbnail Cards Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {images.map((item, index) => {
              const isDragging = draggedIndex === index;
              const isDragTarget = dragOverIndex === index;

              return (
                <div
                  key={item.id}
                  draggable={!isConverting}
                  onDragStart={(e) => handleCardDragStart(e, index)}
                  onDragOver={(e) => handleCardDragOver(e, index)}
                  onDrop={(e) => handleCardDrop(e, index)}
                  onDragEnd={handleCardDragEnd}
                  className={`group relative flex flex-col bg-white rounded-xl border transition-all duration-200 shadow-sm overflow-hidden ${
                    isDragging
                      ? 'opacity-40 border-red-400 scale-95 shadow-none'
                      : isDragTarget
                      ? 'border-red-500 ring-2 ring-red-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* Card Top: Page Number Badge & Actions */}
                  <div className="flex items-center justify-between p-2 sm:p-2.5 bg-slate-50/80 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                      <span className="font-bold text-slate-800 truncate">Page {index + 1}</span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        disabled={isConverting}
                        onClick={() => handleRotate(item.id)}
                        title="Rotate 90° clockwise"
                        className="p-1.5 sm:p-1 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer active:scale-90 disabled:opacity-40"
                      >
                        <RotateCw className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isConverting}
                        onClick={() => handleDelete(item.id)}
                        title="Remove image"
                        className="p-1.5 sm:p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer active:scale-90 disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Image Preview Box */}
                  <div className="relative w-full h-36 xs:h-40 sm:h-44 bg-slate-100 flex items-center justify-center p-2.5 sm:p-3 overflow-hidden select-none">
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      style={{
                        transform: `rotate(${item.rotation}deg)`,
                        transition: 'transform 0.2s ease-in-out',
                      }}
                      className="max-w-full max-h-full object-contain drop-shadow-sm rounded"
                    />

                    {/* Quick Fullscreen Preview Overlay */}
                    <button
                      type="button"
                      onClick={() => setPreviewModalImg(item)}
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-white opacity-100 xs:opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-sm cursor-pointer"
                      title="Preview large image"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Rotation indicator if rotated */}
                    {item.rotation !== 0 && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold shadow-sm">
                        {item.rotation}°
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Details & Reorder Arrows */}
                  <div className="p-2 sm:p-2.5 flex items-center justify-between text-xs bg-white border-t border-slate-100 gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate text-[11px] sm:text-xs" title={item.name}>{item.name}</p>
                      <p className="text-slate-400 text-[10px] truncate">
                        {formatFileSize(item.size)} • {item.width}×{item.height}
                      </p>
                    </div>

                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        type="button"
                        disabled={index === 0 || isConverting}
                        onClick={() => handleMove(index, -1)}
                        title="Move earlier"
                        className="p-1.5 sm:p-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer active:scale-90"
                      >
                        <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === images.length - 1 || isConverting}
                        onClick={() => handleMove(index, 1)}
                        title="Move later"
                        className="p-1.5 sm:p-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer active:scale-90"
                      >
                        <ArrowRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Layout Options Configuration Panel */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Settings2 className="w-4 h-4 text-red-600 flex-shrink-0" />
              PDF Document Settings
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {/* Page Size */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Page Size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                  disabled={isConverting}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-xs font-medium text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow appearance-none disabled:bg-slate-100"
                >
                  <option value="a4">A4 (Standard 210 × 297 mm)</option>
                  <option value="letter">US Letter (8.5 × 11 in)</option>
                  <option value="fit">Fit to Image Size</option>
                </select>
              </div>

              {/* Page Orientation */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  disabled={pageSize === 'fit' || isConverting}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-xs font-medium text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow disabled:bg-slate-100 disabled:text-slate-400 appearance-none"
                >
                  <option value="auto">Auto (Detect per image)</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              {/* Margins */}
              <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Page Margins
                </label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  disabled={isConverting}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-xs font-medium text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow appearance-none disabled:bg-slate-100"
                >
                  <option value="none">No Margin (0 mm)</option>
                  <option value="small">Small (5 mm)</option>
                  <option value="standard">Standard (10 mm)</option>
                </select>
              </div>
            </div>

            {/* Filename customization */}
            <div className="pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                Output Filename:
              </label>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  disabled={isConverting}
                  placeholder="converted-images"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-12 font-mono disabled:bg-slate-100"
                />
                <span className="absolute right-3 top-2 text-xs font-medium text-slate-400 font-mono">
                  .pdf
                </span>
              </div>
            </div>
          </div>

          {/* Dedicated High-Clarity Processing Banner (Shown when converting) */}
          {isConverting && (
            <div className="bg-gradient-to-r from-red-50/90 via-rose-50/70 to-red-50/90 border border-red-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm animate-in fade-in zoom-in-98 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-600/30 flex-shrink-0">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Generating Your PDF Document...</span>
                    </h4>
                    <p className="text-xs text-slate-600 truncate font-medium mt-0.5">
                      {statusMessage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <span className="text-xs font-bold text-red-700 bg-white/90 border border-red-200/80 px-3 py-1 rounded-full shadow-xs">
                    {conversionProgress}% Completed
                  </span>
                </div>
              </div>

              {/* High-Visibility Animated Progress Bar */}
              <div className="w-full h-3 bg-white/80 rounded-full overflow-hidden p-0.5 border border-red-200/70 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${Math.max(conversionProgress, 6)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-0.5">
                <span>RAM-based client conversion</span>
                <span>Page {currentStepIndex} of {images.length}</span>
              </div>
            </div>
          )}

          {/* Action Bar / Convert CTA */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Zero uploads. Compiles completely inside your browser RAM.</span>
            </div>

            <div className="flex items-center w-full sm:w-auto">
              <button
                type="button"
                disabled={isConverting}
                onClick={handleConvertToPdf}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm sm:text-base font-bold rounded-xl shadow-md shadow-red-600/25 transition-all duration-150 disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white flex-shrink-0" />
                    <span>Processing PDF ({conversionProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform flex-shrink-0" />
                    <span>Convert & Download PDF ({images.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewModalImg && (
        <div
          onClick={() => setPreviewModalImg(null)}
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] p-4 sm:p-6 shadow-2xl flex flex-col space-y-3 sm:space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                  {previewModalImg.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                  {previewModalImg.width} × {previewModalImg.height} px •{' '}
                  {formatFileSize(previewModalImg.size)} • {previewModalImg.rotation}°
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              >
                Close
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-auto bg-slate-50 rounded-xl p-3 sm:p-4 min-h-0">
              <img
                src={previewModalImg.previewUrl}
                alt={previewModalImg.name}
                style={{ transform: `rotate(${previewModalImg.rotation}deg)` }}
                className="max-h-[60vh] max-w-full object-contain rounded drop-shadow"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
