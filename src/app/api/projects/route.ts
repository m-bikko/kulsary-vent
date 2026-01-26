import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project, { IProjectItem } from '@/models/Project';
import Material from '@/models/Material';
import ProductTemplate from '@/models/ProductTemplate'; // Ensure registered

// Helper to snapshot prices
async function processItemsWithPrices(items: IProjectItem[]) {
    if (!items || items.length === 0) return items;

    // Collect all material IDs that need price fetching (manualPriceOverride: false/undefined and materialPriceSnapshot missing)
    const materialIdsToFetch = items
        .filter(item => item.material && !item.manualPriceOverride && item.materialPriceSnapshot === undefined)
        .map(item => item.material);

    if (materialIdsToFetch.length === 0) return items;

    const materials = await Material.find({ _id: { $in: materialIdsToFetch } });
    const materialMap = new Map(materials.map(m => [m._id.toString(), m.price]));

    return items.map(item => {
        if (item.material && !item.manualPriceOverride && item.materialPriceSnapshot === undefined) {
            const price = materialMap.get(item.material!.toString());
            if (price !== undefined) {
                return { ...item, materialPriceSnapshot: price };
            }
        }
        return item;
    });
}

export async function GET() {
    await dbConnect();
    try {
        const projects = await Project.find({}).populate('customer').sort({ createdAt: -1 });
        return NextResponse.json(projects);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();

        // Process items to set snapshots
        if (body.items) {
            body.items = await processItemsWithPrices(body.items);
        }

        const project = await Project.create(body);
        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
