import React from 'react';

const Table = ({ columns, data, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>{columns.map(col => (<th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.label}</th>))}</tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => (<td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row[col.key]}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
