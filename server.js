const express = require('express');
const axios = require('axios');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set up middleware to parse JSON
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const airtableToken = 'Bearer patX200VGkvIdjhvl.85e8e525a33b49ef814bfbfc0c0af14631faf88b39fd566a99a5c3de203a181a';

app.post('/fetch-data', async (req, res) => {
  const { url } = req.body;  // URL received from the client

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await axios.get(url, {
      headers: { Authorization: airtableToken },
    });

    // Emit data to all connected clients
    io.emit('dataUpdate', response.data);
    res.json({ success: true });
  } catch (error) {
    console.error('Error fetching data from Airtable:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

io.on('connection', (socket) => {
  console.log('A client connected');
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
