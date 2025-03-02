const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'restaurant_table_booking',
});

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL Database');
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Default route to check API availability
app.get('/', (req, res) => {
  res.send('Welcome to the Restaurant Table Booking API!');
});

// Route to create a new booking
app.post('/api/bookings', (req, res) => {
  const { name, contact, date, time, guests } = req.body;

  // Validate the name contains only letters and spaces
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return res.status(400).send('Name should contain only letters.');
  }

  // Validate that the contact contains only numbers
  if (!/^\d+$/.test(contact)) {
    return res.status(400).send('Contact should contain only numbers.');
  }

  // Check for duplicate bookings
  const checkQuery = `
    SELECT * FROM reservations 
    WHERE date = ? AND time = ?
  `;
  db.query(checkQuery, [date, time], (err, results) => {
    if (err) {
      console.error('Error checking existing booking:', err);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      return res.status(409).send('This slot is already booked.');
    }

    // Insert new booking into the database
    const insertQuery = `
      INSERT INTO reservations (name, contact, date, time, guests) 
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(insertQuery, [name, contact, date, time, guests], (err) => {
      if (err) {
        console.error('Error inserting booking:', err);
        return res.status(500).send('Failed to create booking.');
      }
      res.status(201).send('Booking created successfully.');
    });
  });
});

// Route to get all bookings
app.get('/api/bookings', (req, res) => {
  const query = 'SELECT * FROM reservations';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      return res.status(500).send('Failed to fetch bookings.');
    }
    res.status(200).json(results);
  });
});

// Route to delete a booking by ID
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM reservations WHERE id = ?';
  db.query(query, [id], (err) => {
    if (err) {
      console.error('Error deleting booking:', err);
      return res.status(500).send('Failed to delete booking.');
    }
    res.status(200).send('Booking deleted successfully.');
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
