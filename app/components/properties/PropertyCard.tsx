import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Property } from '../../../lib/supabase'

export const PropertyCard: FC<Property> = ({
  id,
  title,
  description,
  price,
  location,
  bedrooms,
  bathrooms,
  area,
  image_url,
  agent,
  features,
  share1_price,
  share1_status,
  share2_price,
  share2_status,
  share3_price,
  share3_status,
  share4_price,
  share4_status
}) => {
  // Agrupar características por categoría
  const groupedFeatures = features?.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, typeof features>);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <img
            src={image_url}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-2">{location}</p>
        <p className="text-gray-500 text-sm line-clamp-2">{description}</p>
        
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Precio Total: ${price.toLocaleString()}</span>
            <div className="flex gap-4 text-gray-600">
              <span>{bedrooms} 🛏️</span>
              <span>{bathrooms} 🚿</span>
              <span>{area}m² 📏</span>
            </div>
          </div>

          {/* Características */}
          {groupedFeatures && Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-semibold capitalize">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {categoryFeatures?.map(feature => (
                  <span
                    key={feature.id}
                    className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm"
                  >
                    {feature.icon} {feature.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
          
          {/* Shares */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {share1_price && (
              <div className="bg-gray-50 p-2 rounded-md">
                <div className="font-semibold">Share 1</div>
                <div>${share1_price.toLocaleString()}</div>
                <div className={`text-sm ${
                  share1_status === 'disponible' ? 'text-green-600' :
                  share1_status === 'reservada' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {share1_status}
                </div>
              </div>
            )}
            
            {share2_price && (
              <div className="bg-gray-50 p-2 rounded-md">
                <div className="font-semibold">Share 2</div>
                <div>${share2_price.toLocaleString()}</div>
                <div className={`text-sm ${
                  share2_status === 'disponible' ? 'text-green-600' :
                  share2_status === 'reservada' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {share2_status}
                </div>
              </div>
            )}
            
            {share3_price && (
              <div className="bg-gray-50 p-2 rounded-md">
                <div className="font-semibold">Share 3</div>
                <div>${share3_price.toLocaleString()}</div>
                <div className={`text-sm ${
                  share3_status === 'disponible' ? 'text-green-600' :
                  share3_status === 'reservada' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {share3_status}
                </div>
              </div>
            )}
            
            {share4_price && (
              <div className="bg-gray-50 p-2 rounded-md">
                <div className="font-semibold">Share 4</div>
                <div>${share4_price.toLocaleString()}</div>
                <div className={`text-sm ${
                  share4_status === 'disponible' ? 'text-green-600' :
                  share4_status === 'reservada' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {share4_status}
                </div>
              </div>
            )}
          </div>
          
          {agent && (
            <div className="text-sm mt-4 text-gray-600">
              <span className="font-semibold">Agente:</span> {agent.name} - {agent.phone}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link
            to={`/properties/${id}`}
            className="w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Ver detalles
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 