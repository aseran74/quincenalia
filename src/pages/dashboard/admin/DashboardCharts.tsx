import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Datos de ejemplo
const reservasPorSemana = [
  { semana: 'Semana 1', reservas: 12 },
  { semana: 'Semana 2', reservas: 18 },
  { semana: 'Semana 3', reservas: 9 },
  { semana: 'Semana 4', reservas: 15 },
];

const propiedadesPorEstado = [
  { estado: 'Disponible', valor: 24 },
  { estado: 'Reservado', valor: 10 },
  { estado: 'Vendido', valor: 6 },
];

const usuariosPorRol = [
  { rol: 'Admin', valor: 2 },
  { rol: 'Agente', valor: 8 },
  { rol: 'Propietario', valor: 14 },
];

const COLORS = ['#22d3ee', '#0ea5e9', '#2563eb', '#fbbf24', '#f87171'];

const DashboardCharts: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* Gráfico de barras: Reservas por semana */}
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Reservas por semana</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={reservasPorSemana}>
          <XAxis dataKey="semana" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="reservas" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    {/* Gráfico de pastel: Propiedades por estado */}
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Propiedades por estado</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={propiedadesPorEstado}
            dataKey="valor"
            nameKey="estado"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {propiedadesPorEstado.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
    {/* Gráfico de pastel: Usuarios por rol */}
    <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
      <h3 className="text-lg font-semibold mb-4">Usuarios por rol</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={usuariosPorRol}
            dataKey="valor"
            nameKey="rol"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {usuariosPorRol.map((entry, index) => (
              <Cell key={`cell-rol-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default DashboardCharts; 