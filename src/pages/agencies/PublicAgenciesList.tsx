import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HiOutlineBuildingOffice2, HiOutlineLocationMarker, HiOutlinePhone, HiOutlineGlobeAlt } from 'react-icons/hi';
import { Skeleton } from '@/components/ui/skeleton';

interface RealEstateAgency {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo_url?: string;
}

const PublicAgenciesList = () => {
  const [agencies, setAgencies] = useState<RealEstateAgency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      const { data, error } = await supabase
        .from('real_estate_agencies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setAgencies(data || []);
    } catch (error) {
      console.error('Error fetching agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nuestras Agencias y Promotoras</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Colaboramos con las mejores agencias inmobiliarias para ofrecerte propiedades exclusivas y un servicio de confianza.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden h-full">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : agencies.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineBuildingOffice2 className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No hay agencias disponibles</h3>
            <p className="mt-2 text-gray-500">Vuelve a consultar más tarde.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agencies.map((agency) => (
              <Link key={agency.id} to={`/agencias/${agency.id}`} className="group h-full">
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden border-t-4 border-t-blue-600">
                  <CardHeader className="p-6 bg-white border-b flex flex-col items-center text-center relative">
                    <div className="w-24 h-24 rounded-full bg-gray-50 p-1 border shadow-sm mb-4 group-hover:scale-105 transition-transform duration-300">
                      {agency.logo_url ? (
                        <img 
                          src={agency.logo_url} 
                          alt={agency.name} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                          <HiOutlineBuildingOffice2 className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {agency.name}
                    </h2>
                  </CardHeader>
                  <CardContent className="p-6 flex-1">
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {agency.description || 'Sin descripción disponible.'}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      {agency.address && (
                        <div className="flex items-start">
                          <HiOutlineLocationMarker className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span>{agency.address}</span>
                        </div>
                      )}
                      {agency.phone && (
                        <div className="flex items-center">
                          <HiOutlinePhone className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                          <span>{agency.phone}</span>
                        </div>
                      )}
                      {agency.website && (
                        <div className="flex items-center">
                          <HiOutlineGlobeAlt className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{agency.website.replace(/^https?:\/\//, '')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 bg-gray-50 border-t">
                    <Button className="w-full bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 font-medium shadow-sm">
                      Ver Perfil y Propiedades
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicAgenciesList;

