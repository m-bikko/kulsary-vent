import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILead extends Document {
    title: string;
    description: string;
    status: 'new' | 'discussion' | 'won' | 'lost';
    customer: mongoose.Schema.Types.ObjectId;
    project?: mongoose.Schema.Types.ObjectId;
    estimatedValue: number;
    source: string;
    createdAt: Date;
    updatedAt: Date;
}

const LeadSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
        type: String,
        enum: ['new', 'discussion', 'won', 'lost'],
        default: 'new',
        index: true
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Optional link to actual calculation
    estimatedValue: { type: Number, default: 0 },
    source: { type: String, default: 'manual' },
}, {
    timestamps: true
});

// Prevent overwrite
const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
