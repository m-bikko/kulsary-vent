import React, { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ProductCatalogProps {
    templates: any[];
    onSelect: (template: any) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ templates, onSelect }) => {
    const [search, setSearch] = useState('');

    const filtered = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="h-full flex flex-col bg-gray-900 border-r border-gray-800 w-80 md:w-96">
            <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-bold text-white mb-3">Каталог</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <input
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Поиск изделия..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filtered.map(template => (
                    <div
                        key={template._id}
                        onClick={() => onSelect(template)}
                        className="group flex items-center p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors border border-transparent hover:border-gray-700"
                    >
                        <div className="h-10 w-10 bg-gray-800 rounded flex items-center justify-center flex-shrink-0 text-gray-500 object-cover overflow-hidden">
                            {template.imageUrl ? (
                                <img src={template.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                                <Package size={18} />
                            )}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-200 group-hover:text-white">{template.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {template.parameters.slice(0, 3).map((p: any) => (
                                    <span key={p.slug} className="text-[10px] bg-gray-800 text-gray-500 px-1 rounded">{p.slug}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
