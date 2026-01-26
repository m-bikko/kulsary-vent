'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', contactInfo: '' });
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            setCustomers(data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setFormData({ name: '', contactInfo: '' });
                setIsModalOpen(false);
                fetchCustomers();
            }
        } catch (error) {
            console.error('Error creating customer', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Вы уверены? Удаление заказчика может повлиять на проекты.')) return;
        try {
            await fetch(`/api/customers/${id}`, { method: 'DELETE' });
            fetchCustomers();
        } catch (error) {
            console.error(error);
        }
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contactInfo.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Заказчики</h2>
                    <p className="text-gray-400 mt-1">База данных клиентов</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-5 w-5" />
                    Добавить заказчика
                </Button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 w-full max-w-md flex items-center">
                <Search className="text-gray-500 mr-2 h-5 w-5" />
                <input
                    className="bg-transparent border-none focus:ring-0 text-white w-full placeholder-gray-500"
                    placeholder="Поиск по имени или контактам..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="text-white text-center py-20">Загрузка...</div>
                ) : filtered.length === 0 ? (
                    <Card className="text-center py-20 border-dashed border-gray-700 bg-transparent">
                        <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-300">Список пуст</h3>
                        <p className="text-gray-500 mt-2">Добавьте первого заказчика</p>
                    </Card>
                ) : (
                    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50 text-gray-400 uppercase text-xs font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Имя / Компания</th>
                                    <th className="px-6 py-4">Контакты</th>
                                    <th className="px-6 py-4 text-right">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filtered.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">{customer.name}</td>
                                        <td className="px-6 py-4 text-gray-300">{customer.contactInfo}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(customer._id)}
                                                className="text-gray-500 hover:text-red-400 transition-colors p-2"
                                                title="Удалить"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Новый заказчик"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Имя / Название компании"
                        placeholder="ТОО 'ВентСтрой'"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        autoFocus
                    />
                    <Input
                        label="Контактная информация"
                        placeholder="Телефон, Адрес, E-mail"
                        value={formData.contactInfo}
                        onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                        required
                    />
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Отмена
                        </Button>
                        <Button type="submit" isLoading={submitting}>
                            Создать
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
