import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProjectItem {
    template: Types.ObjectId;
    params: Map<string, number>; // Dynamic params like { "d": 100, "l": 200 }
    quantity: number;
    material?: Types.ObjectId;
    materialPriceSnapshot?: number; // Price of material at the time of adding/updating
    manualPriceOverride?: boolean; // If true, don't auto-update snapshot on material refresh? Or maybe just manual set
}

export interface IProject extends Document {
    name: string;
    customer: Types.ObjectId;
    items: IProjectItem[];
    totalPrice: number;
    status: 'new' | 'discussion' | 'won' | 'lost';
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
    name: { type: String, required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [{
        template: { type: Schema.Types.ObjectId, ref: 'ProductTemplate', required: true },
        params: { type: Map, of: Number },
        quantity: { type: Number, required: true, default: 1 },
        material: { type: Schema.Types.ObjectId, ref: 'Material' },
        materialPriceSnapshot: { type: Number },
        manualPriceOverride: { type: Boolean, default: false }
    }],
    totalPrice: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['new', 'discussion', 'won', 'lost'],
        default: 'new',
        index: true
    },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
