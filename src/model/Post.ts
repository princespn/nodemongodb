import mongoose, { Document, Schema, Model } from 'mongoose';

// Define an interface for a single comment
interface Comment {
  title: string;
  name: string;
  body: string;
  date: Date;
}



// Define an interface for the Post document
interface PostDocument extends Document {
  title: string;
  body: string;
  categories: mongoose.Schema.Types.ObjectId;  // Changed to a single category
  date: Date;
  thumbimage: string;
  comments: Comment[];
}

// Define the schema for the Post document
const postSchema: Schema<PostDocument> = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  categories: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },  // Changed to a single category
  date: { type: Date, default: Date.now },
  thumbimage: { type: String, default: 'noimage.png' },
  comments: [{
    title: { type: String, required: true },
    name: { type: String, required: true },
    body: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }]
});

// Create and export the Post model
const Post: Model<PostDocument> = mongoose.models.Post || mongoose.model<PostDocument>('Post', postSchema);
export { Post, PostDocument };
