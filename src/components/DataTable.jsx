'use client';
import { MoreVertical, FileText, PlaySquare, PenTool, Image as ImageIcon, PieChart, LifeBuoy } from 'lucide-react';

const iconMap = {
    FileText,
    PlaySquare,
    PenTool,
    ImageIcon,
    PieChart,
    LifeBuoy
};

export default function DataTable({ files, onFileClick, onEdit, onDelete }) {
    if (!files || files.length === 0) {
        return <p className="text-gray" style={{ padding: '16px 24px' }}>No files found.</p>;
    }
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Date Added</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file, idx) => {
                        const Icon = iconMap[file.icon] || FileText;
                        return (
                            <tr key={file.id || idx} onClick={() => onFileClick && onFileClick(file)} style={{ cursor: 'pointer' }}>
                                <td><Icon className={file.iconColor} size={20} /></td>
                                <td className="font-medium">{file.name}</td>
                                <td><span className={`tag ${file.tagColor}`}>{file.category}</span></td>
                                <td className="text-gray">{file.date}</td>
                                <td>
                                    {(onEdit || onDelete) ? (
                                        <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                                            {onEdit && <button className="outline-btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => onEdit(file)}>Edit</button>}
                                            {onDelete && <button className="outline-btn" style={{ padding: '4px 8px', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => onDelete(file.id)}>Delete</button>}
                                        </div>
                                    ) : (
                                        <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); /* option menu logic */ }}>
                                            <MoreVertical size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
