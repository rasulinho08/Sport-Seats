const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.static('public'));

function fetchStadiumsFromDb() {
  return [
    { id: 1, name: 'National Stadium', lat: 38.8951, lng: -77.0364 },
    { id: 2, name: 'City Arena', lat: 51.5074, lng: -0.1278 },
    { id: 3, name: 'Coastal Field', lat: 34.0522, lng: -118.2437 }
  ];
}

function fetchGamesFromDb() {
  return [
    { gameId: 'g1', stadiumId: 1, teams: 'Team A vs Team B', date: '2025-08-15' },
    { gameId: 'g2', stadiumId: 2, teams: 'Team C vs Team D', date: '2025-08-20' },
    { gameId: 'g3', stadiumId: 3, teams: 'Team E vs Team F', date: '2025-08-25' }
  ];
}

app.get('/api/stadiums', (req, res) => {
  res.json(fetchStadiumsFromDb());
});

app.get('/api/games', (req, res) => {
  res.json(fetchGamesFromDb());
});

app.get('/api/games/:id', (req, res) => {
  const game = fetchGamesFromDb().find(g => g.gameId === req.params.id);
  if (game) res.json(game);
  else res.status(404).send('Not found');
});

app.get('/seatmap/:gameId', (req, res) => {
  res.sendFile(__dirname + '/public/seatmap.html');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('chatMessage', (data) => {
    io.emit('chatMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server and Socket.IO running at http://localhost:${PORT}`);
});
