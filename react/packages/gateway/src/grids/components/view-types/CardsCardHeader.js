import { useCardsContext } from '../../context/CardsContext';

const CardsCardHeader = ({ record }) => {
  const { labelKey, labelStatus } = useCardsContext();

  return (
    <div className="cards-view__card-header">
      <span className="grid__id-badge">#{record.id}</span>
      <div className="cards-view__card-title">
        {labelStatus === 'none'
          ? <span className="grid__no-label">No default label field set for this collection.</span>
          : (record[labelKey] || <span className="grid__no-label grid__no-label--empty">—</span>)
        }
      </div>
    </div>
  );
};

export default CardsCardHeader;
