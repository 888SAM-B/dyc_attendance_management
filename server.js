const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Establish a single connection to the institutions database
const institutionsUri = `mongodb+srv://dycattendance:dycattendance@dyc-attendance.r5jyblp.mongodb.net/institutions`;
mongoose.connect(institutionsUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to institutions database'))
    .catch((err) => console.error('Database connection failed:', err.message));

// Institution Schema and Model
const InstitutionSchema = new mongoose.Schema({
    dbName: String,
    userId: String,
    password: String
});
const Institution = mongoose.model('Institution', InstitutionSchema);

// Enhanced error handling in Express
app.post('/createdb', async (req, res) => {
    const { dbName, userId, password } = req.body;

    if (!dbName || !userId || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if the database or userId already exists
        const existingInstitution = await Institution.findOne({ dbName });
        if (existingInstitution) {
            return res.status(400).json({ error: 'Database already exists' });
        }

        const existingUser = await Institution.findOne({ userId });
        if (existingUser) {
            return res.status(400).json({ error: 'UserId already exists' });
        }

        // Create a new connection for the specific database
        const dbUri = `mongodb+srv://dycattendance:dycattendance@dyc-attendance.r5jyblp.mongodb.net/${dbName}`;
        const connection = mongoose.createConnection(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });

        // Define teacher and student schemas for the new database
        const TeacherSchema = new mongoose.Schema({
            name: String,
            staffId: String,
            subject: String
        });
        const StudentSchema = new mongoose.Schema({
            name: String,
            class: String,
            rollNumber: String
        });

        const Teacher = connection.model('Teacher', TeacherSchema);
        const Student = connection.model('Student', StudentSchema);

        // Create sample teacher and student
        const sampleTeacher = new Teacher({
            name: 'John Doe',
            staffId: 'T001',
            subject: 'Mathematics'
        });
        await sampleTeacher.save();

        const sampleStudent = new Student({
            name: 'Jane Smith',
            class: '10A',
            rollNumber: 'S001'
        });
        await sampleStudent.save();

        // Save the institution data in the main "institutions" database
        const institution = new Institution({ dbName, userId, password });
        await institution.save();

        res.status(201).json({ message: `Database "${dbName}" created and user inserted.` });
        connection.close();
    } catch (err) {
        console.error('Error creating database:', err.message);
        res.status(500).json({ error: 'Failed to create database', details: err.message });
    }
});

// Admin login route
app.post('/adminLogin', async (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Find the institution with matching credentials
        const institution = await Institution.findOne({ userId, password });
        console.log('Institution found:', institution);

        if (!institution) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Connect to the respective database after successful login
        const dbUri = `mongodb+srv://dycattendance:dycattendance@dyc-attendance.r5jyblp.mongodb.net/${institution.dbName}`;
        const connection = mongoose.createConnection(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });

        // Store the database connection for future use
        app.set('currentDb', connection);

        res.status(200).json({ message: 'Login successful', dbName: institution.dbName });
        console.log(`Connected to ${institution.dbName} database`);
    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).json({ error: 'Login failed', details: err.message });
    }
});

// Test route to check current database connection

app.get('/currentDb', async (req, res) => {
    const currentDb = app.get('currentDb');

    if (!currentDb) {
        return res.json({
            dbName: 'No active database connection',
            students: [],
            teachers: []
        });
    }

    try {
        // Avoid OverwriteModelError by checking if models already exist
        const Student = currentDb.models.Student || currentDb.model('Student', new mongoose.Schema({
            name: String,
            class: String,
            rollNumber: String
        }));

        const Teacher = currentDb.models.Teacher || currentDb.model('Teacher', new mongoose.Schema({
            name: String,
            staffId: String,
            subject: String
        }));

        // Fetch all students and teachers
        const students = await Student.find({});
        const teachers = await Teacher.find({});
        console.log(teachers);
        res.json({
            dbName: currentDb.name,
            students: students,
            staff: teachers
        });

    } catch (err) {
        res.status(500).json({
            error: 'Failed to fetch data',
            details: err.message
        });
    }
});










app.post('/addStudent', async (req, res) => {
    const { name, class: studentClass, rollNumber } = req.body;

    if (!name || !studentClass || !rollNumber) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const currentDb = app.get('currentDb');

    if (!currentDb) {
        return res.status(500).json({ error: 'No active database connection' });
    }
    

    try {
        const Student = currentDb.models.Student || currentDb.model('Student', new mongoose.Schema({
            name: String,
            class: String,
            rollNumber: String
        }));

        const existingStudent = await Student.findOne({ rollNumber });
        if (existingStudent) {
            return res.status(400).json({ error: 'Student already exists' });
        }

        const newStudent = new Student({ name, class: studentClass, rollNumber });
        await newStudent.save();
        res.status(201).json({ message: 'Student added successfully' });
    } catch (err) {
        console.error('Error adding student:', err.message);
        res.status(500).json({ error: 'Failed to add student', details: err.message });
    }
}
);


app.post('/deleteStudent', async (req, res) => {
    const { studentId } = req.body;

    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    const currentDb = app.get('currentDb');

    if (!currentDb) {
        return res.status(500).json({ error: 'No active database connection' });
    }

    try {
        const Student = currentDb.models.Student || currentDb.model('Student', new mongoose.Schema({
            name: String,
            class: String,
            rollNumber: String
        }));

        const result = await Student.deleteOne({ _id: studentId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error('Error deleting student:', err.message);
        res.status(500).json({ error: 'Failed to delete student', details: err.message });
    }
}); 


app.post('/addStaff', async (req, res) => {
    const { name, staffId, subject } = req.body;

    if (!name || !staffId || !subject) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const currentDb = app.get('currentDb');

    if (!currentDb) {
        return res.status(500).json({ error: 'No active database connection' });
    }

    try {
        const Teacher = currentDb.models.Teacher || currentDb.model('Teacher', new mongoose.Schema({
            name: String,
            staffId: String,
            subject: String
        }));

        const existingTeacher = await Teacher.findOne({ staffId });
        if (existingTeacher) {
            return res.status(400).json({ error: 'Staff already exists' });
        }

        const newTeacher = new Teacher({ name, staffId, subject });
        await newTeacher.save();
        res.status(201).json({ message: 'Staff added successfully' });
    } catch (err) {
        console.error('Error adding staff:', err.message);
        res.status(500).json({ error: 'Failed to add staff', details: err.message });
    }
});



app.post('/deleteStaff', async (req, res) => {
    const { staffId } = req.body;

    if (!staffId) {
        return res.status(400).json({ error: 'Staff ID is required' });
    }

    const currentDb = app.get('currentDb');

    if (!currentDb) {
        return res.status(500).json({ error: 'No active database connection' });
    }

    try {
        const Teacher = currentDb.models.Teacher || currentDb.model('Teacher', new mongoose.Schema({
            name: String,
            staffId: String,
            subject: String
        }));

        const result = await Teacher.deleteOne({ staffId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Staff not found' });
        }

        res.json({ message: 'Staff deleted successfully' });
    } catch (err) {
        console.error('Error deleting staff:', err.message);
        res.status(500).json({ error: 'Failed to delete staff', details: err.message });
    }
});



// Start server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
