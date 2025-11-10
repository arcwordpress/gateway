import { createContext, useContext } from '@wordpress/element';

const GridContext = createContext({
  namespace: null,
  route: null,
  collection: null,
  onRefresh: null,
});

export const GridProvider = GridContext.Provider;

export const useGridContext = () => {
  const context = useContext(GridContext);
  return context;
};

export default GridContext;