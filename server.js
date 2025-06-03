// ======================= SERVER CODE (Express + MongoDB) =======================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const centralDbUri = `mongodb+srv://dycattendance:dycattendance@dyc-attendance.r5jyblp.mongodb.net/institutions`;

mongoose.connect(centralDbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to institutions database'))
    .catch((err) => console.error('Central DB connection failed:', err.message));

const InstitutionSchema = new mongoose.Schema({
    dbName: String,
    userId: String,
    password: String,
    Teachers: Array,
});
const Institution = mongoose.model('Institution', InstitutionSchema);

const connectionCache = {};
const getDbConnection = async (dbName) => {
    if (connectionCache[dbName]) return connectionCache[dbName];
    const dbUri = `mongodb+srv://dycattendance:dycattendance@dyc-attendance.r5jyblp.mongodb.net/${dbName}`;
    const conn = await mongoose.createConnection(dbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    connectionCache[dbName] = conn;
    return conn;
};

app.post('/createdb', async (req, res) => {
    const { dbName, userId, password } = req.body;
    if (!dbName || !userId || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const exists = await Institution.findOne({ $or: [{ dbName }, { userId }] });
        if (exists) return res.status(400).json({ error: 'DB or User already exists' });

        const conn = await getDbConnection(dbName);

        const TeacherSchema = new mongoose.Schema({ name: String, staffId: String, password: String, subject: String });
        const StudentSchema = new mongoose.Schema({ name: String, class: String, rollNumber: String });

        const Teacher = conn.model('Teacher', TeacherSchema);
        const Student = conn.model('Student', StudentSchema);

        await new Teacher({ name: 'John Doe', staffId: 'T001', password: 'pass', subject: 'Math' }).save();
        await new Student({ name: 'Jane Smith', class: '10A', rollNumber: 'S001' }).save();

        await new Institution({ dbName, userId, password }).save();
        res.status(201).json({ message: `Database "${dbName}" created` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create DB', details: err.message });
    }
});

app.post('/staffLogin', async (req, res) => {
    const { institution, username, password } = req.body;
    if (!institution || !username || !password) return res.status(400).json({ error: 'All fields are required' });
    const conn = await getDbConnection(institution);
    const Teacher = conn.models.Teacher || conn.model('Teacher', new mongoose.Schema({ name: String, staffId: String, password: String, subject: String }));
    const teacher = await Teacher.findOne({ staffId: username, password });
    if (!teacher) return res.status(401).json({ error: 'Invalid credentials' });
    const institutionData = await Institution.findOne({ dbName: institution });
    if (!institutionData) return res.status(404).json({ error: 'Institution not found' });
    res.json({ message: 'Login successful', dbName: institution, adminUserId: institutionData.userId, adminPassword: institutionData.password });
});

app.post('/adminLogin', async (req, res) => {
    const { userId, password } = req.body;
    if (!userId || !password) return res.status(400).json({ error: 'All fields are required' });
    const institution = await Institution.findOne({ userId, password });
    if (!institution) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ message: 'Login successful', dbName: institution.dbName });
});

app.get('/institutions', async (req, res) => {
    try {
        const institutions = await Institution.find({});
        res.json(institutions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch institutions', details: err.message });
    }
});

const dbMiddleware = async (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const password = req.headers['x-user-password'];
    if (!userId || !password) return res.status(400).json({ error: 'Missing admin credentials in headers' });
    const institution = await Institution.findOne({ userId, password });
    if (!institution) return res.status(401).json({ error: 'Invalid credentials' });
    try {
        const conn = await getDbConnection(institution.dbName);
        req.db = conn;
        req.dbName = institution.dbName;
        next();
    } catch (err) {
        res.status(500).json({ error: 'DB connection failed', details: err.message });
    }
};

app.use(dbMiddleware);

const getModels = (conn) => {
    const Student = conn.models.Student || conn.model('Student', new mongoose.Schema({ name: String, class: String, rollNumber: String }));
    const Teacher = conn.models.Teacher || conn.model('Teacher', new mongoose.Schema({ name: String, staffId: String, password: String, subject: String }));
    const Class = conn.models.Class || conn.model('Class', new mongoose.Schema({ className: String, Students: [{ rollNumber: String, name: String }] }));
    const Attendance = conn.models.Attendance || conn.model('Attendance', new mongoose.Schema({
        className: String,
        date: { type: Date, default: Date.now },
        records: [
            {
                studentId: mongoose.Schema.Types.ObjectId,
                name: String,
                rollNumber: String,
                attendance: [Boolean]
            }
        ]
    }));
    return { Student, Teacher, Class, Attendance };
};

app.get('/currentDb', async (req, res) => {
    try {
        const { Student, Teacher } = getModels(req.db);
        const students = await Student.find({});
        const teachers = await Teacher.find({});
        res.json({ dbName: req.dbName, students, staff: teachers });
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed', details: err.message });
    }
});

app.post('/addStudent', async (req, res) => {
    const { name, class: studentClass, rollNumber } = req.body;
    const { Student, Class } = getModels(req.db);
    if (!name || !studentClass || !rollNumber) return res.status(400).json({ error: 'All fields required' });
    const exists = await Student.findOne({ rollNumber });
    if (exists) return res.status(400).json({ error: 'Roll number exists' });
    const classExists = await Class.findOne({ className: studentClass });
    if (!classExists) return res.status(400).json({ error: 'Class does not exist' });
    classExists.Students.push({ rollNumber, name });
    await classExists.save();
    await new Student({ name, class: studentClass, rollNumber }).save();
    res.status(201).json({ message: 'Student added' });
});

app.post('/deleteStudent', async (req, res) => {
    const { studentId } = req.body;
    const { Student } = getModels(req.db);
    const result = await Student.deleteOne({ _id: studentId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted' });
});

app.post('/addStaff', async (req, res) => {
    const { name, staffId, password, subject } = req.body;
    const { Teacher } = getModels(req.db);
    const exists = await Teacher.findOne({ staffId });
    if (exists) return res.status(400).json({ error: 'Staff exists' });
    await mongoose.model('Institution').updateOne(
        { dbName: req.dbName },
        { $push: { Teachers: { name, staffId, password, subject } } }
    );
    await new Teacher({ name, staffId, password, subject }).save();
    res.status(201).json({ message: 'Staff added' });
});

app.post('/deleteStaff', async (req, res) => {
    const { staffId } = req.body;
    const { Teacher } = getModels(req.db);
    const result = await Teacher.deleteOne({ staffId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Staff not found' });
    res.json({ message: 'Staff deleted' });
});

app.post('/addClass', async (req, res) => {
    const { className } = req.body;
    const { Class } = getModels(req.db);
    const exists = await Class.find({});
    for (const cls of exists) {
        if ((cls.className.toLowerCase()).replace(' ', '') === (className.toLowerCase()).replace(' ', '')) {
            return res.status(400).json({ error: 'Class exists' });
        }
    }
    await new Class({ className }).save();
    res.status(201).json({ message: 'Class added' });
});

app.get('/classes', async (req, res) => {
    const { Class } = getModels(req.db);
    const classes = await Class.find({});
    res.json(classes);
});

app.delete('/deleteClass/:classId', async (req, res) => {
    const { classId } = req.params;
    const className = req.body.className;
    if (!classId || !className) return res.status(400).json({ error: 'Class ID and name required' });
    const { Class, Student } = getModels(req.db);
    const result = await Class.deleteOne({ _id: classId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Class not found' });
    await Student.deleteMany({ class: className });
    res.json({ message: 'Class deleted' });
});


app.get('/getAttendance/:className', async (req, res) => {
    const { className } = req.params;

    if (!className) {
        return res.status(400).json({ error: 'Class name is required' });
    }

    try {
        const { Attendance } = getModels(req.db);

        const attendanceRecords = await Attendance
            .find({ className })
            .sort({ date: -1 })
            .limit(1); // ✅ Fetch only the latest record

        if (attendanceRecords.length === 0) {
            return res.status(200).json([]); // ✅ Return empty array instead of 404
        }

        return res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return res.status(500).json({
            error: 'Failed to fetch attendance records',
            details: error.message
        });
    }
});

app.post('/submitAttendance', async (req, res) => {
    const { className, attendanceRecords } = req.body;

    if (!className || !Array.isArray(attendanceRecords)) {
        return res.status(400).json({
            error: 'Both className and attendanceRecords array are required'
        });
    }

    try {
        const { Attendance } = getModels(req.db);

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today

        let existingRecord = await Attendance.findOne({
            className,
            date: { $gte: today }
        });

        if (existingRecord) {
            existingRecord.records = attendanceRecords;
            existingRecord.date = new Date(); // Update to current time
            await existingRecord.save();

            return res.status(200).json({ message: 'Attendance updated successfully' });
        }

        const newAttendance = new Attendance({
            className,
            records: attendanceRecords,
            date: new Date()
        });

        await newAttendance.save();

        return res.status(201).json({ message: 'Attendance submitted successfully' });
    } catch (error) {
        console.error('Error submitting attendance:', error);
        return res.status(500).json({
            error: 'Failed to submit attendance',
            details: error.message
        });
    }
});


app.listen(5000, () => console.log('Server running on port 5000'));
