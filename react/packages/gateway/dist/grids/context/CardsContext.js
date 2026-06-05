import { createContext, useContext } from 'react';
var CardsContext = /*#__PURE__*/createContext(null);
export var useCardsContext = () => useContext(CardsContext);
export default CardsContext;