import { useNavigate, useLocation } from 'react-router-dom';
import { DateRange } from 'react-day-picker';

interface Property {
  id: string;
  title: string;
  location?: string;
  images?: string[] | null;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  property_type?: string;
  features?: string[];
  share1_owner_id?: string | null;
  share2_owner_id?: string | null;
  share3_owner_id?: string | null;
  share4_owner_id?: string | null;
  zona?: string;
  lavabos?: number;
  share1_status?: string;
  share2_status?: string;
  share3_status?: string;
  share4_status?: string;
}

interface ExchangeNavigationState {
  property: Property;
  dateRange: DateRange;
}

export const useExchangeNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener datos pasados desde la navegación
  const getNavigationData = (): ExchangeNavigationState | null => {
    return location.state as ExchangeNavigationState | null;
  };

  // Navegar al panel de intercambio con datos
  const navigateToExchange = (property: Property, dateRange: DateRange) => {
    navigate('/dashboard/owner/exchange', { 
      state: { 
        property, 
        dateRange 
      } 
    });
  };

  // Navegar de vuelta a explorar propiedades
  const navigateToExplore = () => {
    navigate('/dashboard/owner/explorar');
  };

  // Verificar si hay datos de navegación disponibles
  const hasNavigationData = (): boolean => {
    const data = getNavigationData();
    return !!(data?.property && data?.dateRange);
  };

  // Obtener solo la propiedad
  const getSelectedProperty = (): Property | null => {
    const data = getNavigationData();
    return data?.property || null;
  };

  // Obtener solo el rango de fechas
  const getSelectedDateRange = (): DateRange | null => {
    const data = getNavigationData();
    return data?.dateRange || null;
  };

  // Limpiar datos de navegación (útil para resetear el estado)
  const clearNavigationData = () => {
    navigate('/dashboard/owner/exchange', { 
      state: null,
      replace: true 
    });
  };

  return {
    getNavigationData,
    navigateToExchange,
    navigateToExplore,
    hasNavigationData,
    getSelectedProperty,
    getSelectedDateRange,
    clearNavigationData
  };
};
