'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnalyticsDashboard } from '@/components/leads/AnalyticsDashboard';
import { LeadCard } from '@/components/leads/LeadCard';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

const COLUMNS = [
    { id: 'new', title: 'Лиды', color: 'border-blue-500' },
    { id: 'discussion', title: 'В обсуждении', color: 'border-yellow-500' },
    { id: 'won', title: 'Успешно', color: 'border-green-500' },
    { id: 'lost', title: 'Провально', color: 'border-red-500' }
];

export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterDate, setFilterDate] = useState('all'); // all, week, month

    // New Lead Form
    const [formData, setFormData] = useState({ title: '', estimatedValue: 0, customerId: '' });
    const [customers, setCustomers] = useState<any[]>([]);

    useEffect(() => {
        fetchLeads();
        fetchCustomers();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads');
            setLeads(await res.json());
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
    };

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            setCustomers(await res.json());
        } catch (error) { console.error(error); }
    };

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Optimistic Update
        const newLeads = Array.from(leads);
        const leadIndex = newLeads.findIndex(l => l._id === draggableId);
        if (leadIndex === -1) return;

        const updatedLead = { ...newLeads[leadIndex], status: destination.droppableId };
        newLeads[leadIndex] = updatedLead;
        setLeads(newLeads);

        // API Update
        try {
            await fetch(`/api/leads/${draggableId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: destination.droppableId })
            });
        } catch (error) {
            console.error('Failed to update status', error);
            fetchLeads(); // Revert on error
        }
    };

    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    estimatedValue: formData.estimatedValue,
                    customer: formData.customerId
                })
            });
            if (res.ok) {
                setFormData({ title: '', estimatedValue: 0, customerId: '' });
                setIsModalOpen(false);
                fetchLeads();
            }
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить лид?')) return;
        try {
            await fetch(`/api/leads/${id}`, { method: 'DELETE' });
            fetchLeads();
        } catch (error) { console.error(error); }
    };

    // Filter Logic
    const filteredLeads = leads.filter(lead => {
        if (filterDate === 'all') return true;
        const date = new Date(lead.createdAt);
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
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white">CRM / Лиды</h2>
                    <p className="text-gray-400">Управление сделками</p>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        className="bg-gray-800 border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    >
                        <option value="all">За все время</option>
                        <option value="week">За неделю</option>
                        <option value="month">За месяц</option>
                    </select>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-2 h-5 w-5" /> Новый лид
                    </Button>
                </div>
            </div>

            <AnalyticsDashboard leads={filteredLeads} />

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="flex h-full gap-4 min-w-[1000px]">
                        {COLUMNS.map(col => {
                            const colLeads = filteredLeads.filter(l => l.status === col.id);
                            return (
                                <div key={col.id} className="flex-1 flex flex-col bg-gray-900/50 rounded-xl border border-gray-800 min-w-[250px]">
                                    <div className={`p-4 border-b border-gray-800 border-t-4 ${col.color} rounded-t-xl bg-gray-900`}>
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-white">{col.title}</h3>
                                            <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">{colLeads.length}</span>
                                        </div>
                                    </div>
                                    <Droppable droppableId={col.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`flex-1 p-3 overflow-y-auto custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-gray-800/30' : ''}`}
                                            >
                                                {colLeads.map((lead, index) => (
                                                    <LeadCard key={lead._id} lead={lead} index={index} onDelete={handleDelete} />
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Новый лид">
                <form onSubmit={handleCreateLead} className="space-y-4">
                    <Input
                        label="Название"
                        placeholder="Заказ на вентиляцию..."
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Заказчик</label>
                        <select
                            className="w-full bg-gray-800 border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                            value={formData.customerId}
                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                            required
                        >
                            <option value="">Выберите заказчика...</option>
                            {customers.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <Input
                        type="number"
                        label="Ожидаемая сумма (₸)"
                        value={formData.estimatedValue}
                        onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
                    />
                    <div className="flex justify-end pt-4">
                        <Button type="submit">Создать</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
