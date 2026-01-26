import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, User, DollarSign, Trash2, Box } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface ProjectCardProps {
    project: any;
    index: number;
    onDelete?: (id: string, e: React.MouseEvent) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onDelete }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/projects/${project._id}`);
    };

    return (
        <Draggable draggableId={project._id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={handleClick}
                    className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-3 cursor-pointer group hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all shadow-sm dark:shadow-none ${snapshot.isDragging ? 'shadow-2xl z-50 ring-2 ring-blue-500' : ''
                        }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                            {format(new Date(project.createdAt), 'dd MMM', { locale: ru })}
                        </span>
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(project._id, e);
                                }}
                                className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>

                    <h4 className="font-bold text-white mb-1 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                        {project.name}
                    </h4>

                    <div className="flex items-center text-xs text-gray-400 mb-3">
                        <User size={12} className="mr-1.5" />
                        <span className="truncate max-w-[150px]">{project.customer?.name || 'Нет заказчика'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-800 mt-2">
                        <div className="flex items-center text-xs text-gray-500" title="Количество позиций">
                            <Box size={12} className="mr-1.5" />
                            {project.items?.length || 0}
                        </div>
                        <div className="flex items-center font-bold text-green-400 text-sm">
                            {(project.totalPrice || 0).toLocaleString('ru-RU')} ₸
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};
