import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProductParameter {
    name: string;
    slug: string;
    type: 'number' | 'text' | 'select'; // basic types, mostly number for now
}

export interface IProductTemplate extends Document {
    name: string;
    imageUrl: string;
    parameters: IProductParameter[];
    materials: Types.ObjectId[]; // References to allowed materials
    formula: string;
    createdAt: Date;
}

const ProductTemplateSchema: Schema = new Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: false },
    parameters: [{
        name: { type: String, required: true },
        slug: { type: String, required: true },
        type: { type: String, required: true, default: 'number' },
    }],
    materials: [{ type: Schema.Types.ObjectId, ref: 'Material' }],
    formula: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ProductTemplate || mongoose.model<IProductTemplate>('ProductTemplate', ProductTemplateSchema);
