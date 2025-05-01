import * as React from 'react';
import { Button } from '../../../components/ui/button';
import { PropertiesList } from '../../components/properties/PropertiesList';
import { GeocodeProperties } from '../../../components/GeocodeProperties';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Property } from '../../../types/property';

export default async function PropertiesPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: properties } = await supabase.from('properties').select('*');

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Propiedades</h1>
        <Button asChild>
          <a href="/dashboard/properties/new">
            Agregar Propiedad
          </a>
        </Button>
      </div>

      <GeocodeProperties />

      <div className="mt-8">
        <PropertiesList properties={properties || []} />
      </div>
    </div>
  );
} 