import React, { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { DollarSign, Percent, Briefcase } from 'lucide-react';

interface AnalyticsProps {
    leads: any[];
}

export const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ leads }) => {
    const stats = useMemo(() => {
        const totalLeads = leads.length;
        const wonLeads = leads.filter(l => l.status === 'won').length;
        const lostLeads = leads.filter(l => l.status === 'lost').length;

        // Conversion Rate: Won / (Won + Lost) OR Won / Total? 
        // Typically Won / (Won + Lost) for closed leads, or Won / Total for pipeline health.
        // Let's do Won / Total Completed (Won+Lost)
        const completed = wonLeads + lostLeads;
        const conversionRate = completed > 0 ? ((wonLeads / completed) * 100).toFixed(1) : '0.0';

        const totalRevenue = leads
            .filter(l => l.status === 'won')
            .reduce((sum, l) => sum + (l.estimatedValue || l.totalPrice || 0), 0);

        const potentialRevenue = leads
            .filter(l => ['new', 'discussion'].includes(l.status))
            .reduce((sum, l) => sum + (l.estimatedValue || l.totalPrice || 0), 0);

        return { totalLeads, conversionRate, totalRevenue, potentialRevenue };
    }, [leads]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center space-x-4">
                <div className="p-3 bg-blue-900/20 rounded-lg text-blue-400">
                    <Briefcase size={24} />
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase">Всего проектов</p>
                    <p className="text-2xl font-bold text-white">{stats.totalLeads}</p>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center space-x-4">
                <div className="p-3 bg-green-900/20 rounded-lg text-green-400">
                    <Percent size={24} />
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase">Конверсия</p>
                    <p className="text-2xl font-bold text-white">{stats.conversionRate}%</p>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center space-x-4">
                <div className="p-3 bg-purple-900/20 rounded-lg text-purple-400">
                    <DollarSign size={24} />
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase">Успешные сделки</p>
                    <p className="text-2xl font-bold text-white">{stats.totalRevenue.toLocaleString('ru-RU')} ₸</p>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center space-x-4">
                <div className="p-3 bg-yellow-900/20 rounded-lg text-yellow-400">
                    <DollarSign size={24} />
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase">Потенциал</p>
                    <p className="text-2xl font-bold text-white">{stats.potentialRevenue.toLocaleString('ru-RU')} ₸</p>
                </div>
            </div>
        </div>
    );
};
