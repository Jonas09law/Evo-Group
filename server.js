import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/roblox/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || id.length < 5) {
    return res.json({ players: 0, max: 1000 });
  }

  try {
    const response = await axios.get(
      `https://games.roblox.com/v1/games/${id}/servers/Public?limit=100`
    );

    const servers = response.data.data || [];
    const players = servers.reduce((sum, srv) => sum + (srv.playing || 0), 0);
    const max = servers.reduce((sum, srv) => sum + (srv.maxPlayers || 0), 0);

    res.json({ players, max: max || 1000 });
  } catch (error) {
    console.error('Erro no proxy Roblox:', error.message);
    res.json({ players: 0, max: 1000 });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proxy Roblox rodando → http://localhost:${PORT}`);
  console.log(`Acesse seu site em http://localhost:5173 (ou 8080)`);
});