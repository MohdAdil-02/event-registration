import { Link } from 'react-router-dom';
import { formatDateParts } from '../utils/date';

export default function TicketCard({ event }) {
  const { month, day, year } = formatDateParts(event.date);
  const seatsAvailable = event.capacity - event.seatsBooked;

  return (
    <Link to={`/events/${event._id}`} className="ticket-card clickable" aria-label={`View ${event.title}`}>
      <div className="ticket-main">
        <span className="eyebrow">{event.category || 'General'}</span>
        <h3 className="ticket-title">{event.title}</h3>
        <p className="ticket-desc">
          {event.description.length > 110
            ? `${event.description.slice(0, 110)}…`
            : event.description}
        </p>
        <div className="ticket-meta">
          <span>📍 {event.location}</span>
          <span>{seatsAvailable > 0 ? `${seatsAvailable} seats left` : 'Sold out'}</span>
        </div>
      </div>
      <div className="ticket-stub">
        <span className="stub-month">{month}</span>
        <span className="stub-day">{day}</span>
        <span className="stub-year">{year}</span>
        <span className={`stub-tag status-${event.status}`}>{event.status}</span>
      </div>
    </Link>
  );
}
