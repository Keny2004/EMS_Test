import React, { useState, useEffect } from 'react';
import { Battery, Zap, Thermometer, ShieldCheck } from 'lucide-react';

function BatteryCard({ data }) {
  const isWarning = data.health === 'Warning' || data.health === 'Critical';
  const colorClass = data.health === 'Critical' ? 'danger' : data.health === 'Warning' ? 'warning' : 'success';
  
  return (
    <div className={`glass animate-fade-in ${isWarning ? 'warning-glow' : ''}`} style={{
      padding: '24px',
      borderRadius: '20px',
      transition: 'transform 0.2s',
      cursor: 'pointer'
    }}
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Battery #{data.battery_id}</h3>
        <span style={{ 
          padding: '4px 12px', 
          borderRadius: '12px', 
          fontSize: '12px',
          fontWeight: '600',
          background: `rgba(var(--${colorClass}-rgb, 255,255,255), 0.1)`, 
          color: `var(--${colorClass})` 
        }}>
          {data.health}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
            <Battery size={14} /> SOC
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: data.soc < 20 ? 'var(--danger)' : 'var(--text-primary)' }}>
            {data.soc}%
          </div>
        </div>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
            <ShieldCheck size={14} /> SOH
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>
            {data.soh}%
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
            <Thermometer size={14} /> Temp
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: data.temp > 45 ? 'var(--danger)' : 'var(--text-primary)' }}>
            {data.temp}°C
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
            <Zap size={14} /> Voltage
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>
            {data.voltage}V
          </div>
        </div>
      </div>
    </div>
  );
}

function BatteryStatus() {
  const [batteries, setBatteries] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/temperature');

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'update') {
        // msg.data is an array of 16 batteries
        setBatteries(msg.data);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '40px' }} className="animate-fade-in">
        <h1 className="text-gradient" style={{ margin: '0 0 8px 0', fontSize: '32px' }}>
          Battery Status
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Live monitoring of all 16 battery units.
        </p>
      </div>

      {batteries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
          Waiting for sensor data...
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '24px' 
        }}>
          {batteries.map((b) => (
            <BatteryCard key={b.battery_id} data={b} />
          ))}
        </div>
      )}
    </div>
  );
}

export default BatteryStatus;
