
import type { Suggestion } from './types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateAvatar = (seed: string): string => {
  const hash = seed.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const color = `hsl(${hash % 360}, 75%, 60%)`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="40" height="40"><rect width="100" height="100" fill="${color}" /><text x="50" y="55" font-family="Arial, sans-serif" font-size="50" fill="#fff" text-anchor="middle" dominant-baseline="middle">${seed.charAt(0).toUpperCase()}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const generateAnonymousAvatar = (): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="40" height="40"><rect width="100" height="100" fill="#64748b" /><path d="M50 55C38.954 55 30 63.954 30 75V80H70V75C70 63.954 61.046 55 50 55ZM50 25C41.716 25 35 31.716 35 40C35 48.284 41.716 55 50 55C58.284 55 65 48.284 65 40C65 31.716 58.284 25 50 25Z" fill="#cbd5e1"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export const exportToJson = (data: Suggestion[]) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const link = document.createElement('a');
  link.href = jsonString;
  link.download = 'suggestions.json';
  link.click();
};

export const exportToCsv = (data: Suggestion[]) => {
  const header = 'ID,Title,Description,Category,Tags,Status,Upvotes,Downvotes,Sentiment,CreatedAt,IsAnonymous,AuthorName\n';
  const rows = data.map(s => 
    `"${s.id}","${s.title.replace(/"/g, '""')}","${s.description.replace(/"/g, '""')}","${s.category}","${s.tags.join(';')}","${s.status}",${s.upvotes},${s.downvotes},${s.sentiment},${new Date(s.createdAt).toISOString()},${s.isAnonymous},"${s.author?.name || ''}"`
  ).join('\n');
  
  const csvString = `data:text/csv;charset=utf-8,${encodeURIComponent(header + rows)}`;
  const link = document.createElement('a');
  link.href = csvString;
  link.download = 'suggestions.csv';
  link.click();
};