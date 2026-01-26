import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Material from '@/models/Material';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;
    try {
        const material = await Material.findById(id);
        if (!material) {
            return NextResponse.json({ error: 'Material not found' }, { status: 404 });
        }
        return NextResponse.json(material);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch material' }, { status: 500 });
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
        const material = await Material.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });
        if (!material) {
            return NextResponse.json({ error: 'Material not found' }, { status: 404 });
        }
        return NextResponse.json(material);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update material' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;
    try {
        const material = await Material.findByIdAndDelete(id);
        if (!material) {
            return NextResponse.json({ error: 'Material not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Material deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
    }
}
