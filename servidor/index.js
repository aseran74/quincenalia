
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const reservasRoutes = require('./routes/reservas');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/reservas', reservasRoutes);

app.listen(4000, () => {
  console.log('Servidor backend escuchando en puerto 4000');
});