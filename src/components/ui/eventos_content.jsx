import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Calendar, MapPin, User, AlertCircle, Clock } from 'lucide-react';
import { DateTime } from 'luxon';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const EventosContent = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventStatus, setEventStatus] = useState({ text: '', color: '' });

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (!id) throw new Error('No event ID provided');

        const { data, error } = await supabase
          .from('evento')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setEvent(data);
        setLoading(false);
        
        // Calculate event status once we have the data
        calculateEventStatus(
          data.fecha_inicio, 
          data.fecha_fin, 
          data.hora_inicio, 
          data.hora_fin
        );
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event data');
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  // Calculate event status based on dates and times
// Calculate event status based on dates and times
const calculateEventStatus = (startDateStr, endDateStr, startTimeStr, endTimeStr) => {
    const TIMEZONE = 'America/Mexico_City';
  
    const now = DateTime.now().setZone(TIMEZONE);
    console.log('Current local date/time:', now.toISO());
  
    // Parse start date
    let start = startDateStr.includes('/')
      ? DateTime.fromFormat(startDateStr, 'dd/MM/yy', { zone: TIMEZONE })
      : DateTime.fromISO(startDateStr, { zone: TIMEZONE });
  
    if (startTimeStr) {
      const [hours, minutes] = startTimeStr.split(':').map(Number);
      start = start.set({ hour: hours, minute: minutes });
    } else {
      start = start.startOf('day');
    }
  
    // Parse end date
    let end = null;
    if (endDateStr) {
      end = endDateStr.includes('/')
        ? DateTime.fromFormat(endDateStr, 'dd/MM/yy', { zone: TIMEZONE })
        : DateTime.fromISO(endDateStr, { zone: TIMEZONE });
  
      if (endTimeStr) {
        const [hours, minutes] = endTimeStr.split(':').map(Number);
        end = end.set({ hour: hours, minute: minutes });
      } else {
        end = end.endOf('day');
      }
    }
  
    const daysDiff = start.startOf('day').diff(now.startOf('day'), 'days').toObject().days;
    const minutesToStart = Math.floor(start.diff(now, 'minutes').toObject().minutes);
  
    console.log('Parsed (localized) start:', start.toISO());
    console.log('Parsed (localized) end:', end?.toISO());
    console.log('Days difference:', daysDiff);
    console.log('Minutes to start:', minutesToStart);
  
    // Determine status
    if (daysDiff > 0) {
      if (daysDiff > 5) {
        setEventStatus({
          text: 'PRÓXIMAMENTE',
          color: '#000',
        });
      } else {
        setEventStatus({
          text: `${daysDiff} día${daysDiff !== 1 ? 's' : ''} para comenzar`,
         color: '#000'
        });
      }
    } else if (daysDiff === 0) {
      if (minutesToStart > 0) {
        const hoursToStart = Math.floor(minutesToStart / 60);
        const remainingMinutes = minutesToStart % 60;
  
        setEventStatus({
          text: hoursToStart > 0
            ? `${hoursToStart}h ${remainingMinutes}m para comenzar`
            : `${remainingMinutes}m para comenzar`,
          color: '#000'
        });
      } else {
        if (end && now > end) {
          setEventStatus({
            text: 'FINALIZADO',
            color: '#f44336',
          });
        } else {
          setEventStatus({
            text: 'EN CURSO',
            color: '#4caf50',
          });
        }
      }
    } else {
      if (end && now > end) {
        setEventStatus({
          text: 'FINALIZADO',
          color: '#f44336',
        });
      } else {
        setEventStatus({
          text: 'EN CURSO',
          color: '#4caf50',
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('/')) return dateString;

    // Parse the date with timezone handling
    // Add time part to avoid timezone issues
    const dateWithTime = dateString.includes('T') ? dateString : `${dateString}T12:00:00`;
    const date = new Date(dateWithTime);
    
    // Add UTC offset to ensure the correct day
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    
    return utcDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Format time (HH:MM)
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // Handle different time formats
    // For SQL TIME type, it may come as "HH:MM:SS" or "HH:MM:SS.MS"
    if (typeof timeString === 'string') {
      // Remove any milliseconds part and take only hours and minutes
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
      }
    }
    
    return timeString;
  };

  if (loading) return <div>Cargando evento...</div>;
  if (error) return <div>{error}</div>;
  if (!event) return <div>No se encontró el evento.</div>;

  return (
    <div className="event-container">
      <div
        className="cover-image image_2"
        style={{
          backgroundImage: `url(${event.imagen})`,
          height: '40vh',
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      ></div>

      <div className="event-details" style={{
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>

        {/* TÍTULO */}
        <h2 style={{
          fontWeight: 'bold',
          textAlign: 'left',
          fontSize: '28px',
          fontFamily: 'JetBrains Mono, monospace',
          marginTop: '10px',
          marginBottom: '30px'
        }}>
          {event.nombre.toUpperCase()}
        </h2>

        {/* DESCRIPCIÓN */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{
            fontWeight: 'bold',
            fontSize: '16px',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '10px'
          }}>
            DESCRIPCIÓN
          </h3>
          <p style={{
            lineHeight: '1.5',
            fontFamily: 'monospace',
            fontSize: '14px',
            textAlign: 'justify',
            whiteSpace: 'pre-line'
          }}>
            {event.descripcion}
          </p>
        </div>

        {/* FECHA with STATUS ALERT */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{
            fontWeight: 'bold',
            fontSize: '16px',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Calendar size={16} /> FECHA
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <p style={{
              fontFamily: 'monospace',
              fontSize: '14px',
            }}>
              {formatDate(event.fecha_inicio)} 
              {event.fecha_fin && ` - ${formatDate(event.fecha_fin)}`}
            </p>
            
            {/* Event status alert */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: eventStatus.color,
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              <AlertCircle size={12} />
              {eventStatus.text}
            </div>
          </div>
        </div>

        {/* HORA - Separate section for hours */}
        {(event.hora_inicio || event.hora_fin) && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              fontWeight: 'bold',
              fontSize: '16px',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Clock size={16} /> HORA
            </h3>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              display: 'grid',
              gridTemplateColumns: '80px auto',
              rowGap: '8px',
            }}>
              {event.hora_inicio && (
                <>
                  <div style={{ fontWeight: 'bold' }}>INICIO:</div>
                  <div>{formatTime(event.hora_inicio)}</div>
                </>
              )}
              
              {event.hora_fin && (
                <>
                  <div style={{ fontWeight: 'bold' }}>FIN:</div>
                  <div>{formatTime(event.hora_fin)}</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* UBICACIÓN */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{
            fontWeight: 'bold',
            fontSize: '16px',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={16} /> UBICACIÓN
          </h3>
          <p style={{
            lineHeight: '1.5',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            {event.ubicacion}
          </p>
        </div>

        {/* CONTACTO */}
        {event.contactos && (
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{
              fontWeight: 'bold',
              fontSize: '16px',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <User size={16} /> CONTACTO
            </h3>
            <p style={{
              lineHeight: '1.5',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}>
              {event.contactos.toUpperCase()}
            </p>
          </div>
        )}

        {/* REGISTRO - only show if event has not ended */}
        {event.url_registro && eventStatus.text !== 'FINALIZADO' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px',
            marginBottom: '20px'
          }}>
            <a
              href={event.url_registro}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#000',
                color: 'white',
                padding: '12px 24px',
                textDecoration: 'none',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 'bold',
                fontSize: '14px',
                borderRadius: '4px'
              }}
            >
              REGISTRARSE
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventosContent;