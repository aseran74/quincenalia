import React, { useEffect, useState } from 'react'
import { PropertyCard } from './PropertyCard'
import { Property, getProperties } from '../../../lib/supabase'

export const PropertiesList = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProperties() {
      const data = await getProperties()
      setProperties(data)
      setLoading(false)
    }

    loadProperties()
  }, [])

  if (loading) {
    return <div className="text-center">Cargando propiedades...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} {...property} />
      ))}
    </div>
  )
} 