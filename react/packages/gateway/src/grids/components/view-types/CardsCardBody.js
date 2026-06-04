const CardsCardBody = ({ record }) => {
  if (!record.description) return null;

  return (
    <div className="cards-view__card-body">
      <div className="cards-view__card-description">
        {record.description}
      </div>
    </div>
  );
};

export default CardsCardBody;
