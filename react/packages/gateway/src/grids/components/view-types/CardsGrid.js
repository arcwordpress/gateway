import { useCardsContext } from '../../context/CardsContext';
import CardsCard from './CardsCard';

/**
 * CardsGrid — the `.cards-view__grid` container.
 *
 * Three usage modes:
 *   1. No children — renders a default CardsCard for every record.
 *   2. Render prop — called once per record, full control over each card:
 *        <CardsView.Grid>{(record) => <CardsView.Card record={record}>…</CardsView.Card>}</CardsView.Grid>
 *   3. Static children — render whatever you like inside the grid container.
 */
const CardsGrid = ({ children }) => {
  const { data } = useCardsContext();

  return (
    <div className="cards-view__grid">
      {typeof children === 'function'
        ? data.map((record) => <div key={record.id}>{children(record)}</div>)
        : children ?? data.map((record) => <CardsCard key={record.id} record={record} />)
      }
    </div>
  );
};

export default CardsGrid;
