const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const COC_API_KEY = process.env.COC_API_KEY;
const BASE_URL = 'https://api.clashofclans.com/v1';

app.get('/api/player/:tag', async (req, res) => {
  const playerTag = req.params.tag.replace('#', '%23');
  try {
    const response = await axios.get(`${BASE_URL}/players/${playerTag}`, {
      headers: {
        'Authorization': `Bearer ${COC_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from COC API:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch player data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
