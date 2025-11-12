import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // CRITICAL CHANGE 1: Reference the new Branch model by ID
    branch: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
    },
    year: { // Keep year here as it's specific to the subject instance
        type: String,
        required: true,
    },
    completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    // Array to hold references to the content added for this subject
    content: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// CRITICAL CHANGE 2: CASCADE DELETE Content when a Subject is removed.
SubjectSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    // 'this' refers to the subject document being deleted
    await mongoose.model('Content').deleteMany({ subject: this._id });
    next();
});

// Update index to include the Branch ID
SubjectSchema.index({ branch: 1, year: 1, name: 1 }, { unique: true });

export default mongoose.model('Subject', SubjectSchema);