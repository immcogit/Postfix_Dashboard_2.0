import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MailVolumeData } from '../types';

interface MailVolumeChartProps {
  data: MailVolumeData[];
}

const MailVolumeChart: React.FC<MailVolumeChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
      return <div className="flex items-center justify-center h-[350px] text-gray-500">No data available for the selected period.</div>
  }
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
             contentStyle={{ 
                backgroundColor: '#1e1e1e',
                border: '1px solid #444444',
                color: '#e5e7eb'
             }}
          />
          <Legend wrapperStyle={{color: '#e5e7eb'}}/>
          <Line type="monotone" dataKey="sent" stroke="#10b981" activeDot={{ r: 8 }} name="Sent" />
          <Line type="monotone" dataKey="bounced" stroke="#ef4444" name="Bounced" />
          <Line type="monotone" dataKey="deferred" stroke="#f59e0b" name="Deferred" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MailVolumeChart;