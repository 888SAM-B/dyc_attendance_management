const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
// Enhanced error handling in Express
app.post('/createdb', async (req, res) => {
    const { dbName, userId, password } = req.body;

    if (!dbName || !userId || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const dbUri = `mongodb+srv://dycattendance:dycattendance@dyc-attendance.r5jyblp.mongodb.net/${dbName}`;
        const connection = await mongoose.createConnection(dbUri);

        const UserSchema = new mongoose.Schema({
            name: String,
            email: String,
            userId: String,
            password: String
        });

        const User = connection.model('User', UserSchema);

        const user = new User({ dbName,userId, password });

        await user.save(); // Ensure the save is awaited

        res.status(201).json({ message: `Database "${dbName}" created and user inserted.` });
        connection.close();

        try {
        const institutionsUri = `mongodb+srv://dycattendance:dycattendance@dyc-attendance.r5jyblp.mongodb.net/institutions`;
        const institutionsConn = await mongoose.createConnection(institutionsUri);

        const InstitutionSchema = new mongoose.Schema({
            dbName: String,
            userId: String,
            password: String
        });

        const Institution = institutionsConn.model('Institution', InstitutionSchema);

        const institution = new Institution({ dbName, password, userId });
        await institution.save();

        institutionsConn.close();
    } catch (err) {
        console.error('Error inserting into institutions:', err.message);
        // Optionally, you can send a different response or log the error
    }   



    } catch (err) {
        console.error('Error creating database:', err.message); // More specific error message
        res.status(500).json({ error: 'Failed to create database', details: err.message });
    }

    
});


// Test route
app.get('/', (req, res) => {
    res.send('Hello from server');
});

// Start server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
