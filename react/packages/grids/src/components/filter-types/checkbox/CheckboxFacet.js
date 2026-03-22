import './style.css';

/**
 * CheckboxFacet Component
 * Boolean toggle facet for filtering
 *
 * @param {Object} props
 * @param {boolean} props.value - Current checked state
 * @param {Function} props.onChange - Change handler receives boolean
 * @param {string} props.label - Label text
 * @param {string} props.className - Additional CSS classes
 */
const CheckboxFacet = ({ value = false, onChange, label = '', className = '' }) => (
  <div className={['checkbox-facet', className].filter(Boolean).join(' ')}>
    <label className="checkbox-facet__label">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange && onChange(e.target.checked)}
        className="checkbox-facet__input"
      />
      {label && <span className="checkbox-facet__text">{label}</span>}
    </label>
  </div>
);

export default CheckboxFacet;
