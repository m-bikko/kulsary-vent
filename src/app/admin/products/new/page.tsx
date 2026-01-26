'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Calculator, Save, Upload, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { evaluate } from 'mathjs';
import Link from 'next/link';

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [materials, setMaterials] = useState<any[]>([]);

    // Form State
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [parameters, setParameters] = useState<any[]>([
        { name: 'Длина', slug: 'l', type: 'number' },
        { name: 'Диаметр', slug: 'd', type: 'number' }
    ]);
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
    const [formula, setFormula] = useState('');

    // Test Bench State
    const [testValues, setTestValues] = useState<Record<string, number>>({});
    const [testResult, setTestResult] = useState<number | null>(null);
    const [testError, setTestError] = useState('');

    useEffect(() => {
        fetch('/api/materials')
            .then(res => res.json())
            .then(data => setMaterials(data))
            .catch(console.error);
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Immediate local preview
        const localUrl = URL.createObjectURL(file);
        setImageUrl(localUrl);
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.secure_url) {
                setImageUrl(data.secure_url);
            } else {
                throw new Error('No url returned');
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('Ошибка загрузки изображения. Проверьте консоль.');
            setImageUrl(''); // Revert if failed
        } finally {
            setUploading(false);
        }
    };

    const addParameter = () => {
        setParameters([...parameters, { name: '', slug: '', type: 'number' }]);
    };

    const removeParameter = (index: number) => {
        setParameters(parameters.filter((_, i) => i !== index));
    };

    const updateParameter = (index: number, field: string, value: string) => {
        const newParams = [...parameters];
        newParams[index] = { ...newParams[index], [field]: value };
        setParameters(newParams);
    };

    const testFormula = () => {
        try {
            setTestError('');
            // Mock scope
            const scope: Record<string, number> = { ...testValues, PI: 3.14 };
            // Also need a mock material price if formula uses it? 
            // User should treat 'MaterialPrice' as a variable if they use it.
            // Or we inject a mock price for testing.
            if (formula.includes('MaterialPrice')) {
                scope['MaterialPrice'] = 1000; // Mock price
            }

            const result = evaluate(formula, scope);
            setTestResult(result);
        } catch (error: any) {
            setTestError(error.message);
            setTestResult(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    imageUrl,
                    parameters,
                    materials: selectedMaterials,
                    formula
                }),
            });

            if (res.ok) {
                router.push('/admin/products');
            } else {
                alert('Ошибка сохранения');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center space-x-4">
                <Link href="/admin/products" className="text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-white">Новый шаблон товара</h2>
                    <p className="text-gray-400">Настройте параметры ввода и формулу расчета</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Основная информация">
                        <div className="space-y-4">
                            <Input
                                label="Название изделия"
                                placeholder="Например: Отвод круглый 90гр"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Изображение</label>
                                <div className="flex items-center space-x-4">
                                    <div className="h-24 w-24 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center relative">
                                        {imageUrl ? (
                                            <>
                                                <img src={imageUrl} alt="Preview" className={`w-full h-full object-cover ${uploading ? 'opacity-50' : ''}`} />
                                                {uploading && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                                            </>
                                        ) : (
                                            uploading ? <Loader2 className="animate-spin text-gray-500" /> : <Upload className="text-gray-600" />
                                        )}
                                    </div>
                                    <label className="cursor-pointer">
                                        <span className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm border border-gray-700 transition-colors inline-block">
                                            Загрузить фото
                                        </span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Параметры ввода (Переменные)">
                        <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-2 text-xs uppercase text-gray-500 font-semibold px-2">
                                <div className="col-span-5">Название (для формы)</div>
                                <div className="col-span-3">Переменная (в формуле)</div>
                                <div className="col-span-3">Тип</div>
                                <div className="col-span-1"></div>
                            </div>
                            {parameters.map((param, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-800/50 p-2 rounded-lg border border-gray-700/50">
                                    <div className="col-span-5">
                                        <input
                                            placeholder="Длина"
                                            className="w-full bg-transparent border-none text-white focus:ring-0 p-0 text-sm"
                                            value={param.name}
                                            onChange={(e) => updateParameter(index, 'name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            placeholder="l"
                                            className="w-full bg-black/20 rounded px-2 py-1 text-green-400 font-mono text-sm border border-transparent focus:border-green-500/50 focus:outline-none"
                                            value={param.slug}
                                            onChange={(e) => updateParameter(index, 'slug', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-3 text-gray-400 text-sm">
                                        Число
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <button type="button" onClick={() => removeParameter(index)} className="text-gray-500 hover:text-red-400 p-1">
                                            <Minus size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <Button type="button" variant="secondary" size="sm" onClick={addParameter} className="w-full mt-2 border-dashed">
                                <Plus size={16} className="mr-2" /> Добавить параметр
                            </Button>
                        </div>
                    </Card>

                    <Card title="Формула расчета цены">
                        <div className="space-y-4">
                            <div className="bg-blue-900/20 text-blue-200 p-4 rounded-lg text-sm border border-blue-900/50">
                                <p className="font-semibold mb-1">Доступные переменные:</p>
                                <div className="flex flex-wrap gap-2 font-mono text-xs">
                                    {parameters.map(p => p.slug && (
                                        <span key={p.slug} className="bg-blue-900/50 px-2 py-1 rounded text-blue-100">{p.slug}</span>
                                    ))}
                                    <span className="bg-purple-900/50 px-2 py-1 rounded text-purple-100 border border-purple-700/50">MaterialPrice</span>
                                    <span className="bg-yellow-900/50 px-2 py-1 rounded text-yellow-100 border border-yellow-700/50">PI</span>
                                </div>
                                <p className="mt-2 text-xs opacity-70">
                                    Используйте обычную математику: +, -, *, /, скобки. Пример: (d * PI) * l * MaterialPrice
                                </p>
                            </div>
                            <textarea
                                className="w-full h-32 bg-gray-950 border border-gray-700 rounded-lg p-4 font-mono text-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="(d * 3.14) * l * MaterialPrice"
                                value={formula}
                                onChange={(e) => setFormula(e.target.value)}
                                required
                            />
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Доступные материалы">
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {materials.map(mat => (
                                <label key={mat._id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer border border-transparent hover:border-gray-700 transition-all">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 h-5 w-5"
                                        checked={selectedMaterials.includes(mat._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedMaterials([...selectedMaterials, mat._id]);
                                            else setSelectedMaterials(selectedMaterials.filter(id => id !== mat._id));
                                        }}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{mat.name}</p>
                                        <p className="text-xs text-gray-500">{mat.price} ₸ / {mat.unit}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {materials.length === 0 && <p className="text-sm text-gray-500">Нет материалов. Добавьте их сначала.</p>}
                    </Card>

                    <Card title="Тестирование формулы">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {parameters.map(p => (
                                    <div key={p.slug}>
                                        <label className="text-xs text-gray-400 mb-1 block">{p.name} ({p.slug})</label>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-800 border-gray-700 rounded px-2 py-1 text-white text-sm"
                                            placeholder="0"
                                            onChange={(e) => setTestValues({ ...testValues, [p.slug]: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="secondary" className="w-full" onClick={testFormula}>
                                <Calculator size={16} className="mr-2" /> Рассчитать
                            </Button>
                            {testResult !== null && (
                                <div className="bg-green-900/20 border border-green-900/50 p-3 rounded-lg text-center">
                                    <span className="text-green-400 font-bold text-xl">{testResult.toFixed(2)} ₸</span>
                                    <p className="text-xs text-green-500/70 mt-1">(При цене материала 1000 ₸)</p>
                                </div>
                            )}
                            {testError && (
                                <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg text-red-400 text-sm">
                                    {testError}
                                </div>
                            )}
                        </div>
                    </Card>

                    <Button type="submit" size="lg" className="w-full" isLoading={loading}>
                        <Save size={20} className="mr-2" /> Сохранить шаблон
                    </Button>
                </div>
            </form>
        </div>
    );
}
