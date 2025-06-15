import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const MarkAttendance = () => {
    const [students, setStudents] = useState([]);
    const [className, setClassName] = useState("");
    const [attendance, setAttendance] = useState([]);
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

    const location = useLocation();

    useEffect(() => {
        const studentsList = location.state?.students || [];
        const className = location.state?.className || "";
        setStudents(studentsList);
        setClassName(className);
    }, [location]);

    useEffect(() => {
        if (!className) return;

        const fetchAttendance = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_URL}/getAttendance/${className}/${selectedDate}`, {
                    headers: {
                        'x-user-id': sessionStorage.getItem('adminUserId'),
                        'x-user-password': sessionStorage.getItem('adminPassword'),
                    }
                });

                if (response.data) {
                    const studentAttendance = students.map(student => {
                        const record = response.data.find(r => r.studentId === student._id);
                        return record ? record.attendance : Array(2).fill(false);
                    });
                    setAttendance(studentAttendance);
                } else {
                    const emptyAttendance = students.map(() => Array(2).fill(false));
                    setAttendance(emptyAttendance);
                }
            } catch (error) {
                console.error('Error fetching attendance:', error);
                setAttendance(students.map(() => Array(2).fill(false)));
            }
        };

        fetchAttendance();
    }, [className, students, selectedDate]);

    const handleCheckboxChange = (studentIndex, hourIndex) => {
        const updated = [...attendance];
        updated[studentIndex][hourIndex] = !updated[studentIndex][hourIndex];
        setAttendance(updated);
    };

    const handleSubmit = async () => {
        const userId = sessionStorage.getItem('adminUserId');
        const password = sessionStorage.getItem('adminPassword');

        if (!userId || !password) {
            alert('Please login again.');
            return;
        }

        const attendanceData = students.map((student, index) => ({
            studentId: student._id,
            name: student.name,
            rollNumber: student.rollNumber,
            attendance: attendance[index],
        }));

        try {
            const response = await axios.post(`${import.meta.env.VITE_URL}/submitAttendance`, {
                className,
                attendanceRecords: attendanceData,
                date: selectedDate
            }, {
                headers: {
                    'x-user-id': userId,
                    'x-user-password': password,
                }
            });

            alert('Attendance submitted successfully!');
        } catch (error) {
            console.error('Error submitting attendance:', error);
            alert('Failed to submit attendance.');
        }
    };
    const handleFinish = async () => {
        const userId = sessionStorage.getItem('adminUserId');
        const password = sessionStorage.getItem('adminPassword');

        if (!userId || !password) {
            alert('Please login again.');
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_URL}/finishAttendance`, {
                className,
                date: selectedDate
            }, {
                headers: {
                    'x-user-id': userId,
                    'x-user-password': password,
                }
            });

            alert('Attendance for today has been finished successfully!');
        } catch (error) {
            console.error('Error finishing attendance:', error);
            alert('Failed to finish attendance.');
        }
    }
    return (
        <>            
            <h1>{className} Attendance</h1>

            <div style={{ margin: "10px 0" }}>
                <label>Select Date: </label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            {students.length === 0 ? (
                <p>No students found.</p>
            ) : (
                <>
                    <table border={1} cellPadding={5} cellSpacing={0}>
                        <thead>
                            <tr >
                                <th rowSpan={2}>Name</th>
                                <th rowSpan={2}>Roll No</th>
                                <th colSpan={2}>Hours</th>
                            </tr>
                            <tr >
                                <th>FORENOON</th>
                                <th>AFTERNOON</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, sIdx) => (
                                <tr key={student._id || sIdx}>
                                    <td>{student.name}</td>
                                    <td>{student.rollNumber}</td>
                                    {attendance[sIdx]?.map((checked, hIdx) => (
                                        <td key={hIdx}>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => handleCheckboxChange(sIdx, hIdx)}
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
                    <button onClick={handleFinish} >
                        Finish Attendance for today
                    </button>
                </>
            )}
        </>
    );
};

export default MarkAttendance;
