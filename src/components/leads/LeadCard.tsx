import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, User, DollarSign, Trash2 } from 'lucide-react';

interface LeadCardProps {
    lead: any;
    index: number;
    onDelete: (id: string) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, index, onDelete }) => {
    const formattedDate = new Date(lead.createdAt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
    });

    return (
        <Draggable draggableId={lead._id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                    className={`bg-gray-800 p-3 rounded-lg mb-2 shadow-sm border border-gray-700 group hover:border-gray-500 transition-colors ${snapshot.isDragging ? 'opacity-50' : ''}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white text-sm">{lead.title}</h4>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(lead._id); }}
                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-400">
                            <User size={12} className="mr-1.5" />
                            <span className="truncate max-w-[150px]">{lead.customer?.name}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-400">
                            <Calendar size={12} className="mr-1.5" />
                            <span>{formattedDate}</span>
                        </div>
                        {lead.project ? (
                            <div className="flex items-center text-xs text-green-400 font-medium">
                                <DollarSign size={12} className="mr-1.5" />
                                <span>{lead.project.name} ({lead.estimatedValue?.toLocaleString()} ₸)</span>
                            </div>
                        ) : (
                            <div className="flex items-center text-xs text-gray-500">
                                <DollarSign size={12} className="mr-1.5" />
                                <span>{lead.estimatedValue?.toLocaleString() || 0} ₸</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};
