import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project, { IProjectItem } from '@/models/Project';
import Material from '@/models/Material';
import ProductTemplate from '@/models/ProductTemplate'; // Ensure registered for populate

// Helper to snapshot prices (duplicated to keep file self-contained or extract to lib later)
async function processItemsWithPrices(items: IProjectItem[]) {
    if (!items || items.length === 0) return items;

    const materialIdsToFetch = items
        .filter(item => item.material && !item.manualPriceOverride && item.materialPriceSnapshot === undefined)
        .map(item => item.material);

    if (materialIdsToFetch.length === 0) return items;

    const materials = await Material.find({ _id: { $in: materialIdsToFetch } });
    const materialMap = new Map(materials.map(m => [m._id.toString(), m.price]));

    return items.map(item => {
        // If client sends explicit snapshot, keep it unless told otherwise (handled by undefined check)
        // Client should send undefined/null for snapshot if they want refresh.
        if (item.material && !item.manualPriceOverride && item.materialPriceSnapshot === undefined) {
            // @ts-ignore - ObjectId vs string comparison
            const price = materialMap.get(item.material.toString());
            if (price !== undefined) {
                return { ...item, materialPriceSnapshot: price };
            }
        }
        return item;
    });
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;
    try {
        const project = await Project.findById(id)
            .populate('customer')
            .populate('items.template')
            .populate('items.material');

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;
    try {
        const body = await request.json();

        if (body.items) {
            body.items = await processItemsWithPrices(body.items);
        }

        const project = await Project.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        })
            .populate('customer')
            .populate('items.template')
            .populate('items.material');

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        return NextResponse.json(project);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;
    try {
        const project = await Project.findByIdAndDelete(id);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
