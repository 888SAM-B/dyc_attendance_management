const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Connect to the central institutions database
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

// Route to create a new institution database
app.post('/createdb', async (req, res) => {
    const { dbName, userId, password } = req.body;

    if (!dbName || !userId || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const existingInstitution = await Institution.findOne({ dbName });
        if (existingInstitution) return res.status(400).json({ error: 'Database already exists' });

        const existingUser = await Institution.findOne({ userId });
        if (existingUser) return res.status(400).json({ error: 'UserId already exists' });

        const dbUri = `mongodb+srv://dycattendance:dycattendance@dyc-attendance.r5jyblp.mongodb.net/${dbName}`;
        const connection = mongoose.createConnection(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });

        const TeacherSchema = new mongoose.Schema({
            name: String,
            staffId: String,
            password: String,
            subject: String
        });

        const StudentSchema = new mongoose.Schema({
            name: String,
            class: String,
            rollNumber: String
        });

        const Teacher = connection.model('Teacher', TeacherSchema);
        const Student = connection.model('Student', StudentSchema);

        const sampleTeacher = new Teacher({ name: 'John Doe', staffId: 'T001', subject: 'Mathematics' });
        await sampleTeacher.save();

        const sampleStudent = new Student({ name: 'Jane Smith', class: '10A', rollNumber: 'S001' });
        await sampleStudent.save();

        const institution = new Institution({ dbName, userId, password });
        await institution.save();

        res.status(201).json({ message: `Database "${dbName}" created and user inserted.` });
        connection.close();
    } catch (err) {
        console.error('Error creating database:', err.message);
        res.status(500).json({ error: 'Failed to create database', details: err.message });
    }
});

// Admin login route to connect dynamically to a specific institution DB
app.post('/adminLogin', async (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const institution = await Institution.findOne({ userId, password });
        if (!institution) return res.status(401).json({ error: 'Invalid credentials' });

        const dbUri = `mongodb+srv://dycattendance:dycattendance@dyc-attendance.r5jyblp.mongodb.net/${institution.dbName}`;
        const connection = mongoose.createConnection(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });

        app.set('currentDb', connection);

        res.status(200).json({ message: 'Login successful', dbName: institution.dbName });
        console.log(`Connected to ${institution.dbName} database`);
    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).json({ error: 'Login failed', details: err.message });
    }
});

// Route to get current database students and teachers
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
        const Student = currentDb.models.Student || currentDb.model('Student', new mongoose.Schema({
            name: String,
            class: String,
            rollNumber: String
        }));

        const Teacher = currentDb.models.Teacher || currentDb.model('Teacher', new mongoose.Schema({
            name: String,
            staffId: String,
            password: String,
            subject: String
        }));

        const students = await Student.find({});
        const teachers = await Teacher.find({});

        res.json({
            dbName: currentDb.name,
            students,
            staff: teachers
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch data', details: err.message });
    }
});

// Add Student
app.post('/addStudent', async (req, res) => {
    const { name, class: studentClass, rollNumber } = req.body;
    const currentDb = app.get('currentDb');

    if (!name || !studentClass || !rollNumber) {
        return res.status(400).json({ error: 'All fields are required' });
    }

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
        if (existingStudent) return res.status(400).json({ error: 'Roll Number already exists' });

        const newStudent = new Student({ name, class: studentClass, rollNumber });
        await newStudent.save();

        res.status(201).json({ message: 'Student added successfully' });
    } catch (err) {
        console.error('Error adding student:', err.message);
        res.status(500).json({ error: 'Failed to add student', details: err.message });
    }
});

// Delete Student
app.post('/deleteStudent', async (req, res) => {
    const { studentId } = req.body;
    const currentDb = app.get('currentDb');

    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

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
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Student not found' });

        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error('Error deleting student:', err.message);
        res.status(500).json({ error: 'Failed to delete student', details: err.message });
    }
});

// Add Staff
app.post('/addStaff', async (req, res) => {
    const { name, staffId, password, subject } = req.body;
    const currentDb = app.get('currentDb');

    if (!name || !staffId || !subject || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!currentDb) {
        return res.status(500).json({ error: 'No active database connection' });
    }

    try {
        const Teacher = currentDb.models.Teacher || currentDb.model('Teacher', new mongoose.Schema({
            name: String,
            staffId: String,
            password: String, // Optional, can be added later
            subject: String
        }));

        const existingTeacher = await Teacher.findOne({ staffId });
        if (existingTeacher) return res.status(400).json({ error: 'Staff already exists' });

        const newTeacher = new Teacher({ name, staffId, password, subject });
        await newTeacher.save();

        res.status(201).json({ message: 'Staff added successfully' });
    } catch (err) {
        console.error('Error adding staff:', err.message);
        res.status(500).json({ error: 'Failed to add staff', details: err.message });
    }
});

// Delete Staff
app.post('/deleteStaff', async (req, res) => {
    const { staffId } = req.body;
    const currentDb = app.get('currentDb');

    if (!staffId) {
        return res.status(400).json({ error: 'Staff ID is required' });
    }

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
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Staff not found' });

        res.json({ message: 'Staff deleted successfully' });
    } catch (err) {
        console.error('Error deleting staff:', err.message);
        res.status(500).json({ error: 'Failed to delete staff', details: err.message });
    }
});



app.post('/addClass', async (req, res) => {
    const { className } = req.body;

    if (!className) {
        return res.status(400).json({ error: 'Class name is required' });
    }

    const currentDb = app.get('currentDb');

    if (!currentDb) {
        return res.status(500).json({ error: 'No active database connection' });
    }

    try {
        const Class = currentDb.models.Class || currentDb.model('Class', new mongoose.Schema({
            className: String
        }));

        const existingClass = await Class.findOne({ className });
        if (existingClass) {
            return res.status(400).json({ error: 'Class already exists' });
        }

        const newClass = new Class({ className });
        await newClass.save();
        res.status(201).json({ message: 'Class added successfully' });
    } catch (err) {
        console.error('Error adding class:', err.message);
        res.status(500).json({ error: 'Failed to add class', details: err.message });
    }
});

app.get('/classes', async (req, res) => {
    const currentDb = app.get('currentDb');

    if (!currentDb) {
        return res.status(500).json({ error: 'No active database connection' });
    }

    try {
        const Class = currentDb.models.Class || currentDb.model('Class', new mongoose.Schema({
            className: String
        }));

        const classes = await Class.find({});
        res.json(classes);
    } catch (err) {
        console.error('Error fetching classes:', err.message);
        res.status(500).json({ error: 'Failed to fetch classes', details: err.message });
    }
});

app.delete('/deleteClass/:classId', async (req, res) => {
    const { classId } = req.params;
    const currentDb = app.get('currentDb');

    if (!classId) {
        return res.status(400).json({ error: 'Class ID is required' });
    }

    if (!currentDb) {
        return res.status(500).json({ error: 'No active database connection' });
    }

    try {
        const Class = currentDb.models.Class || currentDb.model('Class', new mongoose.Schema({
            className: String
        }));

        const result = await Class.deleteOne({ _id: classId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Class not found' });

        res.json({ message: 'Class deleted successfully' });
    } catch (err) {
        console.error('Error deleting class:', err.message);
        res.status(500).json({ error: 'Failed to delete class', details: err.message });
    }
});

// Start the server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
