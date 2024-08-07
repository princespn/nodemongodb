import mongoose, { Document, Schema } from 'mongoose';

interface BookDocument extends Document {
  title: string;
  categories: mongoose.Schema.Types.ObjectId;  // Changed to a single category
  description: string;
  author: string;
  publisher: string;
  price: number;
  cover: string;
  truncText(length: number): string;
}

// Define the schema for the Book document
const BookSchema: Schema<BookDocument> = new Schema({
  title: { type: String, required: true },
  categories: { type: mongoose.Schema.Types.ObjectId, ref: 'Categories', required: true },  // Changed to a single category
  description: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String, required: true },
  price: { type: Number, required: true },
  cover: { type: String, default: 'nocover.png' }
});

// Method to truncate text
BookSchema.methods.truncText = function(length: number): string {
  return this.description.substring(0, length);
};

const Book = mongoose.model<BookDocument>('Book', BookSchema);

export { Book, BookDocument };
