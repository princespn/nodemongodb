import mongoose, { Document, Schema } from 'mongoose';

interface UserDocument extends Document {
  name: string;
  email: string;
  username: string;
  age: number;
  password: string;
  profileImage: string;
}

const userSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: 'default-profile.png' }
});

const User = mongoose.model<UserDocument>('User', userSchema);

export { User, UserDocument };
