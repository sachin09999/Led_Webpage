'use client';
import { X, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCw, RotateCcw, ChevronLeft, ChevronRight, FileText, Download, FileSpreadsheet, Loader2, AlertCircle, FileCheck } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import mammoth from 'mammoth';

export default function FileViewerModal({ file, fileList = [], onClose, onSelectFile }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomScale, setZoomScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Document rendering states for DOCX / TXT files
    const [docHtml, setDocHtml] = useState(null);
    const [docText, setDocText] = useState(null);
    const [docLoading, setDocLoading] = useState(false);
    const [docError, setDocError] = useState(null);

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

    const rawUrl = file?.url || '';
    let resolvedUrl = rawUrl;
    if (typeof window !== 'undefined' && rawUrl.includes(':9005')) {
        const currentHost = window.location.hostname;
        if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
            resolvedUrl = rawUrl.replace(/localhost:9005/g, `${currentHost}:9005`)
                               .replace(/127\.0\.0\.1:9005/g, `${currentHost}:9005`);
        }
    }

    const fileNameLower = file?.name?.toLowerCase() || resolvedUrl.toLowerCase();
    const isVideo = resolvedUrl.match(/\.(mp4|webm|ogg|mov|mkv)$/i) || file?.type === 'video';
    const isImage = resolvedUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || file?.type === 'image';
    const isPdf = resolvedUrl.match(/\.pdf(\?.*)?$/i) || fileNameLower.endsWith('.pdf');
    const isDocx = fileNameLower.endsWith('.docx');
    const isDoc = fileNameLower.endsWith('.doc');
    const isExcel = fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls') || fileNameLower.endsWith('.csv');
    const isPpt = fileNameLower.endsWith('.pptx') || fileNameLower.endsWith('.ppt');
    const isText = fileNameLower.endsWith('.txt') || fileNameLower.endsWith('.json') || fileNameLower.endsWith('.md') || fileNameLower.endsWith('.log') || fileNameLower.endsWith('.xml');

    const [prevUrl, setPrevUrl] = useState(file?.url);

    // Fetch and render DOCX or text files when URL changes
    useEffect(() => {
        setPrevUrl(file?.url);
        setZoomScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
        setDocHtml(null);
        setDocText(null);
        setDocError(null);

        if (!resolvedUrl) return;

        let isMounted = true;

        if (isDocx) {
            setDocLoading(true);
            fetch(resolvedUrl)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                    return res.arrayBuffer();
                })
                .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer }))
                .then(result => {
                    if (isMounted) {
                        setDocHtml(result.value || '<p style="color:#6b7280; text-align:center;">This document is empty.</p>');
                        setDocLoading(false);
                    }
                })
                .catch(err => {
                    console.error("DOCX conversion error:", err);
                    if (isMounted) {
                        setDocError("Could not render formatted DOCX. You can still download the file below.");
                        setDocLoading(false);
                    }
                });
        } else if (isText) {
            setDocLoading(true);
            fetch(resolvedUrl)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                    return res.text();
                })
                .then(text => {
                    if (isMounted) {
                        setDocText(text);
                        setDocLoading(false);
                    }
                })
                .catch(err => {
                    console.error("Text fetch error:", err);
                    if (isMounted) {
                        setDocError("Failed to load text file content.");
                        setDocLoading(false);
                    }
                });
        }

        return () => {
            isMounted = false;
        };
    }, [resolvedUrl, isDocx, isText, file?.url]);

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
                        {resolvedUrl && (
                            <a
                                href={resolvedUrl}
                                download={file.name}
                                title="Download File"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.82rem',
                                    fontWeight: 500,
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    background: 'var(--accent-color, #2563eb)',
                                    color: '#ffffff',
                                    textDecoration: 'none',
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                <Download size={14} />
                                <span>Download</span>
                            </a>
                        )}

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
                                justifyHorizontal: 'center',
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
                        overflow: 'auto',
                        position: 'relative',
                        background: (isDocx || isText || isDoc || isExcel || isPpt) ? 'var(--bg-main, #f8fafc)' : '#000000',
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
                    ) : isPdf ? (
                        <iframe src={iframeUrl} className="viewer-iframe" title={file.name} />
                    ) : isDocx ? (
                        <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '32px 16px', display: 'flex', justifyContent: 'center' }}>
                            {docLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#64748b', margin: 'auto' }}>
                                    <Loader2 size={36} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Formatting Document Preview...</span>
                                </div>
                            ) : docError ? (
                                <DocumentCardFallback file={file} resolvedUrl={resolvedUrl} errorMsg={docError} />
                            ) : (
                                <div 
                                    className="docx-preview-paper"
                                    style={{
                                        background: '#ffffff',
                                        color: '#1e293b',
                                        width: '100%',
                                        maxWidth: '820px',
                                        minHeight: '600px',
                                        padding: '48px 56px',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
                                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                                        lineHeight: '1.75',
                                        fontSize: '1rem',
                                        boxSizing: 'border-box'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: docHtml }}
                                />
                            )}
                        </div>
                    ) : isText ? (
                        <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '24px' }}>
                            {docLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#64748b', height: '100%' }}>
                                    <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
                                    <span>Loading Text Content...</span>
                                </div>
                            ) : docError ? (
                                <DocumentCardFallback file={file} resolvedUrl={resolvedUrl} errorMsg={docError} />
                            ) : (
                                <pre style={{
                                    background: '#0f172a',
                                    color: '#f8fafc',
                                    padding: '24px',
                                    borderRadius: '12px',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    margin: 0,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}>
                                    {docText}
                                </pre>
                            )}
                        </div>
                    ) : (
                        /* Document Overview Card Fallback for Office/Binary formats (.doc, .xlsx, .pptx, etc) */
                        <DocumentCardFallback file={file} resolvedUrl={resolvedUrl} />
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

function DocumentCardFallback({ file, resolvedUrl, errorMsg }) {
    const ext = file?.name?.split('.').pop()?.toUpperCase() || 'DOCUMENT';
    const isSpreadsheet = ['XLS', 'XLSX', 'CSV'].includes(ext);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            padding: '32px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                background: 'var(--card-bg, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '16px',
                padding: '40px 48px',
                maxWidth: '520px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: isSpreadsheet ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)'
                }}>
                    {isSpreadsheet ? <FileSpreadsheet size={40} /> : <FileText size={40} />}
                </div>

                <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
                        {file.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: 'var(--bg-main, #f1f5f9)',
                            color: 'var(--text-muted, #475569)',
                            letterSpacing: '0.5px'
                        }}>
                            {ext} FORMAT
                        </span>
                        {file.size && (
                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                • {file.size}
                            </span>
                        )}
                    </div>
                </div>

                {errorMsg ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e11d48', fontSize: '0.88rem', background: '#ffe4e6', padding: '10px 16px', borderRadius: '8px' }}>
                        <AlertCircle size={18} />
                        <span>{errorMsg}</span>
                    </div>
                ) : (
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted, #64748b)', lineHeight: '1.5' }}>
                        This {ext} document is stored safely in MinIO. You can view its details here or download it to open in Microsoft Office.
                    </p>
                )}

                {resolvedUrl && (
                    <a
                        href={resolvedUrl}
                        download={file.name}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            padding: '12px 28px',
                            borderRadius: '10px',
                            background: 'var(--accent-color, #2563eb)',
                            color: '#ffffff',
                            textDecoration: 'none',
                            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                            transition: 'transform 0.15s, background-color 0.15s'
                        }}
                    >
                        <Download size={18} />
                        <span>Download {ext} File</span>
                    </a>
                )}
            </div>
        </div>
    );
}

