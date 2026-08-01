export default function SeatGauge({ capacity, seatsBooked }) {
  const booked = Math.min(seatsBooked, capacity);
  const percent = capacity > 0 ? Math.round((booked / capacity) * 100) : 0;
  const available = capacity - booked;
  const plenty = percent < 70;

  return (
    <div className="seat-gauge">
      <div className="seat-gauge-track">
        <div
          className={`seat-gauge-fill${plenty ? ' plenty' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="seat-gauge-label">
        {available > 0 ? `${available} of ${capacity} seats open` : 'Sold out'}
      </div>
    </div>
  );
}
