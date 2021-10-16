const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();


app.use(express.json());

const users = [];

function checkUserExists(req, res, next) {
  const { username } = req.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  req.user = user;

  next();
}


app.post('/users', (req, res) => {
  const { name, username } = req.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    playlists: []
  }

  users.push(user);

  res.status(201).json(user);

});

app.get('/users',(req,res)=>{
  return res.send(users);
})

app.get('/playlists', checkUserExists, (req, res) => {
  const { playlists } = req.user;
  return res.json(playlists);
});

app.post('/playlists', checkUserExists, (req, res) => {
  const { name } = req.body;
  const { playlists } = req.user;

  const playlist = {
    id: uuidv4(),
    name,
    songs: []
  }

  playlists.push(playlist);

  return res.status(201).send(playlist);

});

app.post('/playlists/:id/add', checkUserExists, (req, res) => {
  const { playlists } = req.user;
  const { id } = req.params;
  const { song } = req.body;

  const playlist = playlists.find((playlist) => playlist.id === id);

  if (!playlist) {
    return res.status(404).json({ message: 'Playlist not found' });
  }

  const {songs} = playlist;
  
  songs.push(song);

  return res.status(201).send(songs);

});

app.get('/playlists/:id', checkUserExists, (req, res) => {
  const { playlists } = req.user;
  const { id } = req.params;

  const playlist = playlists.find((playlist)=>playlist.id===id);

  if(!playlist){
    return res.status(404).json({message:'Playlist not found'});
  }

  return res.status(201).send(playlist);

});



module.exports = app;