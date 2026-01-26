import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
    return (
        <div className={`bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-gray-800">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
};
