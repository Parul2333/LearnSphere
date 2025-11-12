import mongoose from 'mongoose';

const BranchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    years: {
        type: [String], // Array of strings, e.g., ['First Year', 'Second Year', ...]
        required: true,
    }
}, { timestamps: true });

// We define a pre-remove hook here to handle cascade deletion.
// However, the actual Subject/Content cascade must be triggered in the controller,
// as Mongoose pre-hooks only work on the current document, not related ones.

export default mongoose.model('Branch', BranchSchema);