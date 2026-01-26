import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const resolvedParams = await context.params;
        const id = resolvedParams.id;
        const body = await request.json();

        const lead = await Lead.findByIdAndUpdate(id, body, { new: true })
            .populate('customer')
            .populate('project');

        if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        return NextResponse.json(lead);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const resolvedParams = await context.params;
        const id = resolvedParams.id;
        await Lead.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }
}
