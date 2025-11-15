import Subject from '../models/Subject.js';
import Content from '../models/Content.js';
import Branch from '../models/Branch.js'; // 💡 NEW: Import the Branch model
import redis from '../config/redis.js'; // Use redis for cache invalidation
import { getSocketIO } from '../utils/socket.js';
import { notifyNewContent, notifyNewSubject, notifyProgressUpdate } from '../events/notificationEvents.js';

// --- Helper Functions for Branch Management (CRUD) ---

// @desc    Get all Branches
// @route   GET /api/admin/branches
// @access  Private/Admin
export const getAllBranches = async (req, res) => {
    try {
        // Try to return cached branches if Redis is available
        if (redis && redis.status === 'ready') {
            try {
                const cached = await redis.get('branches_cache');
                if (cached) {
                    return res.status(200).json(JSON.parse(cached));
                }
            } catch (e) {
                console.warn('[Redis] failed to read branches cache:', e.message || e);
            }
        }

        const branches = await Branch.find().select('name years');

        // Cache the branches for 30 minutes to reduce DB hits
        if (redis && redis.status === 'ready') {
            try {
                await redis.set('branches_cache', JSON.stringify(branches), 'EX', 30 * 60);
            } catch (e) {
                console.warn('[Redis] failed to write branches cache:', e.message || e);
            }
        }

        res.status(200).json(branches);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching branches.', error: error.message });
    }
};

// @desc    Create a new Branch (with years)
// @route   POST /api/admin/branches
// @access  Private/Admin
export const createBranch = async (req, res) => {
    const { name, years } = req.body; // years should be an array of strings

    try {
        const branch = await Branch.create({ name, years });
        
        // Invalidate caches as structure changed
        if (redis && redis.status === 'ready') {
            await redis.del('all_subjects_cache');
            await redis.del('branches_cache');
        }

        res.status(201).json(branch);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Branch name already exists.' });
        }
        res.status(500).json({ message: 'Server error creating branch.', error: error.message });
    }
};

// @desc    Delete a Branch and CASCADE DELETE related Subjects/Content
// @route   DELETE /api/admin/branches/:id
// @access  Private/Admin
export const deleteBranch = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Find all subjects belonging to this branch
        const subjects = await Subject.find({ branch: id });
        
        // 2. Loop through and delete each subject to trigger the Subject pre-hook
        //    (which handles deleting associated Content documents)
        let deletedSubjectsCount = 0;
        for (const subject of subjects) {
            // Must use deleteOne() on the document to trigger the Mongoose pre-hook!
            await subject.deleteOne(); 
            deletedSubjectsCount++;
        }

        // 3. Delete the Branch itself
        const branch = await Branch.findByIdAndDelete(id);

        if (!branch) {
            return res.status(404).json({ message: 'Branch not found.' });
        }
        
        // Invalidate caches for subject lists and branches
        if (redis && redis.status === 'ready') {
            await redis.del('all_subjects_cache');
            await redis.del('branches_cache');
        }

        res.status(200).json({ 
            message: `Branch '${branch.name}' and ${deletedSubjectsCount} subjects/content deleted successfully.` 
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during branch deletion.', error: error.message });
    }
};

// --- Subject and Content Management Functions (Modified to use Branch ID) ---

// @desc    Create a new subject (Year, Branch ID, Name)
// @route   POST /api/admin/subjects
// @access  Private/Admin
export const createSubject = async (req, res) => {
    const { name, year, branchId } = req.body; // 💡 MODIFIED to expect branchId

    try {
        const subject = await Subject.create({
            name,
            year,
            branch: branchId, // Use the Branch ID for linking
            createdBy: req.user.id
        });
        
        // CRITICAL FIX: Check if Redis is ready before calling .del() to prevent timeouts
        if (redis && redis.status === 'ready') {
            await redis.del('all_subjects_cache'); 
        }

        // Emit WebSocket notification for new subject
        const io = getSocketIO();
        if (io) {
            try {
                const branch = await Branch.findById(branchId);
                notifyNewSubject(io, branchId, {
                    _id: subject._id,
                    name: subject.name,
                    year: subject.year,
                    branch: branchId, // Send branch ID for matching
                    branchName: branch?.name || 'Unknown Branch' // Include name for display
                });
            } catch (notifyError) {
                console.warn('[Socket] Failed to notify new subject:', notifyError.message);
            }
        }

        res.status(201).json(subject);

    } catch (error) {
        if (error.code === 11000) { 
            return res.status(400).json({ message: 'Subject with this name already exists in this Branch/Year.' });
        }
        res.status(500).json({ message: 'Server error creating subject', error: error.message });
    }
};

// @desc    Add a notes/video/syllabus link to a subject
// @route   POST /api/admin/content
// @access  Private/Admin
export const addContentToSubject = async (req, res) => {
    const { subjectId, title, category, link } = req.body;

    try {
        const content = await Content.create({
            subject: subjectId,
            title,
            category,
            link,
            addedBy: req.user.id
        });

        // Add reference to the Content ID in the Subject document
        await Subject.findByIdAndUpdate(subjectId, {
            $push: { content: content._id }
        });
        
        // CRITICAL FIX: Check if Redis is ready before calling .del()
        if (redis && redis.status === 'ready') {
            await redis.del(`subject_content_${subjectId}`);
        }

        // Emit WebSocket notification for new content
        const io = getSocketIO();
        if (io) {
            try {
                notifyNewContent(io, subjectId, {
                    _id: content._id,
                    title: content.title,
                    category: content.category,
                    link: content.link
                });
            } catch (notifyError) {
                console.warn('[Socket] Failed to notify new content:', notifyError.message);
            }
        }

        res.status(201).json(content);

    } catch (error) {
        res.status(500).json({ message: 'Server error adding content', error: error.message });
    }
};

// @desc    Update subject completion percentage (Progress Bar)
// @route   PUT /api/admin/subjects/progress/:id
// @access  Private/Admin
export const updateSubjectProgress = async (req, res) => {
    const { percentage } = req.body;
    const { id } = req.params;

    if (percentage === undefined || percentage < 0 || percentage > 100) {
        return res.status(400).json({ message: 'Percentage must be between 0 and 100.' });
    }

    try {
        const subject = await Subject.findByIdAndUpdate(
            id,
            { completionPercentage: percentage },
            { new: true }
        );

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }
        
        // CRITICAL FIX: Check if Redis is ready before calling .del()
        if (redis && redis.status === 'ready') {
            await redis.del(`subject_${id}_cache`); 
        }

        // Emit WebSocket notification for progress update
        const io = getSocketIO();
        if (io) {
            try {
                notifyProgressUpdate(io, id, percentage);
            } catch (notifyError) {
                console.warn('[Socket] Failed to notify progress update:', notifyError.message);
            }
        }

        res.json(subject);

    } catch (error) {
        res.status(500).json({ message: 'Server error updating progress', error: error.message });
    }
};