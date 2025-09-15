// controllers/notesController.js
import Note from '../models/Note.js'
import Tenant from '../models/Tenant.js';

const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { tenantId } = req.user;
    
    // Check subscription limits
    const tenant = await Tenant.findOne({ slug: tenantId });
    const noteCount = await Note.countDocuments({ tenantId });
    
    if (tenant.subscription === 'free' && noteCount >= tenant.noteLimit) {
      return res.status(403).json({ error: 'Note limit reached. Upgrade to Pro for unlimited notes.' });
    }
    
    const note = new Note({
      title,
      content,
      userId: req.user._id,
      tenantId
    });
    
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ tenantId: req.user.tenantId });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      tenantId: req.user.tenantId 
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { title, content, updatedAt: new Date() },
      { new: true }
    );
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      tenantId: req.user.tenantId 
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export { createNote, getNotes, getNote, updateNote, deleteNote };
