import { useCardsContext } from '../../context/CardsContext';

const CardsFooter = () => {
  const { data } = useCardsContext();

  return (
    <div className="cards-view__footer">
      {data.length} card(s)
    </div>
  );
};

export default CardsFooter;
