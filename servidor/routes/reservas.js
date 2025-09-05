const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Obtener reservas de una propiedad
router.get('/:propertyId', async (req, res) => {
  const { propertyId } = req.params;
  const { data, error } = await supabase
    .from('property_reservations')
    .select('*')
    .eq('property_id', propertyId);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Crear/actualizar reserva
router.post('/', async (req, res) => {
  const { property_id, owner_id, start_date, end_date } = req.body;
  const { data, error } = await supabase
    .from('property_reservations')
    .upsert([{ property_id, owner_id, start_date, end_date }], { onConflict: ['property_id', 'start_date'] });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;