import Quote from '../models/Quote.js';

// @desc    Get Quote of the Day (Public)
export const getDailyQuote = async (req, res) => {
    try {
        // 1. Check for manually selected quote
        const selected = await Quote.findOne({ isSelected: true });
        if (selected) return res.json(selected);

        // 2. Check if one was already picked for TODAY
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysQuote = await Quote.findOne({ lastShownDate: { $gte: today } });
        if (todaysQuote) return res.json(todaysQuote);

        // 3. Pick random
        const count = await Quote.countDocuments();
        if (count === 0) return res.json(null); // No quotes exist
        
        const random = Math.floor(Math.random() * count);
        const newDaily = await Quote.findOne().skip(random);
        
        newDaily.lastShownDate = new Date();
        await newDaily.save();
        
        res.json(newDaily);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quote' });
    }
};

// @desc    Admin Operations
export const getAllQuotes = async (req, res) => {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
};

export const addQuote = async (req, res) => {
    const quote = await Quote.create(req.body);
    res.status(201).json(quote);
};

export const deleteQuote = async (req, res) => {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
};

export const toggleQuoteSelection = async (req, res) => {
    const { id } = req.params;
    const { select } = req.body; // true = select, false = unselect
    
    if (select) {
        // Unselect all others first
        await Quote.updateMany({}, { isSelected: false });
    }
    
    const quote = await Quote.findByIdAndUpdate(id, { isSelected: select }, { new: true });
    res.json(quote);
};