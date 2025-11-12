import mongoose from 'mongoose'; // Use import instead of require

const ContentSchema = new mongoose.Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['syllabus', 'reference_video', 'notes', 'general_info'],
        required: true
    },
    link: {
        // This will be the Google Drive link (for PDF/Notes) or the Video URL (for Reference Videos)
        type: String,
        required: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// CRITICAL FIX: Use export default instead of module.exports
export default mongoose.model('Content', ContentSchema);