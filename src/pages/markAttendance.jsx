import { useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MarkAttendance = () => {
    const [students, setStudents] = useState([]);
    const [className, setClassName] = useState("");
    const [attendance, setAttendance] = useState([]);

    const location = useLocation();

    useEffect(() => {
        const fetchDbInfo = async () => {
            const studentsList = location.state?.students || [];
            const currentClass = location.state?.className || "";

            setStudents(studentsList);
            setClassName(currentClass);

            try {
                const response = await axios.get(`${import.meta.env.VITE_URL}/getAttendance/${currentClass}`, {
                    headers: {
                        'x-user-id': sessionStorage.getItem('adminUserId'),
                        'x-user-password': sessionStorage.getItem('adminPassword'),
                    }
                });

                if (response.data.length > 0) {
                    // Get latest attendance record (already sorted by date descending)
                    const latestRecord = response.data[0].records;

                    const studentAttendance = studentsList.map(student => {
                        const record = latestRecord.find(r => r.studentId === student._id);
                        return record ? record.attendance : Array(2).fill(false); // default 2 hours
                    });

                    setAttendance(studentAttendance);
                } else {
                    // No existing attendance, initialize all with false
                    const emptyAttendance = studentsList.map(() => Array(2).fill(false));
                    setAttendance(emptyAttendance);
                }
            } catch (error) {
                console.error('Error fetching attendance:', error);
                // Fallback to empty attendance if error occurs
                const emptyAttendance = studentsList.map(() => Array(2).fill(false));
                setAttendance(emptyAttendance);
            }
        };

        fetchDbInfo();
    }, []);

    const handleCheckboxChange = (studentIndex, hourIndex) => {
        const updatedAttendance = [...attendance];
        updatedAttendance[studentIndex][hourIndex] = !updatedAttendance[studentIndex][hourIndex];
        setAttendance(updatedAttendance);
    };

    const handleSubmit = async () => {
        try {
            const userId = sessionStorage.getItem('adminUserId');
            const password = sessionStorage.getItem('adminPassword');

            if (!userId || !password) {
                alert('Admin credentials missing. Please log in again.');
                return;
            }

            const attendanceData = students.map((student, index) => ({
                studentId: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                attendance: attendance[index],
            }));

            const response = await axios.post(`${import.meta.env.VITE_URL}/submitAttendance`, {
                className,
                attendanceRecords: attendanceData,
            }, {
                headers: {
                    'x-user-id': userId,
                    'x-user-password': password,
                }
            });

            alert('Attendance submitted successfully!');
            console.log(response.data);
        } catch (error) {
            console.error('Error submitting attendance:', error.response?.data || error.message);
            alert('Failed to submit attendance.');
        }
    };

    return (
        <>
            <h1>{className} Attendance</h1>
            <div>
                <h2>Students List:</h2>
                {students.length === 0 ? (
                    <p>No students found.</p>
                ) : (
                    <>
                        <table border={1} cellPadding={5} cellSpacing={0}>
                            <thead>
                                <tr style={{ backgroundColor: '#f2f2f2' }}>
                                    <th rowSpan={2}>Name</th>
                                    <th rowSpan={2}>Roll No</th>
                                    <th colSpan={2}>Hours</th>
                                </tr>
                                <tr style={{ backgroundColor: '#f2f2f2' }}>
                                    <th>FORENOON</th>
                                    <th>AFTERNOON</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, studentIndex) => (
                                    <tr key={student._id || studentIndex}>
                                        <td>{student.name}</td>
                                        <td>{student.rollNumber}</td>
                                        {attendance[studentIndex]?.map((checked, hourIndex) => (
                                            <td key={hourIndex}>
                                                <input
                                                    className='attendanceCheckbox'
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => handleCheckboxChange(studentIndex, hourIndex)}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <button onClick={handleSubmit} style={{ marginTop: '20px' }}>
                            Submit Attendance
                        </button>
                    </>
                )}
            </div>
        </>
    );
};

export default MarkAttendance;
