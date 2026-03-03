import React, { useState } from 'react';
import { Download, CalendarIcon } from 'lucide-react';

function DataExport() {
  // 預設為過去一天
  const defaultEnd = new Date();
  const defaultStart = new Date(defaultEnd.getTime() - 24 * 60 * 60 * 1000);
  
  // yyyy-MM-ddTHH:mm 格式，適用於 datetime-local input
  const formatForInput = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [startTime, setStartTime] = useState(formatForInput(defaultStart));
  const [endTime, setEndTime] = useState(formatForInput(defaultEnd));
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);
      
      const response = await fetch(`http://127.0.0.1:8000/api/export?start_time=${startTimestamp}&end_time=${endTimestamp}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ems_data_${startTimestamp}_${endTimestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("匯出失敗，請確認後端伺服器運行正常且資料庫有符合條件的紀錄。");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-primary)',
    fontSize: '16px',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '8px'
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '40px' }}>
        <h1 className="text-gradient" style={{ margin: '0 0 8px 0', fontSize: '32px' }}>
          Data Export
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Download historical battery performance metrics.
        </p>
      </div>

      <div className="glass" style={{ 
        padding: '40px', 
        borderRadius: '24px',
        maxWidth: '600px'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
            Start Time
          </label>
          <input 
            type="datetime-local" 
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
            End Time
          </label>
          <input 
            type="datetime-local" 
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button 
          onClick={handleExport}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            background: 'var(--accent-primary)',
            color: 'white',
            fontWeight: '600',
            fontSize: '16px',
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            transition: 'opacity 0.2s',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
          }}
        >
          {isLoading ? (
            'Preparing Download...'
          ) : (
            <>
              <Download size={20} />
              Export to CSV
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default DataExport;
