import { PropertyCard } from './PropertyCard'
import { Property } from '../../../lib/supabase'

interface PropertiesListProps {
  properties: Property[]
}

export const PropertiesList: React.FC<PropertiesListProps> = ({ properties }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} {...property} />
      ))}
    </div>
  )
} 