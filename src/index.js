const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

const mongose = require("./utils/database")(app);

const User = require("./models/User");

app.use(express.json());

const users = [];

async function checkUserExists(req, res, next) {
  const { username } = req.headers;

  const user = await User.findOne({ username: username });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  req.user = user;
  next();
}

app.post('/users', async (req, res) => {
  const { name, username } = req.body;
  const userAlreadyExists = await User.findOne({ username: username });
  if (userAlreadyExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    playlists: []
  }

  try {
    await User.create(user);
    return res.status(201).send(user);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

app.put('/users', checkUserExists, async (req, res) => {
  const { user } = req;
  const { name } = req.body;

  try {
    await User.updateOne({ _id: user._id }, { name: name });
    return res.status(201).json(user);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

app.get('/users', (req, res) => {
  return res.send(users);
});

app.get('/playlists', checkUserExists, (req, res) => {
  const { playlists } = req.user;
  return res.json(playlists);
});

/**
 * rota para criar uma nova playlist
 */
app.post('/playlists', checkUserExists, async (req, res) => {
  const { name } = req.body;
  const { _id, playlists } = req.user;
  const playlist = {
    id: uuidv4(),
    name,
    songs: []
  }
  playlists.push(playlist);

  try {
    await User.updateOne({ _id: _id }, { playlists: playlists });
    return res.status(201).send(req.user);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

app.put('/playlists/:id', checkUserExists, async (req, res) => {
  const { _id, playlists } = req.user;
  const { name } = req.body;
  const { id } = req.params;
  const playlist = playlists.find((playlist) => playlist.id === id);
  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }
  playlist.name = name;

  try {
    await User.updateOne({ _id: _id }, { playlists: playlists });
    return res.status(201).send(playlist);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

app.post('/playlists/:id/add', checkUserExists, async (req, res) => {
  const { _id, playlists } = req.user;
  const { id } = req.params;
  const { song } = req.body;
  const playlist = playlists.find((playlist) => playlist.id === id);
  if (!playlist) {
    return res.status(404).json({ message: 'Playlist not found' });
  }
  const { songs } = playlist;
  songs.push(song);

  try {
    await User.updateOne({ _id: _id }, { playlists: playlists });
    return res.status(201).send(songs);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

app.get('/playlists/:id', checkUserExists, (req, res) => {
  const { playlists } = req.user;
  const { id } = req.params;
  const playlist = playlists.find((playlist) => playlist.id === id);
  if (!playlist) {
    return res.status(404).json({ message: 'Playlist not found' });
  }
  return res.status(201).send(playlist);
});

app.delete('/playlists/:id', checkUserExists, async (req, res) => {
  const { _id, playlists } = req.user;
  const { id } = req.params;
  const playlist = playlists.find((playlist) => playlist.id === id);
  if (!playlist) {
    return res.status(404).json({ message: "Playlist nos found" });
  }
  playlists.splice(playlist, 1);

  try {
    await User.updateOne({ _id: _id }, { playlists: playlists });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

module.exports = app;