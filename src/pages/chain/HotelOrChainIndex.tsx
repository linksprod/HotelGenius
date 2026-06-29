import React from 'react';
import { useHotel } from '@/features/hotels/context/HotelContext';
import Index from '@/pages/Index';
import ChainLanding from '@/pages/chain/ChainLanding';

/**
 * Pivot component: renders the chain landing page if the current hotel
 * is flagged as a chain (is_chain = true in Supabase), otherwise renders
 * the normal hotel guest home page.
 */
const HotelOrChainIndex: React.FC = () => {
  const { hotel, isLoading } = useHotel();

  // While hotel data is loading, render nothing (TenantGuard handles the spinner)
  if (isLoading) return null;

  // Chain → show the Dar Jerba Hotels landing page
  if (hotel?.is_chain) {
    return <ChainLanding />;
  }

  // Regular hotel → show the normal guest app home page
  return <Index />;
};

export default HotelOrChainIndex;
