// AttendanceReport.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './attendanceReport.css';
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


    useEffect(() => {
  document.body.style.background = 'linear-gradient(to right, #083f66, #0e204d)';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.fontFamily = '"Roboto Condensed", sans-serif';

  return () => {
    document.body.style.background = '';
    document.body.style.margin = '';
    document.body.style.padding = '';
    document.body.style.fontFamily = '';
  };
}, []);

  return (
    <div className="attendance-report-container3">
  <h2 className="report-title3">Attendance Report for {className}</h2>

  <div className="attendance-legend3">
    <span className="legend-present3">🟢 Present</span>
    <span className="legend-halfday3">🟠 Half Day</span>
    <span className="legend-absent3">🔴 Absent</span>
  </div>

  <input
    type="date"
    name="reportDate"
    id="reportDate"
    className="report-date-input3"
    defaultValue={datesOfMonth[0].toLocaleDateString('en-CA')}
  />

  <table border={1} className="attendance-table3">
    <thead className="table-header3">
      <tr>
        <th className="header-student-name3">Student Name</th>
        {datesOfMonth.map(date => {
          const localKey = date.toLocaleDateString('en-CA');
          return (
            <th key={localKey} className="header-date3">
              {date.getDate()}/{date.getMonth() + 1}
            </th>
          );
        })}
        <th className="header-summary3">Status Summary</th>
      </tr>
    </thead>
    <tbody className="table-body3">
      {attendanceData.map((student, index) => (
        <tr key={index} className="student-row3">
          <td className="student-name3">{student.name}</td>
          {datesOfMonth.map(date => {
            const dateStr = date.toLocaleDateString('en-CA');
            let status = '';

            if (student.present?.includes(dateStr)) {
              status = 'present';
            } else if (student.halfDay?.includes(dateStr)) {
              status = 'halfDay';
            } else if (student.absent?.includes(dateStr)) {
              status = 'absent';
            }

            return (
              <td key={dateStr} className={`attendance-cell3 status-${status || 'nodata'}3`}>
                {status === 'present' && <div title="Present" className="status-icon3 present3"></div>}
                {status === 'halfDay' && <div title="Half Day" className="status-icon3 halfday3"></div>}
                {status === 'absent' && <div title="Absent" className="status-icon3 absent3"></div>}
                {!status && <div title="No Data" className="status-icon3 nodata3"></div>}
              </td>
            );
          })}
          <td className="student-summary3">
            P : {student.present?.length || 0} ,{" "}
            H : {student.halfDay?.length || 0} ,{" "}
            A : {student.absent?.length || 0}
          </td>
        </tr>
      ))}
      <tr className="date-summary-row3">
        <td className="date-summary-label3"><strong>Date Summary</strong></td>
        {datesOfMonth.map(date => {
          const dateStr = date.toLocaleDateString('en-CA');
          let presentCount = 0, halfDayCount = 0, absentCount = 0;

          attendanceData.forEach(student => {
            if (student.present?.includes(dateStr)) presentCount++;
            else if (student.halfDay?.includes(dateStr)) halfDayCount++;
            else if (student.absent?.includes(dateStr)) absentCount++;
          });

          return (
            <td key={dateStr} className="date-summary-cell3">
              <div title="Present" className="summary-count3 present3">P: {presentCount}</div>
              <div title="Half Day" className="summary-count3 halfday3">H: {halfDayCount}</div>
              <div title="Absent" className="summary-count3 absent3">A: {absentCount}</div>
            </td>
          );
        })}
        <td className="summary-empty-cell3"></td>
      </tr>
    </tbody>
  </table>
</div>


  );
};

export default AttendanceReport;
