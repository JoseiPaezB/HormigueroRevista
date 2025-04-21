// src/components/AdminEmailSender.jsx
import React, { useState } from 'react';

const AdminEmailSender = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const apiSecret = import.meta.env.VITE_EMAIL_API_SECRET; // Store this in your env

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    
    try {
      const response = await fetch('/api/sendEmails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiSecret,
          subject,
          htmlContent: content
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setStatus({
          success: true,
          message: `Emails sent successfully to ${result.count} subscribers!`
        });
        setSubject('');
        setContent('');
      } else {
        setStatus({
          success: false,
          message: result.error || 'Failed to send emails'
        });
      }
    } catch (error) {
      setStatus({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Send Email to Subscribers</h2>
      
      {status && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          backgroundColor: status.success ? '#d4edda' : '#f8d7da',
          color: status.success ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          {status.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="subject" style={{ display: 'block', marginBottom: '5px' }}>
            Subject:
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="content" style={{ display: 'block', marginBottom: '5px' }}>
            Email Content (HTML):
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '200px' }}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Sending...' : 'Send Email to All Subscribers'}
        </button>
      </form>
    </div>
  );
};

export default AdminEmailSender;