const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const  {getNotes,createNote,updateNote,deleteNote} = require('../controllers/noteContolller');
router.get('/', auth, getNotes);
router.post('/', auth,  createNote);
router.put('/:id', auth,  updateNote);
router.delete('/:id', auth, deleteNote);
module.exports = router;