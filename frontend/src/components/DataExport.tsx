import React from 'react';
import { ArrowDownTrayIcon } from './icons/IconComponents';

interface DataExportProps {
  data: any[];
  filename: string;
}

const DataExport: React.FC<DataExportProps> = ({ data, filename }) => {
  const convertToCSV = (objArray: any[]) => {
    if (objArray.length === 0) return '';
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';

    for (const index in objArray[0]) {
      row += index + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (const index in array[i]) {
        if (line !== '') line += ',';
        line += array[i][index];
      }
      str += line + '\r\n';
    }
    return str;
  };

  const handleExport = () => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
    >
      <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
      Export CSV
    </button>
  );
};

export default DataExport;