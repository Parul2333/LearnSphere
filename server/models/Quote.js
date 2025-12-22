import mongoose from 'mongoose';

const QuoteSchema = new mongoose.Schema({
    text: { type: String, required: true, trim: true },
    author: { type: String, default: 'Unknown' },
    isSelected: { type: Boolean, default: false }, // Forces this quote to show
    lastShownDate: { type: Date, default: null }   // Tracks rotation
}, { timestamps: true });

export default mongoose.model('Quote', QuoteSchema);