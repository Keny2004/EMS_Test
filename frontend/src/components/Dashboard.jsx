import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Zap, Thermometer, Battery, ShieldCheck } from 'lucide-react';
import '../index.css';

function MetricCard({ title, value, unit, icon: Icon, colorClass, isWarning }) {
  return (
    <div className={`glass animate-fade-in ${isWarning ? 'warning-glow' : ''}`} style={{
      padding: '24px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      transition: 'transform 0.2s',
      cursor: 'default'
    }}
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        padding: '16px',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.05)',
        color: `var(--${colorClass})`
      }}>
        <Icon size={32} />
      </div>
      <div>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
          {title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '28px', fontWeight: '700', color: isWarning ? 'var(--danger)' : 'var(--text-primary)' }}>
            {value}
          </span>
          <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [dataHistory, setDataHistory] = useState([]);
  const [currentData, setCurrentData] = useState({
    soc: 0, soh: 0, temp: 0, voltage: 0, current: 0, health: 'Unknown'
  });

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/temperature');

    ws.onopen = () => {
      console.log("WebSocket connected!");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      
      if (msg.type === 'update') {
        const batteries = msg.data;
        if (!batteries || batteries.length === 0) return;
        
        // Calculate system averages
        let avgSoc = 0, avgSoh = 0, avgTemp = 0, avgVoltage = 0, avgCurrent = 0;
        let systemHealth = 'Good';

        batteries.forEach(b => {
          avgSoc += b.soc;
          avgSoh += b.soh;
          avgTemp += b.temp;
          avgVoltage += b.voltage;
          avgCurrent += b.current;

          if (b.health === 'Critical') systemHealth = 'Critical';
          else if (b.health === 'Warning' && systemHealth !== 'Critical') systemHealth = 'Warning';
        });

        const num = batteries.length;
        const avgData = {
          soc: (avgSoc / num).toFixed(1),
          soh: (avgSoh / num).toFixed(1),
          temp: (avgTemp / num).toFixed(1),
          voltage: (avgVoltage / num).toFixed(1),
          current: (avgCurrent / num).toFixed(1),
          health: systemHealth,
          time: new Date(batteries[0].timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' })
        };
        
        setCurrentData(avgData);
        setDataHistory(prev => {
          const newHistory = [...prev, avgData];
          if (newHistory.length > 50) newHistory.shift();
          return newHistory;
        });
      }
    };

    return () => ws.close();
  }, []);

  const isTempHigh = parseFloat(currentData.temp) > 45;
  const isSocLow = parseFloat(currentData.soc) < 20;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 className="text-gradient" style={{ margin: '0 0 8px 0', fontSize: '32px' }}>
          System Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Aggregated status of all 16 battery units
        </p>
      </div>

      {/* Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px',
        marginBottom: '40px' 
      }}>
        <MetricCard 
          title="Avg State of Charge (SOC)" 
          value={currentData.soc} 
          unit="%" 
          icon={Battery} 
          colorClass={isSocLow ? 'danger' : 'success'}
          isWarning={isSocLow}
        />
        <MetricCard 
          title="Avg State of Health (SOH)" 
          value={currentData.soh} 
          unit="%" 
          icon={ShieldCheck} 
          colorClass="accent-primary"
        />
        <MetricCard 
          title="Avg Voltage" 
          value={currentData.voltage} 
          unit="V" 
          icon={Zap} 
          colorClass="warning"
        />
        <MetricCard 
          title="Avg Temperature" 
          value={currentData.temp} 
          unit="°C" 
          icon={Thermometer} 
          colorClass={isTempHigh ? 'danger' : 'accent-secondary'}
          isWarning={isTempHigh}
        />
        <MetricCard 
          title="Avg Current" 
          value={currentData.current} 
          unit="A" 
          icon={Activity} 
          colorClass="text-primary"
        />
        <MetricCard 
          title="System Health" 
          value={currentData.health} 
          unit="" 
          icon={Activity} 
          colorClass={currentData.health === 'Critical' ? 'danger' : currentData.health === 'Warning' ? 'warning' : 'success'}
          isWarning={currentData.health === 'Critical'}
        />
      </div>

      {/* Charts Area */}
      <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '600' }}>System Averages Trend</h2>
        <div style={{ height: '400px', width: '100%' }}>
          <ResponsiveContainer>
            <LineChart data={dataHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis yAxisId="left" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="soc" name="Avg SOC (%)" stroke="var(--success)" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="temp" name="Avg Temp (°C)" stroke="var(--danger)" strokeWidth={3} dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="voltage" name="Avg Voltage (V)" stroke="var(--warning)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

