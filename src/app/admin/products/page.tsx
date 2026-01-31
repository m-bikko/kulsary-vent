'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function ProductsPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setTemplates(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Вы уверены? Это может повлиять на существующие проекты.')) return;
        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
            fetchTemplates();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Шаблоны товаров</h2>
                    <p className="text-gray-400 mt-1">Конструктор типов изделий с формулами расчета</p>
                </div>
                <Link href="/admin/products/new">
                    <Button>
                        <Plus className="mr-2 h-5 w-5" />
                        Создать шаблон
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full">
                        <LoadingScreen fullScreen={false} />
                    </div>
                ) : templates.length === 0 ? (
                    <div className="col-span-full">
                        <Card className="text-center py-20 border-dashed border-gray-700 bg-transparent">
                            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-300">Нет шаблонов</h3>
                            <p className="text-gray-500 mt-2">Создайте первый шаблон товара</p>
                        </Card>
                    </div>
                ) : (
                    templates.map((template) => (
                        <Card key={template._id} className="relative group hover:border-gray-600 transition-colors">
                            <div className="aspect-video bg-gray-800 rounded-lg mb-4 overflow-hidden relative">
                                {template.imageUrl ? (
                                    <img src={template.imageUrl} alt={template.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <Package size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                    <Link href={`/admin/products/${template._id}`}>
                                        <Button variant="secondary" size="sm">
                                            <Edit2 size={16} />
                                        </Button>
                                    </Link>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(template._id)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{template.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {template.parameters.map((p: any) => (
                                    <span key={p.slug} className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                                        {p.name}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-3 font-mono truncate bg-gray-950 p-2 rounded">
                                f = {template.formula}
                            </p>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
