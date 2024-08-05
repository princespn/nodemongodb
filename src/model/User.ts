import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password: string;
    email: string;
    name: string;
    age?: string;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, index: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: String }
});

export const User = mongoose.model<IUser>('User', UserSchema);
