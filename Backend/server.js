const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());


// MySQL connection setup
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Connect to the MySQL server
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL server');

    // Create the database if it doesn't exist
    const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`;
    
    db.query(createDatabaseQuery, (err, results) => {
        if (err) {
            console.error('Error creating database:', err);
            return;
        }
        console.log(`Database '${process.env.DB_DATABASE}' checked/created successfully`);

        // Use the newly created or existing database
        db.query(`USE ${process.env.DB_DATABASE}`, (err) => {
            if (err) {
                console.error('Error selecting database:', err);
                return;
            }

            // Create the table if it doesn't exist
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS issue_reports (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    reporter_name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    location VARCHAR(100) NOT NULL,
                    issue_description TEXT NOT NULL,
                    status ENUM('incomplete', 'complete') DEFAULT 'incomplete',
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    technician VARCHAR(100)
                );
            `;

            db.query(createTableQuery, (err, results) => {
                if (err) {
                    console.error('Error creating table:', err);
                    return;
                }
                console.log('Table `issue_reports` checked/created successfully');
            });
        });
    });
});

//login users
const users = {
  staff: {
    username: "staffmember",
    password: "letmein!123",
  },
  technician: {
    username: "admin",
    password: "heretohelp!456",
  },
};

// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log('Received:', { username, password });
  if (username === users.staff.username && password === users.staff.password) {
    return res.send("../views/it_request.html");
  }
  if (
    username === users.technician.username &&
    password === users.technician.password
  ) {
    return res.send("../views/jobs.html");
  }
  return res.status(401).send("Invalid username or password");
});

//post issue
app.post('/submit-request', (req, res) => {
   try{
    const { reporter_name, email, location, issue_description } = req.body;

    // Validate input
    if (!reporter_name|| !email || !location || !issue_description) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    // SQL query to insert data
    const query = `INSERT INTO  issue_reports (reporter_name, email, location, issue_description) VALUES (?, ?, ?, ?)`;
    db.query(query, [reporter_name, email, location, issue_description], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database error: ' + error.message });
        }
        res.status(200).json({ message: 'Your request has been submitted successfully!', data : results });
    });
   }catch(e){
    res.status(500).json({message: "Internal Server error  ", error : e.message})
   }
});

//get All issues
app.get('/all-issues', (req, res) => {
  const query = `SELECT * FROM issue_reports`;

  db.query(query, (error, results) => {
      if (error) {
          return res.status(500).json({ message: 'Database error: ' + error.message });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: 'No issues found' });
      }

      res.status(200).json({
          message: 'Issues fetched successfully',
          data: results
      });
  });
});

// Complete Issue Endpoint
app.put('/complete-issue/:id', (req, res) => {
  const jobId = req.params.id;
  const query = `UPDATE issue_reports SET status = 'complete' WHERE id = ?`;

  db.query(query, [jobId], (error, results) => {
      if (error) {
          return res.status(500).json({ message: 'Database error: ' + error.message });
      }
      if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Issue not found' });
      }
      res.status(200).json({ message: 'Issue completed successfully' });
  });
});

// Undo Issue Endpoint
app.put('/undo-issue/:id', (req, res) => {
  const jobId = req.params.id; 
  const query = `UPDATE issue_reports SET status = 'incomplete' WHERE id = ?`;

  db.query(query, [jobId], (error, results) => {
      if (error) {
          return res.status(500).json({ message: 'Database error: ' + error.message });
      }
      if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Issue not found' });
      }
      res.status(200).json({ message: 'Issue status set to incomplete successfully' });
  });
});

// Assign Technician to an Issue
app.put('/assign-technician/:id', (req, res) => {
    const jobId = req.params.id;
    const { technician } = req.body;

    if (!technician) {
        return res.status(400).json({ message: 'Technician name is required.' });
    }

    const query = `UPDATE issue_reports SET technician = ? WHERE id = ?`;

    db.query(query, [technician, jobId], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database error: ' + error.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.status(200).json({ message: `Technician '${technician}' assigned successfully to issue ID: ${jobId}` });
    });
});

// Delete Issue by ID
app.delete('/delete-issue/:id', (req, res) => {
    const jobId = req.params.id;

    const query = `DELETE FROM issue_reports WHERE id = ?`;

    db.query(query, [jobId], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database error: ' + error.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.status(200).json({ message: `Issue ID: ${jobId} deleted successfully` });
    });
});

// Get Issues by Status
app.get('/issues-by-status/:status', (req, res) => {
    const status = req.params.status;

    const query = `SELECT * FROM issue_reports WHERE status = ?`;

    db.query(query, [status], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database error: ' + error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: `No issues found with status: ${status}` });
        }

        res.status(200).json({
            message: `Issues with status '${status}' fetched successfully`,
            data: results
        });
    });
});

// Update Issue Details
app.put('/update-issue/:id', (req, res) => {
    const jobId = req.params.id;
    const { reporter_name, email, location, issue_description } = req.body;

    // Validate input
    if (!reporter_name || !email || !location || !issue_description) {
        return res.status(400).json({ message: 'All fields are required to update the issue.' });
    }

    const query = `UPDATE issue_reports SET reporter_name = ?, email = ?, location = ?, issue_description = ? WHERE id = ?`;

    db.query(query, [reporter_name, email, location, issue_description, jobId], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database error: ' + error.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.status(200).json({ message: `Issue ID: ${jobId} updated successfully` });
    });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
