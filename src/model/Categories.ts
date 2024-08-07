import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the Category document interface
interface CategoriesDocument extends Document {
  title: string;
}

// Define the schema for the Category document
const CategoriesSchema: Schema<CategoriesDocument> = new Schema({
  title: { type: String, required: true }
});

// Create and export the Category model
const Categories: Model<CategoriesDocument> = mongoose.models.Category || mongoose.model<CategoriesDocument>('Category', CategoriesSchema);
export { Categories, CategoriesDocument };
