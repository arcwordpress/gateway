import { useContext } from 'react';
import GatewayDataContext from '../contexts/GatewayDataContext';

/**
 * Hook to access Gateway Data configuration
 * This is optional - mainly useful if you need to know what API config is active
 *
 * @returns {Object} Gateway data config
 * @returns {string|null} apiUrl - API base URL if overridden
 * @returns {Object|null} auth - Auth configuration if overridden
 *
 * @example
 * const { apiUrl, auth } = useGatewayData();
 */
export const useGatewayData = () => {
  const context = useContext(GatewayDataContext);
  return context;
};

export default useGatewayData;
