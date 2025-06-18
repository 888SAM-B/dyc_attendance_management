// AttendanceReport.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const AttendanceReport = () => {
  const [className, setClassName] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const receivedClassName = location.state?.className;
    setClassName(receivedClassName || "Unknown Class");
     const userId = sessionStorage.getItem('adminUserId');
      const password = sessionStorage.getItem('adminPassword');
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL}/attendanceReport/${receivedClassName}`, {
          headers: {
            'x-user-id': userId,
            'x-user-password': password
          }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setAttendanceData(data);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    if (receivedClassName) fetchAttendanceData();
  }, [location]);

  const getAllDatesOfCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      dates.push(d);
    }

    return dates;
  };

  const datesOfMonth = getAllDatesOfCurrentMonth();

  return (
    <div>
      <h2>Attendance Report for {className}</h2>

      <div style={{ marginBottom: '10px' }}>
        <span style={{ color: 'green', marginRight: '15px' }}>🟢 Present</span>
        <span style={{ color: 'orange', marginRight: '15px' }}>🟠 Half Day</span>
        <span style={{ color: 'red' }}>🔴 Absent</span>
      </div>

      <table border={1}>
        <thead>
          <tr>
            <th>Student Name</th>
            {datesOfMonth.map(date => (
              <th key={date.toISOString().slice(0, 10)}>
                {date.getDate()}/{date.getMonth() + 1}
              </th>
            ))}
            <th>Status Summary</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((student, index) => (
            <tr key={index}>
              <td>{student.name}</td>
              {datesOfMonth.map(date => {
                const dateStr = date.toISOString().slice(0, 10);
                let status = '';

                if (student.present?.includes(dateStr)) {
                  status = 'present';
                } else if (student.halfDay?.includes(dateStr)) {
                  status = 'halfDay';
                } else if (student.absent?.includes(dateStr)) {
                  status = 'absent';
                }

                return (
                  <td key={dateStr}>
                    <input
                      type="checkbox"
                      checked={status === 'present' || status === 'halfDay' || status === 'absent'}
                      readOnly
                      style={{
                        accentColor: status === 'present'
                          ? 'green'
                          : status === 'halfDay'
                          ? 'orange'
                          : 'red'
                      }}
                    />
                  </td>
                );
              })}
              <td>
                {student.present?.length || 0} Present,{" "}
                {student.halfDay?.length || 0} Half Day,{" "}
                {student.absent?.length || 0} Absent
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceReport;
