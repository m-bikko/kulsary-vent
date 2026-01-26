import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterial extends Document {
    name: string;
    price: number;
    unit: string;
    createdAt: Date;
}

const MaterialSchema: Schema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Material || mongoose.model<IMaterial>('Material', MaterialSchema);
