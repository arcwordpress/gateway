import { createContext, useContext } from 'react';

const CardsContext = createContext(null);

export const useCardsContext = () => useContext(CardsContext);

export default CardsContext;
