const express = require('express');
const cors = require('cors');
const { PORT } = require('./config');
const compareRoutes = require('./routes/compareRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', compareRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
