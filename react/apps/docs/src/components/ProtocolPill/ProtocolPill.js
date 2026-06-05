// ProtocolPill.js
import Pill from './Pill';
import Protocol from './Protocol';

const methodToClass = {
    GET: 'pill--get',
    POST: 'pill--post',
    // etc.
};

function ProtocolPill({ method }) {
    const className = methodToClass[method.toUpperCase()] || '';
    return (
        <Pill className={className}>
            <Protocol method={method} />
        </Pill>
    );
}
export default ProtocolPill;