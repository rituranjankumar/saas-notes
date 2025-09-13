const Note = require("../models/Note");

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ tenant: req.user.tenantId }).populate("creator").sort({ createdAt: -1 });
    res.json({ notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createNote = async (req, res) => {
  const { title, content } = req.body;
  try {
    if (req.user.plan === "free") {
      const noteCount = await Note.countDocuments({ creator: req.user.id });
      if (noteCount >= 3) {
        return res.status(403).json({ error: "Free plan limit of 3 notes reached" });
      }
    }
    
    const newNote = new Note({
      title,
      content,
      creator: req.user.id,
      tenant: req.user.tenantId,
    });
    const note = await newNote.save();
    
    const populatedNote = await Note.findById(note._id).populate('creator');

    res.status(201).json({ note: populatedNote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        let query = { _id: id };
        
        // If the user is not an admin, restrict the query to their own notes
        if (req.user.role !== 'admin') {
            query.creator = req.user.id;
        }

        const updatedNote = await Note.findOneAndUpdate(
            query,
            { title, content },
            { new: true }
        ).populate('creator');

        if (!updatedNote) {
            return res.status(404).json({ error: 'Note not found or user not authorized' });
        }

        res.status(200).json({ note: updatedNote });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const { id } = req.params;

        // Build the query object
        let query = {
            _id: id,
            tenant: req.user.tenantId,
        };

        // If the user is not an admin, restrict the query to their own notes
        if (req.user.role !== 'admin') {
            query.creator = req.user.id;
        }

        const deletedNote = await Note.findOneAndDelete(query);

        if (!deletedNote) {
            return res.status(404).json({ error: "Note not found or access denied" });
        }
        
        res.json({ message: "Note deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};