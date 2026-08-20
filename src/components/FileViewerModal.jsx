'use client';
import { X, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCw, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

export default function FileViewerModal({ file, fileList = [], onClose, onSelectFile }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomScale, setZoomScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    const containerRef = useRef(null);

    const currentIndex = fileList.length > 0 
        ? fileList.findIndex(f => (f.id && file.id && f.id === file.id) || (f.url && file.url && f.url === file.url))
        : -1;
    const hasMultipleFiles = fileList.length > 1 && currentIndex !== -1;

    const handlePrevFile = useCallback((e) => {
        if (e) e.stopPropagation();
        if (!hasMultipleFiles || !onSelectFile) return;
        const prevIndex = (currentIndex - 1 + fileList.length) % fileList.length;
        onSelectFile(fileList[prevIndex]);
    }, [hasMultipleFiles, currentIndex, fileList, onSelectFile]);

    const handleNextFile = useCallback((e) => {
        if (e) e.stopPropagation();
        if (!hasMultipleFiles || !onSelectFile) return;
        const nextIndex = (currentIndex + 1) % fileList.length;
        onSelectFile(fileList[nextIndex]);
    }, [hasMultipleFiles, currentIndex, fileList, onSelectFile]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !document.fullscreenElement) {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                handlePrevFile(e);
            } else if (e.key === 'ArrowRight') {
                handleNextFile(e);
            }
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, [onClose, handlePrevFile, handleNextFile]);

    const [prevUrl, setPrevUrl] = useState(file?.url);

    // Reset zoom & transform when file URL changes
    if (file?.url !== prevUrl) {
        setPrevUrl(file?.url);
        setZoomScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            const target = containerRef.current || document.documentElement;
            if (target.requestFullscreen) {
                target.requestFullscreen().catch(err => console.error("Fullscreen failed:", err));
            } else if (target.webkitRequestFullscreen) {
                target.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(err => console.error("Exit fullscreen failed:", err));
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };

    const handleZoomIn = () => {
        setZoomScale(prev => Math.min(prev + 0.25, 5));
    };

    const handleZoomOut = () => {
        setZoomScale(prev => {
            const next = Math.max(prev - 0.25, 0.5);
            if (next <= 1) setPosition({ x: 0, y: 0 });
            return next;
        });
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleResetZoom = () => {
        setZoomScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    };

    const handleWheel = (e) => {
        if (!isImage) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.2 : -0.2;
        setZoomScale(prev => {
            const next = Math.min(Math.max(prev + delta, 0.5), 5);
            if (next <= 1) setPosition({ x: 0, y: 0 });
            return parseFloat(next.toFixed(2));
        });
    };

    const handleMouseDown = (e) => {
        if (!isImage || zoomScale <= 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleImageDoubleClick = () => {
        if (zoomScale > 1 || rotation !== 0 || position.x !== 0 || position.y !== 0) {
            handleResetZoom();
        } else {
            setZoomScale(2);
        }
    };

    const rawUrl = file.url || '';
    let resolvedUrl = rawUrl;
    if (typeof window !== 'undefined' && rawUrl.includes(':9005')) {
        const currentHost = window.location.hostname;
        if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
            resolvedUrl = rawUrl.replace(/localhost:9005/g, `${currentHost}:9005`)
                               .replace(/127\.0\.0\.1:9005/g, `${currentHost}:9005`);
        }
    }

    const isVideo = resolvedUrl.match(/\.(mp4|webm|ogg)$/i) || file.type === 'video';
    const isImage = resolvedUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || file.type === 'image';
    const isPdf = resolvedUrl.match(/\.pdf(\?.*)?$/i) || file.name?.toLowerCase().endsWith('.pdf');

    // Fix PDF zoom to 90% so documents and drawings fit comfortably in full screen without over-zooming
    const iframeUrl = isPdf 
        ? (resolvedUrl.includes('#') 
            ? resolvedUrl.replace(/#.*$/, '#zoom=90') 
            : `${resolvedUrl}#zoom=90`)
        : resolvedUrl;

    return (
        <div className={`viewer-overlay ${isFullscreen ? 'fullscreen-mode' : ''}`} onClick={onClose}>
            <div 
                ref={containerRef}
                className={`viewer-content ${isFullscreen ? 'is-fullscreen' : ''}`} 
                onClick={e => e.stopPropagation()}
                style={{
                    height: isFullscreen ? '100vh' : '90vh',
                    width: isFullscreen ? '100vw' : '100%',
                    maxWidth: isFullscreen ? '100vw' : '1000px',
                    borderRadius: isFullscreen ? '0' : '16px'
                }}
            >
                <div className="viewer-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', minWidth: 0 }}>
                        <h3 style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '1rem' }}>
                            {file.name}
                        </h3>
                        {hasMultipleFiles && (
                            <span className="file-counter-badge" style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: 'var(--bg-main, #f3f4f6)',
                                color: 'var(--text-muted, #6b7280)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                whiteSpace: 'nowrap'
                            }}>
                                {currentIndex + 1} of {fileList.length}
                            </span>
                        )}
                    </div>

                    {/* Image Zoom & Rotation Controls */}
                    {isImage && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-main, #f3f4f6)', padding: '4px 10px', borderRadius: '8px' }}>
                            <button 
                                type="button" 
                                onClick={handleZoomOut} 
                                title="Zoom Out (-)"
                                disabled={zoomScale <= 0.5}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: 'var(--text-main, #111827)', opacity: zoomScale <= 0.5 ? 0.4 : 1 }}
                            >
                                <ZoomOut size={16} />
                            </button>
                            
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '40px', textAlign: 'center', color: 'var(--text-main, #111827)' }}>
                                {Math.round(zoomScale * 100)}%
                            </span>

                            <button 
                                type="button" 
                                onClick={handleZoomIn} 
                                title="Zoom In (+)"
                                disabled={zoomScale >= 5}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: 'var(--text-main, #111827)', opacity: zoomScale >= 5 ? 0.4 : 1 }}
                            >
                                <ZoomIn size={16} />
                            </button>

                            <div style={{ width: '1px', height: '16px', background: 'var(--border-color, #d1d5db)', margin: '0 4px' }} />

                            <button 
                                type="button" 
                                onClick={handleRotate} 
                                title="Rotate 90°"
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: 'var(--text-main, #111827)' }}
                            >
                                <RotateCw size={16} />
                            </button>

                            {(zoomScale !== 1 || rotation !== 0 || position.x !== 0 || position.y !== 0) && (
                                <button 
                                    type="button" 
                                    onClick={handleResetZoom} 
                                    title="Reset Zoom & Position"
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: 'var(--text-main, #111827)' }}
                                >
                                    <RotateCcw size={16} />
                                </button>
                            )}
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                            type="button"
                            className="icon-btn" 
                            onClick={toggleFullscreen} 
                            title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                borderRadius: '50%',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>

                        <button className="close-btn" onClick={onClose} title="Close">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div 
                    className="viewer-body"
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: isImage ? (zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in') : 'default'
                    }}
                >
                    {isVideo ? (
                        <video src={resolvedUrl} controls autoPlay className="viewer-media" />
                    ) : isImage ? (
                        <img 
                            src={resolvedUrl} 
                            alt={file.name} 
                            className="viewer-media" 
                            onDoubleClick={handleImageDoubleClick} 
                            title="Double-click to toggle 2x zoom | Scroll wheel to zoom | Click and drag to pan"
                            draggable={false}
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoomScale}) rotate(${rotation}deg)`,
                                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                                maxHeight: '100%',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                userSelect: 'none'
                            }}
                        />
                    ) : (
                        <iframe src={iframeUrl} className="viewer-iframe" title={file.name} />
                    )}

                    {/* Mid-Left Overlay Previous Button */}
                    {hasMultipleFiles && (
                        <button
                            type="button"
                            className="viewer-nav-btn prev"
                            onClick={handlePrevFile}
                            title="Previous File (Left Arrow)"
                        >
                            <ChevronLeft size={28} />
                        </button>
                    )}

                    {/* Mid-Right Overlay Next Button */}
                    {hasMultipleFiles && (
                        <button
                            type="button"
                            className="viewer-nav-btn next"
                            onClick={handleNextFile}
                            title="Next File (Right Arrow)"
                        >
                            <ChevronRight size={28} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
