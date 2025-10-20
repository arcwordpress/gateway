import { useState } from 'react';

function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded">
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              {item.trigger}
            </div>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${
                openIndex === index ? 'transform rotate-180' : ''
              }`}
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
            <div className="px-3 py-3 border-t border-gray-200 bg-gray-50">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Accordion;
