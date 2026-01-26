import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
    name: string;
    contactInfo: string;
    createdAt: Date;
}

const CustomerSchema: Schema = new Schema({
    name: { type: String, required: true },
    contactInfo: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
