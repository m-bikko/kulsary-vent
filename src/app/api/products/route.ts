import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProductTemplate from '@/models/ProductTemplate';

export async function GET() {
    await dbConnect();
    try {
        const templates = await ProductTemplate.find({}).populate('materials').sort({ createdAt: -1 });
        return NextResponse.json(templates);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch product templates' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const template = await ProductTemplate.create(body);
        // Populate immediately for consistency if needed, but create usually returns document.
        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create product template' }, { status: 500 });
    }
}
