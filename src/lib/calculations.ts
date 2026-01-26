import { evaluate } from 'mathjs';

export const calculateItemUnitPrice = (item: any, materialsMap?: Map<string, number>): number => {
    try {
        if (!item.template) return 0;

        let price = item.materialPriceSnapshot;

        // If snapshot is missing, try to find in provided map
        if (price === undefined && item.material && materialsMap) {
            const matId = typeof item.material === 'object' ? item.material._id : item.material;
            price = materialsMap.get(matId.toString()) || 0;
        }

        // If still undefined, default to 0
        if (price === undefined) price = 0;

        // Ensure params are clean
        const safeParams: Record<string, number> = {};
        if (item.params) {
            // item.params might be a Map or object depending on source (Mongoose vs JSON)
            if (item.params instanceof Map) {
                item.params.forEach((v: number, k: string) => safeParams[k] = v);
            } else {
                Object.assign(safeParams, item.params);
            }
        }

        const scope = { ...safeParams, MaterialPrice: price, PI: 3.14 };

        // Template formula might be needed. If item.template is ObjectId (string), we can't calc.
        // This function assumes item.template is POPULATED with .formula
        if (typeof item.template === 'string') return 0;
        if (!item.template.formula) return 0;

        const res = evaluate(item.template.formula, scope);
        return parseFloat(res) || 0;
    } catch (e) {
        console.error("Calculation error", e);
        return 0;
    }
};

export const calculateProjectTotal = (items: any[], materialsMap?: Map<string, number>): number => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
        const unitPrice = calculateItemUnitPrice(item, materialsMap);
        return sum + (unitPrice * (item.quantity || 1));
    }, 0);
};
