import React from 'react';
import { Trash2, Edit2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { calculateItemUnitPrice } from '@/lib/calculations';

interface EstimateProps {
    items: any[];
    onRemove: (index: number) => void;
    onEdit: (item: any, index: number) => void;
    onGeneratePDF: () => void;
}

export const Estimate: React.FC<EstimateProps> = ({ items, onRemove, onEdit, onGeneratePDF }) => {

    const totalSum = items.reduce((sum, item) => {
        const unit = calculateItemUnitPrice(item);
        return sum + (unit * (item.quantity || 1));
    }, 0);

    return (
        <div className="flex-1 flex flex-col h-full bg-black/20">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur">
                <div>
                    <h2 className="text-lg font-bold text-white">Смета</h2>
                    <p className="text-xs text-gray-500">{items.length} позиций</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase">Итого</p>
                    <p className="text-xl font-bold text-green-400">{totalSum.toLocaleString('ru-RU')} ₸</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p>Смета пуста</p>
                        <p className="text-xs mt-1">Выберите товар из каталога слева</p>
                    </div>
                ) : (
                    items.map((item, index) => {
                        const unitPrice = calculateItemUnitPrice(item);
                        const total = unitPrice * item.quantity;

                        return (
                            <div
                                key={index}
                                className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors group flex gap-4"
                            >
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-200">{item.template.name}</h4>
                                        <span className="text-green-400 font-mono font-bold">{total.toLocaleString('ru-RU')} ₸</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 my-2 text-xs text-gray-400">
                                        {item.template.parameters.map((p: any) => (
                                            <span key={p.slug} className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">
                                                {p.name}: {item.params[p.slug]}
                                            </span>
                                        ))}
                                        {item.material && (
                                            <span className="bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-900/50">
                                                {item.material.name}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-end mt-2">
                                        <span className="text-xs text-gray-500">
                                            {item.quantity} шт x {unitPrice.toLocaleString('ru-RU')} ₸
                                        </span>
                                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onEdit(item, index)} className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => onRemove(index)} className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-900">
                <Button className="w-full" size="lg" onClick={onGeneratePDF} disabled={items.length === 0}>
                    <FileDown className="mr-2 h-5 w-5" />
                    Скачать КП (PDF)
                </Button>
            </div>
        </div>
    );
}
