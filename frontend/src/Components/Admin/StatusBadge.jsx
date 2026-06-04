import React from 'react';

const STATUS_COLORS = {
    pending:     'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed:   'bg-blue-100   text-blue-800   border-blue-200',
    in_delivery: 'bg-purple-100 text-purple-800 border-purple-200',
    delivered:   'bg-green-100  text-green-800  border-green-200',
    cancelled:   'bg-red-100    text-red-800    border-red-200',
};

const DEFAULT_COLOR = 'bg-gray-100 text-gray-800 border-gray-200';

/**
 * Renders a coloured pill for an order status.
 * @param {string} status  - the raw backend enum value
 * @param {object} labels  - map of status → display string, e.g. t.status
 */
const StatusBadge = React.memo(({ status, labels = {} }) => {
    const key = status?.toLowerCase() ?? '';
    const color = STATUS_COLORS[key] ?? DEFAULT_COLOR;
    const text  = labels[key] ?? status;

    return (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
            {text}
        </span>
    );
});

StatusBadge.displayName = 'StatusBadge';
export default StatusBadge;
