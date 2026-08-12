'use client';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function FileViewerModal({ file, onClose }) {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!file) return null;

    const isVideo = file.url.match(/\.(mp4|webm|ogg)$/i) || file.type === 'video';
    const isImage = file.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || file.type === 'image';

    return (
        <div className="viewer-overlay" onClick={onClose}>
            <div className="viewer-content" onClick={e => e.stopPropagation()}>
                <div className="viewer-header">
                    <h3>{file.name}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="viewer-body">
                    {isVideo ? (
                        <video src={file.url} controls autoPlay className="viewer-media" />
                    ) : isImage ? (
                        <img src={file.url} alt={file.name} className="viewer-media" />
                    ) : (
                        <iframe src={file.url} className="viewer-iframe" title={file.name} />
                    )}
                </div>
            </div>
        </div>
    );
}
