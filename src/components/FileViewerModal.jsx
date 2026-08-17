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
                        <video src={resolvedUrl} controls autoPlay className="viewer-media" />
                    ) : isImage ? (
                        <img src={resolvedUrl} alt={file.name} className="viewer-media" />
                    ) : (
                        <iframe src={resolvedUrl} className="viewer-iframe" title={file.name} />
                    )}
                </div>
            </div>
        </div>
    );
}
