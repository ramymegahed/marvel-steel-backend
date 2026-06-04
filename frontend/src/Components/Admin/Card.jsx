import React from 'react';

export const Card = React.memo(({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-[#2C2C2C]/10 ${className}`}>
        {children}
    </div>
));
Card.displayName = 'Card';

export const CardHeader = React.memo(({ children }) => (
    <div className="p-6 pb-0">{children}</div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.memo(({ children }) => (
    <h3 className="text-lg font-semibold text-[#2C2C2C]" style={{ fontFamily: 'Playfair Display, serif' }}>
        {children}
    </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardContent = React.memo(({ children, className = '' }) => (
    <div className={`p-6 pt-0 ${className}`}>{children}</div>
));
CardContent.displayName = 'CardContent';
