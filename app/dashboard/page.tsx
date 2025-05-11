export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Panel de Control</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Propiedades */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Propiedades</h2>
          <p className="text-3xl font-bold text-blue-600">0</p>
          <p className="text-gray-500">Total de propiedades</p>
        </div>

        {/* Agentes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Agentes</h2>
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-gray-500">Agentes activos</p>
        </div>

        {/* Shares Disponibles */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Shares</h2>
          <p className="text-3xl font-bold text-yellow-600">0</p>
          <p className="text-gray-500">Shares disponibles</p>
        </div>

        {/* Características */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Características</h2>
          <p className="text-3xl font-bold text-purple-600">0</p>
          <p className="text-gray-500">Total de características</p>
        </div>
      </div>
    </div>
  )
} 