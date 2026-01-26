import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Material from '@/models/Material';
import ProductTemplate from '@/models/ProductTemplate'; // Ensure registered
import { calculateProjectTotal } from '@/lib/calculations';

// Force dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
    await dbConnect();
    try {
        const projects = await Project.find({})
            .populate('items.template')
            .populate('items.material'); // In case snapshot is missing, though we prefer snapshot

        const materials = await Material.find({});
        const materialsMap = new Map(materials.map(m => [m._id.toString(), m.price]));

        let updatedCount = 0;

        for (const project of projects) {
            const hasZeroTotal = !project.totalPrice || project.totalPrice === 0;
            const hasItems = project.items && project.items.length > 0;

            // Recalculate anyway to ensure consistency
            const calculatedTotal = calculateProjectTotal(project.items, materialsMap);

            if (project.totalPrice !== calculatedTotal) {
                project.totalPrice = calculatedTotal;
                await project.save();
                updatedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Recalculated ${updatedCount} projects`,
            totalProjects: projects.length
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
