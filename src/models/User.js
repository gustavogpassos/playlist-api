const mongoose = require('mongoose');

const User = mongoose.model('User', {
  name: String,
  username: String,
  playlists: Array
});

module.exports = User;