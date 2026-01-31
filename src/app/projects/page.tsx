'use client';

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import Link from 'next/link';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { AnalyticsDashboard } from '@/components/leads/AnalyticsDashboard';
import { ProjectCard } from '@/components/projects/ProjectCard';
import LoadingScreen from '@/components/ui/LoadingScreen';

const COLUMNS = [
    { id: 'new', title: 'Новые', color: 'border-blue-500', bg: 'bg-blue-500' },
    { id: 'discussion', title: 'В работе', color: 'border-yellow-500', bg: 'bg-yellow-500' },
    { id: 'won', title: 'Завершенные', color: 'border-green-500', bg: 'bg-green-500' },
    { id: 'lost', title: 'Отмененные', color: 'border-red-500', bg: 'bg-red-500' }
];

export default function ProjectsKanbanPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('all');

    // Create Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', customer: '' });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchProjects();
        fetchCustomers();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            // Ensure status exists
            const safeData = data.map((p: any) => ({
                ...p,
                status: p.status || 'new'
            }));
            setProjects(safeData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            setCustomers(await res.json());
        } catch (error) { console.error(error); }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newProject, status: 'new' }),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setNewProject({ name: '', customer: '' });
                fetchProjects();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (!confirm('Вы уверены, что хотите удалить проект?')) return;

        // Optimistic
        setProjects(prev => prev.filter(p => p._id !== id));

        try {
            await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error(error);
            fetchProjects(); // Revert
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Optimistic Update
        const newProjects = [...projects];
        const projectIndex = newProjects.findIndex(p => p._id === draggableId);
        if (projectIndex === -1) return;

        const updatedProject = { ...newProjects[projectIndex], status: destination.droppableId };
        newProjects[projectIndex] = updatedProject; // In a real list we might move index too, but for filtered columns status is enough
        setProjects(newProjects);

        try {
            await fetch(`/api/projects/${draggableId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: destination.droppableId })
            });
        } catch (error) {
            console.error('Failed to update status', error);
            fetchProjects();
        }
    };

    // Filter Logic
    const filteredProjects = projects.filter(p => {
        if (filterDate === 'all') return true;
        const date = new Date(p.createdAt);
        const now = new Date();
        if (filterDate === 'week') {
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return date >= weekAgo;
        }
        if (filterDate === 'month') {
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return date >= monthAgo;
        }
        return true;
    });

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Проекты (CRM)</h1>
                    <p className="text-gray-400 mt-1">Канбан-доска для управления заказами</p>
                </div>
                <div className="flex items-center space-x-3">
                    <select
                        className="bg-gray-800 border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    >
                        <option value="all">За все время</option>
                        <option value="week">За неделю</option>
                        <option value="month">За месяц</option>
                    </select>
                    <Button onClick={() => setIsModalOpen(true)} size="lg" className="shadow-blue-500/20 shadow-lg">
                        <Plus className="mr-2 h-5 w-5" />
                        Новый проект
                    </Button>
                </div>
            </div>

            <AnalyticsDashboard leads={filteredProjects} />

            {isLoading ? (
                <div className="flex-1 flex flex-col min-h-[400px]">
                    <LoadingScreen fullScreen={false} />
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className="flex h-full gap-4 min-w-[1000px]">
                            {COLUMNS.map(col => {
                                const colProjects = filteredProjects.filter(p => p.status === col.id);
                                return (
                                    <div key={col.id} className="flex-1 flex flex-col bg-white dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-800 min-w-[280px] shadow-sm dark:shadow-none">
                                        <div className={`p-4 border-b border-gray-200 dark:border-gray-800 border-t-4 ${col.color} rounded-t-xl bg-gray-50 dark:bg-gray-900`}>
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{col.title}</h3>
                                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full text-white ${col.bg}`}>
                                                    {colProjects.length}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {colProjects.reduce((sum, p) => sum + (p.totalPrice || 0), 0).toLocaleString('ru-RU')} ₸
                                            </div>
                                        </div>

                                        <Droppable droppableId={col.id}>
                                            {(provided, snapshot) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className={`flex-1 p-3 overflow-y-auto custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-gray-800/50' : ''}`}
                                                >
                                                    {colProjects.map((project, index) => (
                                                        <ProjectCard
                                                            key={project._id}
                                                            project={project}
                                                            index={index}
                                                            onDelete={handleDelete}
                                                        />
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                );
                            })}
                        </div>
                    </DragDropContext>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Создание проекта">
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input
                        label="Название проекта"
                        placeholder="Например: ЖК Асыл Арман, Блок 3"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        required
                        autoFocus
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Заказчик</label>
                        <select
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newProject.customer}
                            onChange={(e) => setNewProject({ ...newProject, customer: e.target.value })}
                            required
                        >
                            <option value="">Выберите заказчика</option>
                            {customers.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                        <div className="mt-2 text-right">
                            <Link href="/admin/customers" className="text-xs text-blue-400 hover:text-blue-300">
                                + Добавить нового заказчика
                            </Link>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Отмена</Button>
                        <Button type="submit" isLoading={isCreating}>Создать проект</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
