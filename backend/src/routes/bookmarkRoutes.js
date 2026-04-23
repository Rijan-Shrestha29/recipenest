const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMyBookmarks,
  toggleBookmark,
  checkBookmarkStatus
} = require('../controllers/bookmarkController');

router.get('/my-bookmarks', protect, getMyBookmarks);
router.post('/toggle', protect, toggleBookmark);
router.get('/check/:recipeId', protect, checkBookmarkStatus);

module.exports = router;