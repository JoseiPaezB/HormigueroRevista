// api/send-email.js
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the secret key from the request for authentication
  const { apiKey, subject, htmlContent } = req.body;
  
  // Check API key (simple security)
  if (apiKey !== import.meta.env.EMAIL_API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: import.meta.env.EMAIL_HOST,
      port: parseInt(import.meta.env.EMAIL_PORT || '587'),
      secure: import.meta.env.EMAIL_SECURE === 'true',
      auth: {
        user: import.meta.env.EMAIL_USER,
        pass: import.meta.env.EMAIL_PASSWORD
      }
    });

    // Fetch subscribers from Supabase
    const { data: subscribers, error } = await supabase
      .from('suscriptor')
      .select('correo');
    
    if (error) throw error;
    
    console.log(`Found ${subscribers.length} subscribers`);
    
    // Send emails to all subscribers
    const emailPromises = subscribers.map(subscriber => {
      const mailOptions = {
        from: `"Hormiguero" <${import.meta.env.EMAIL_USER}>`,
        to: subscriber.correo,
        subject: subject,
        html: htmlContent
      };
      
      return transporter.sendMail(mailOptions);
    });
    
    await Promise.all(emailPromises);
    
    res.status(200).json({ 
      success: true, 
      count: subscribers.length,
      message: `Successfully sent emails to ${subscribers.length} subscribers`
    });
    
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ error: error.message });
  }
}