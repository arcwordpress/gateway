/**
 * Gateway Filter Group — view.js
 *
 * Store namespace: gateway-filter-group
 *
 * This block renders inside a Gateway Grid block and inherits the Grid's
 * Interactivity API context (gateway/gateway-grid).  The filter <select>
 * calls actions.filterByStatus which is defined in the parent Grid store —
 * no explicit data-wp-interactive is set on the filter group's root element,
 * so it inherits the nearest ancestor's namespace automatically.
 *
 * The gateway-filter-group store is reserved here for future logic:
 *   - Multi-field filter coordination
 *   - Filter state serialisation / URL sync
 *   - Animated open/close of filter panels
 *
 * Nothing in this store needs to run today; it is registered so the namespace
 * exists and can be extended without a breaking change.
 */

import { store } from '@wordpress/interactivity';

// Reserved namespace — no active logic yet.
// TODO: Move filter actions here once the Filter Group is fully independent
// of the Grid store (i.e. when it can call gridStore.actions.filterByStatus
// via a cross-store reference without breaking context binding).
store( 'gateway-filter-group', {} );
