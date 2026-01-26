import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Material from '@/models/Material';

export async function GET() {
    await dbConnect();
    try {
        const materials = await Material.find({}).sort({ createdAt: -1 });
        return NextResponse.json(materials);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const material = await Material.create(body);
        return NextResponse.json(material, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
    }
}
