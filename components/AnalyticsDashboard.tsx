import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector, LineChart, Line } from 'recharts';
import type { Suggestion } from '../types';
import { Category, Status } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; description: string; className?: string; }> = ({ title, value, description, className }) => (
    <div className="bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-4 sm:p-6 relative overflow-hidden">
        <div className={`absolute top-0 right-0 -mt-2 -mr-2 text-4xl sm:-mt-4 sm:-mr-4 sm:text-5xl font-bold text-gray-200/20 dark:text-white/5 select-none ${className}`}>
          {value}
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 font-medium">{title}</h3>
        <p className="text-3xl sm:text-4xl font-bold mt-2 text-gray-800 dark:text-gray-200">{value}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{description}</p>
    </div>
);

const WordCloud: React.FC<{ data: { text: string; value: number }[] }> = ({ data }) => {
    const maxFreq = Math.max(...data.map(d => d.value), 0);
    const minFreq = Math.min(...data.map(d => d.value), 1);

    const getFontSize = (value: number) => {
        if (maxFreq === minFreq) return '1rem';
        const size = 12 + ((value - minFreq) / (maxFreq - minFreq)) * 28;
        return `${size}px`;
    };

    return (
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 p-4">
            {data.map((word, i) => (
                <span
                    key={word.text}
                    className="font-bold transition-all duration-300 hover:scale-110"
                    style={{
                        fontSize: getFontSize(word.value),
                        color: `hsl(${i * 360 / data.length}, 70%, 60%)`,
                        opacity: 0.6 + (word.value / maxFreq) * 0.4,
                    }}
                >
                    {word.text}
                </span>
            ))}
        </div>
    );
};

const AnalyticsDashboard: React.FC<{ suggestions: Suggestion[], theme: string }> = ({ suggestions, theme }) => {

    const chartStyles = useMemo(() => {
        const isDark = theme === 'dark';
        return {
            tickFill: isDark ? '#9ca3af' : '#4b5563', // gray-400 / gray-600
            gridStroke: isDark ? 'rgba(128, 128, 128, 0.2)' : 'rgba(128, 128, 128, 0.2)',
            tooltip: {
                contentStyle: {
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    border: `1px solid ${isDark ? '#4a5568' : '#e2e8f0'}`,
                    borderRadius: '0.5rem',
                },
                itemStyle: { color: isDark ? '#e5e7eb' : '#1f2937' },
                labelStyle: { color: isDark ? '#d1d5db' : '#374151' },
            }
        };
    }, [theme]);

    const stats = useMemo(() => {
        if (suggestions.length === 0) {
            return { totalSuggestions: 0, totalVotes: 0, engagementRate: '0.0', implementationRate: '0.0' };
        }
        const totalUpvotes = suggestions.reduce((acc, s) => acc + s.upvotes, 0);
        const totalDownvotes = suggestions.reduce((acc, s) => acc + s.downvotes, 0);
        const totalComments = suggestions.reduce((acc, s) => acc + s.comments.length, 0);
        const implementedCount = suggestions.filter(s => s.status === Status.IMPLEMENTED).length;

        return {
            totalSuggestions: suggestions.length,
            totalVotes: totalUpvotes + totalDownvotes,
            engagementRate: ((totalUpvotes + totalDownvotes + totalComments) / suggestions.length).toFixed(1),
            implementationRate: ((implementedCount / suggestions.length) * 100).toFixed(1)
        };
    }, [suggestions]);

    const sentimentOverTimeData = useMemo(() => {
        const groupedByDate: { [key: string]: { Positive: number, Neutral: number, Negative: number } } = {};
        
        suggestions.forEach(s => {
            const date = new Date(s.createdAt).toISOString().split('T')[0];
            if (!groupedByDate[date]) {
                groupedByDate[date] = { Positive: 0, Neutral: 0, Negative: 0 };
            }
            groupedByDate[date][s.sentiment]++;
        });

        return Object.entries(groupedByDate)
            .map(([date, counts]) => ({ date, ...counts }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    }, [suggestions]);
    
    const topContributorsData = useMemo(() => {
      const contributors: { [id: string]: { name: string, score: number } } = {};
      suggestions.forEach(s => {
        if (!s.isAnonymous && s.author) {
          if (!contributors[s.author.id]) {
            contributors[s.author.id] = { name: s.author.name, score: 0 };
          }
          contributors[s.author.id].score += (s.upvotes * 2) + s.comments.length;
        }
      });
      return Object.values(contributors).sort((a,b) => b.score - a.score).slice(0, 5);
    }, [suggestions]);

    const statusFunnelData = useMemo(() => {
        const counts = { [Status.PENDING]: 0, [Status.REVIEWED]: 0, [Status.IMPLEMENTED]: 0, [Status.REJECTED]: 0 };
        suggestions.forEach(s => {
            if (s.status in counts) counts[s.status]++;
        });
        return [
            { name: Status.PENDING, count: counts[Status.PENDING] },
            { name: Status.REVIEWED, count: counts[Status.REVIEWED] },
            { name: Status.REJECTED, count: counts[Status.REJECTED] },
            { name: Status.IMPLEMENTED, count: counts[Status.IMPLEMENTED] },
        ];
    }, [suggestions]);

    const wordCloudData = useMemo(() => {
        const tagCounts: { [tag: string]: number } = {};
        suggestions.flatMap(s => s.tags).forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
        return Object.entries(tagCounts)
            .map(([text, value]) => ({ text, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 40);
    }, [suggestions]);

  return (
    <div className="space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard title="Total Suggestions" value={stats.totalSuggestions} description="All ideas submitted" />
            <StatCard title="Total Votes" value={stats.totalVotes} description="Upvotes and downvotes combined" />
            <StatCard title="Engagement Rate" value={stats.engagementRate} description="Interactions per suggestion" />
            <StatCard title="Implementation Rate" value={`${stats.implementationRate}%`} description="Percentage of ideas implemented" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
             <div className="bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-4 sm:p-6">
                <h3 className="text-xl font-bold mb-4">Sentiment Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sentimentOverTimeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridStroke} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: chartStyles.tickFill }} />
                        <YAxis tick={{ fontSize: 10, fill: chartStyles.tickFill }} />
                        <Tooltip {...chartStyles.tooltip} />
                        <Legend wrapperStyle={{ fontSize: '12px', color: chartStyles.tickFill }}/>
                        <Line type="monotone" dataKey="Positive" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="Neutral" stroke="#64748b" strokeWidth={2} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="Negative" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-4 sm:p-6">
                <h3 className="text-xl font-bold mb-4">Top Contributors</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topContributorsData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                        <XAxis type="number" hide tick={{ fill: chartStyles.tickFill }}/>
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: chartStyles.tickFill }} />
                        <Tooltip {...chartStyles.tooltip} cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}/>
                        <Bar dataKey="score" fill="#8884d8" background={{ fill: 'rgba(128, 128, 128, 0.1)' }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-4 sm:p-6">
                <h3 className="text-xl font-bold mb-4">Trending Topics</h3>
                 <div className="min-h-[250px] flex items-center justify-center">
                    {wordCloudData.length > 0 ? <WordCloud data={wordCloudData} /> : <p className="text-gray-500">Not enough data for a word cloud.</p>}
                 </div>
            </div>
             <div className="bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-4 sm:p-6">
                <h3 className="text-xl font-bold mb-4">Suggestion Status Funnel</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusFunnelData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                        <XAxis type="number" tick={{ fill: chartStyles.tickFill }} />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: chartStyles.tickFill }} />
                        <Tooltip {...chartStyles.tooltip} cursor={{fill: 'rgba(128, 128, 128, 0.1)'}} />
                        <Legend wrapperStyle={{ fontSize: '12px', color: chartStyles.tickFill }}/>
                        <Bar dataKey="count" name="Suggestions" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
             </div>
        </div>
    </div>
  );
};

export default AnalyticsDashboard;