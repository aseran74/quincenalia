import React, { useEffect, useState } from 'react'
import { Feature, getFeatures } from '../../../lib/supabase'

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFeatures() {
      const data = await getFeatures()
      setFeatures(data)
      setLoading(false)
    }

    loadFeatures()
  }, [])

  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  if (loading) {
    return <div>Cargando características...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Características</h1>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500"
          onClick={() => {/* TODO: Implementar creación */}}
        >
          Añadir Característica
        </button>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <div key={category} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 capitalize">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryFeatures.map(feature => (
                <div
                  key={feature.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{feature.icon}</span>
                    <span>{feature.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => {/* TODO: Implementar edición */}}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => {/* TODO: Implementar eliminación */}}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 