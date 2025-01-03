import axios from 'axios';
import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    date: '',
    time: '',
    guests: 1,
  });

  const [reservationDetails, setReservationDetails] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setFormData({ ...formData, name: value });
    } else {
      alert('Name should contain only letters.');
    }
  };

  const handleContactChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setFormData({ ...formData, contact: value });
    } else {
      alert('Contact should contain only numbers.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate contact number length
    if (formData.contact.length < 10 || formData.contact.length > 13) {
      alert('Contact number must be between 10 and 13 digits.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/bookings', formData);

      // Change the alert message to a custom success message
      alert('Thanks for trusting us, your form is submitted!');

      // Ensure successful booking response status
      if (response.status === 201) {
        setReservationDetails(formData);
        setIsSubmitted(true);
        setFormData({ name: '', contact: '', date: '', time: '', guests: 1 });
      }
    } catch (error) {
      if (error.response?.status === 409) {
        alert('This slot is already booked. Please choose a different time.');
      } else if (error.response?.status === 400) {
        alert(error.response.data);
      } else {
        alert('Failed to create booking. Please try again.');
      }
    }
  };

  return (
    <div className="container">
      {isSubmitted ? (
        <div>
          <h1>Reservation Summary</h1>
          <p>Name: {reservationDetails.name}</p>
          <p>Contact: {reservationDetails.contact}</p>
          <p>Date: {reservationDetails.date}</p>
          <p>Time: {reservationDetails.time}</p>
          <p>Guests: {reservationDetails.guests}</p>
          <button onClick={() => setIsSubmitted(false)}>Back</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h1>Restaurant Table Booking</h1>
          <div>
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              required
            />
          </div>
          <div>
            <label>Contact</label>
            <input
              type="text"
              value={formData.contact}
              onChange={handleContactChange}
              required
            />
          </div>
          <div>
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Guests</label>
            <input
              type="number"
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
}
