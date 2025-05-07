const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = 3000;

// Configuración de Supabase
const supabaseUrl = 'https://vpneiupvzsqzyrurcgmo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbmVpdXB2enNxenlydXJjZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1Nzk3MjUsImV4cCI6MjA2MTE1NTcyNX0.MwM55HG_n-j6YpDBoe-NqFsHhqp6o5IgeYniM6fn4nM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Ruta principal para obtener propiedades
app.get('/properties', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        agent:agents(*),
        features:property_features(features(*))
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transformar los datos si es necesario
    const properties = data.map(property => ({
      ...property,
      features: property.features?.map(f => f.features)
    }));

    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Error fetching properties' });
  }
});

// Ruta para obtener propiedades con filtros
app.get('/properties/filtrar', async (req, res) => {
  try {
    const {
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      minPrice,
      maxPrice,
      location,
      isSharedProperty,
      nearby_services
    } = req.query;

    let query = supabase
      .from('properties')
      .select(`
        *,
        agent:agents(*),
        features:property_features(features(*))
      `);

    // Aplicar filtros
    if (bedrooms) query = query.eq('bedrooms', parseInt(bedrooms));
    if (bathrooms) query = query.eq('bathrooms', parseInt(bathrooms));
    if (minArea) query = query.gte('area', parseFloat(minArea));
    if (maxArea) query = query.lte('area', parseFloat(maxArea));
    if (minPrice) query = query.gte('price', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
    if (location) query = query.ilike('location', `%${location}%`);
    if (isSharedProperty === 'true') query = query.not('share1_price', 'is', null);
    if (nearby_services) {
      const services = JSON.parse(nearby_services);
      if (services.length > 0) {
        query = query.contains('nearby_services', services);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Transformar los datos
    const properties = data.map(property => ({
      ...property,
      features: property.features?.map(f => f.features)
    }));

    res.json(properties);
  } catch (error) {
    console.error('Error fetching filtered properties:', error);
    res.status(500).json({ error: 'Error fetching properties' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
}); 