'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { IMaterial } from '@/models/Material'; // Type only

export default function MaterialsPage() {
    const [materials, setMaterials] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', price: '', unit: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const res = await fetch('/api/materials');
            const data = await res.json();
            setMaterials(data);
        } catch (error) {
            console.error('Failed to fetch materials', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/materials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    unit: formData.unit
                }),
            });
            if (res.ok) {
                setFormData({ name: '', price: '', unit: '' });
                setIsModalOpen(false);
                fetchMaterials();
            }
        } catch (error) {
            console.error('Error creating material', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Вы уверены?')) return;
        try {
            await fetch(`/api/materials/${id}`, { method: 'DELETE' });
            fetchMaterials();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Материалы</h2>
                    <p className="text-gray-400 mt-1">Управление справочником материалов и цен</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-5 w-5" />
                    Добавить материал
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="text-white text-center py-20">Загрузка...</div>
                ) : materials.length === 0 ? (
                    <Card className="text-center py-20 border-dashed border-gray-700 bg-transparent">
                        <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-300">Список пуст</h3>
                        <p className="text-gray-500 mt-2">Добавьте первый материал, чтобы начать работу</p>
                    </Card>
                ) : (
                    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50 text-gray-400 uppercase text-xs font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Название</th>
                                    <th className="px-6 py-4">Ед. измерения</th>
                                    <th className="px-6 py-4">Цена</th>
                                    <th className="px-6 py-4 text-right">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {materials.map((material) => (
                                    <tr key={material._id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">{material.name}</td>
                                        <td className="px-6 py-4 text-gray-300">{material.unit}</td>
                                        <td className="px-6 py-4 text-green-400 font-mono">
                                            {material.price.toLocaleString('ru-RU')} ₸
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(material._id)}
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
                title="Новый материал"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Название"
                        placeholder="Например: Оцинкованная сталь 0.5мм"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        autoFocus
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Цена (₸)"
                            type="number"
                            placeholder="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                        <Input
                            label="Ед. измерения"
                            placeholder="м2, кг, шт"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            required
                        />
                    </div>
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
