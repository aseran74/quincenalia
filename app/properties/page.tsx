import React from 'react'
import { PropertiesList } from '../components/properties/PropertiesList'

export default function PropertiesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Propiedades Disponibles</h1>
      <PropertiesList />
    </div>
  )
} 