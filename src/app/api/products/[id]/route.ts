import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProductTemplate from '@/models/ProductTemplate';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;
    try {
        const template = await ProductTemplate.findById(id).populate('materials');
        if (!template) {
            return NextResponse.json({ error: 'Product Template not found' }, { status: 404 });
        }
        return NextResponse.json(template);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch product template' }, { status: 500 });
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
        const template = await ProductTemplate.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        }).populate('materials');
        if (!template) {
            return NextResponse.json({ error: 'Product Template not found' }, { status: 404 });
        }
        return NextResponse.json(template);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product template' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;
    try {
        const template = await ProductTemplate.findByIdAndDelete(id);
        if (!template) {
            return NextResponse.json({ error: 'Product Template not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Product Template deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product template' }, { status: 500 });
    }
}
