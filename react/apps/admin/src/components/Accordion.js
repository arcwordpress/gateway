import { useState } from 'react';

function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="gty-accordion">
      {items.map((item, index) => (
        <div key={index} className="gty-accordion__item">
          <button
            onClick={() => toggleAccordion(index)}
            className="gty-accordion__trigger"
          >
            <div className="gty-accordion__trigger-content">
              {item.trigger}
            </div>
            <svg
              className={`gty-accordion__icon${openIndex === index ? ' gty-accordion__icon--open' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {openIndex === index && (
            <div className="gty-accordion__content">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Accordion;
