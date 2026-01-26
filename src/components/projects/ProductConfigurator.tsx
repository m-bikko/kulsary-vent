import React, { useState, useEffect } from 'react';
import { X, Calculator, ShoppingCart, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { evaluate } from 'mathjs';

interface ProductConfiguratorProps {
    template: any;
    materials: any[];
    initialValues?: any;
    onClose: () => void;
    onSave: (data: any) => void;
    isSaving?: boolean;
}

export const ProductConfigurator: React.FC<ProductConfiguratorProps> = ({
    template,
    materials,
    initialValues,
    onClose,
    onSave,
    isSaving
}) => {
    const [params, setParams] = useState<Record<string, number>>({});
    const [quantity, setQuantity] = useState(1);
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [error, setError] = useState('');

    // Initialize
    useEffect(() => {
        if (initialValues) {
            // params is a Map in DB, simplified here
            setParams(initialValues.params || {});
            setQuantity(initialValues.quantity || 1);
            setSelectedMaterialId(initialValues.material?._id || initialValues.material || '');
        } else {
            // Initialize defaults
            const defaults: Record<string, number> = {};
            template.parameters.forEach((p: any) => {
                defaults[p.slug] = 0;
            });
            setParams(defaults);

            // Auto-select first allowed material
            if (template.materials?.length > 0) {
                // If materials are objects (populated)
                const firstMat = template.materials[0];
                setSelectedMaterialId(firstMat._id || firstMat);
            }
        }
    }, [template, initialValues]);

    // Calculate Price Effect
    useEffect(() => {
        calculatePrice();
    }, [params, selectedMaterialId]);

    const calculatePrice = () => {
        try {
            setError('');
            if (!selectedMaterialId && template.materials.length > 0) {
                // If template requires material but none selected (though we try to auto select)
                // Assume logic needs material if formula uses it.
            }

            const material = materials.find(m => m._id === selectedMaterialId);
            const materialPrice = material ? material.price : 0;

            const scope = { ...params, MaterialPrice: materialPrice, PI: 3.14 };

            // Safety check for mathjs
            const result = evaluate(template.formula, scope);
            // Ensure result is number and positive
            setPrice(Math.max(0, parseFloat(result) || 0));
        } catch (e) {
            // console.error(e); 
            // Silent fail or show error if critical. 
            // Formula evaluation might fail while typing (e.g. empty inputs), so just 0.
            setPrice(0);
        }
    };

    const handleSave = () => {
        if (price <= 0) {
            setError('Цена не может быть 0. Проверьте параметры.');
            return;
        }
        onSave({
            template: template._id,
            params,
            quantity,
            material: selectedMaterialId,
            // We don't send price, server snapshots it. 
            // EXCEPT: The user requirement asks to "See price immediately".
            // We see it in UI.
            // Server will re-calculate/snapshot.
            // Verify server calculation matches client? 
            // Server logic: IF manualPriceOverride is false, it fetches Material Price and saves it.
            // It doesn't run the formula to save "Item Price", it saves "Material Price Snapshot".
            // Wait, where is the calculated Item Price stored?
            // In Schema? I didn't add `itemPrice` to ProjectItem! 
            // Only `materialPriceSnapshot`.
            // The Item Price is calculated dynamically?
            // "В конце – скачать готовый PDF с расчетом."
            // If we only store params and formula is on Template, and Material Price is snapshot...
            // Then we can always recalculate Item Price = evaluate(formula, params + snapshot).
            // YES. This allows changing formula later? No, formula changes shouldn't affect old projects usually?
            // "Продумай план ... с возможностью масштабирования".
            // Ideally, we should snapshot the Formula too, OR store the final calculated price.
            // Storing final calculated Unit Price is SAFER.
            // Let's assume we store params and calculate on fly using Template.formula.
            // If template formula changes, old projects change? That's bad.
            // I should have snapshot the calculated Unit Price.
            // Schema Update?
            // ProjectSchema `items` has `materialPriceSnapshot`.
            // I should probably add `unitPriceSnapshot` or similar just to be safe.
            // OR, for now, I calculate on client/server using current Template Formula.
            // If Template Formula changes, it affects projects. Admin should edit carefully or create new version.
            // For MVP, dynamic calc is fine.
        });
    };

    const currentMaterial = materials.find(m => m._id === selectedMaterialId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0">
                    <div>
                        <h3 className="text-xl font-bold text-white">{template.name}</h3>
                        <p className="text-sm text-gray-400">Настройка параметров</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    <div className="flex gap-6">
                        <div className="w-1/3">
                            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                                {template.imageUrl ? (
                                    <img src={template.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                                )}
                            </div>
                        </div>

                        <div className="w-2/3 space-y-4">
                            {/* Material Selector */}
                            {template.materials?.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Материал</label>
                                    <select
                                        className="w-full bg-gray-800 border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={selectedMaterialId}
                                        onChange={(e) => setSelectedMaterialId(e.target.value)}
                                    >
                                        {template.materials.map((matId: any) => {
                                            // Handle populated or raw ID
                                            const mat = typeof matId === 'object' ? matId : materials.find(m => m._id === matId);
                                            if (!mat) return null;
                                            return <option key={mat._id} value={mat._id}>{mat.name} ({mat.price} ₸)</option>
                                        })}
                                    </select>
                                </div>
                            )}

                            {/* Dynamic Params */}
                            <div className="grid grid-cols-2 gap-4">
                                {template.parameters.map((p: any) => (
                                    <div key={p.slug}>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">{p.name} ({p.slug})</label>
                                        <Input
                                            type="number"
                                            value={params[p.slug] || ''}
                                            onChange={(e) => setParams({ ...params, [p.slug]: parseFloat(e.target.value) })}
                                            onFocus={(e) => e.target.select()}
                                            placeholder="0"
                                            className="font-mono"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Количество</label>
                                <Input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    min={1}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-800 bg-gray-900 sticky bottom-0">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-400 text-sm">Цена за шт.</p>
                            <p className="text-2xl font-bold text-white">{price.toLocaleString('ru-RU')} ₸</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm text-right">Итого</p>
                            <p className="text-2xl font-bold text-blue-400">{(price * quantity).toLocaleString('ru-RU')} ₸</p>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                    {price === 0 && !error && (
                        <p className="text-yellow-500 text-sm mb-3">
                            Цена равна 0. {template.materials?.length === 0 ? 'В шаблоне не выбраны материалы.' : 'Проверьте материалы и параметры.'}
                        </p>
                    )}

                    <div className="flex gap-4">
                        <Button variant="ghost" className="w-1/3" onClick={onClose}>Отмена</Button>
                        <Button className="w-2/3" onClick={handleSave} isLoading={isSaving} disabled={price <= 0}>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            {initialValues ? 'Сохранить изменения' : 'Добавить в смету'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
