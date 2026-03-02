import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LogOut, Activity, Zap, Thermometer, Battery, ShieldCheck } from 'lucide-react';
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
  const navigate = useNavigate();
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
      
      if (msg.type === 'history') {
        const formattedHistory = msg.data.map(d => ({
          ...d,
          time: new Date(d.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' })
        }));
        setDataHistory(formattedHistory);
        if (formattedHistory.length > 0) {
          setCurrentData(formattedHistory[formattedHistory.length - 1]);
        }
      } else if (msg.type === 'update') {
        const newData = msg.data;
        const formattedData = {
          ...newData,
          time: new Date(newData.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' })
        };
        
        setCurrentData(formattedData);
        setDataHistory(prev => {
          const newHistory = [...prev, formattedData];
          if (newHistory.length > 50) newHistory.shift();
          return newHistory;
        });
      }
    };

    return () => ws.close();
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const isTempHigh = currentData.temp > 45;
  const isSocLow = currentData.soc < 20;

  return (
    <div style={{ minHeight: '100vh', padding: '32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }} className="animate-fade-in">
        <div>
          <h1 className="text-gradient" style={{ margin: '0 0 8px 0', fontSize: '32px' }}>
            Energy Management Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Live Battery Status & Analytics
          </p>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--danger)',
          fontWeight: '600',
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px',
        marginBottom: '40px' 
      }}>
        <MetricCard 
          title="State of Charge (SOC)" 
          value={currentData.soc} 
          unit="%" 
          icon={Battery} 
          colorClass={isSocLow ? 'danger' : 'success'}
          isWarning={isSocLow}
        />
        <MetricCard 
          title="State of Health (SOH)" 
          value={currentData.soh} 
          unit="%" 
          icon={ShieldCheck} 
          colorClass="accent-primary"
        />
        <MetricCard 
          title="Voltage" 
          value={currentData.voltage} 
          unit="V" 
          icon={Zap} 
          colorClass="warning"
        />
        <MetricCard 
          title="Temperature" 
          value={currentData.temp} 
          unit="°C" 
          icon={Thermometer} 
          colorClass={isTempHigh ? 'danger' : 'accent-secondary'}
          isWarning={isTempHigh}
        />
        <MetricCard 
          title="Current" 
          value={currentData.current} 
          unit="A" 
          icon={Activity} 
          colorClass="text-primary"
        />
        <MetricCard 
          title="Overall Health" 
          value={currentData.health} 
          unit="" 
          icon={Activity} 
          colorClass={currentData.health === 'Critical' ? 'danger' : currentData.health === 'Warning' ? 'warning' : 'success'}
          isWarning={currentData.health === 'Critical'}
        />
      </div>

      {/* Charts Area */}
      <div className="glass animate-fade-in" style={{ padding: '32px', borderRadius: '24px' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '600' }}>Live Performance Overview</h2>
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
              <Line yAxisId="left" type="monotone" dataKey="soc" name="SOC (%)" stroke="var(--success)" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="temp" name="Temperature (°C)" stroke="var(--danger)" strokeWidth={3} dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="voltage" name="Voltage (V)" stroke="var(--warning)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
