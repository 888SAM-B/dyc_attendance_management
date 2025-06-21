import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState({});
  const location = useLocation();

  useEffect(() => {
    const studentData = location.state?.studentData;
    if (!studentData) {
      console.error('No student data found in location state');
      return;
    }
    console.log('Student Data:', studentData);
    setStudentData(studentData);
  }, [location]);

  return (
    <>
      <h1>Student Dashboard</h1>
      <hr />
      <h1>Welcome  {(studentData?.name) || 'N/A'} !</h1>
      <h1>Roll No: {studentData?.rollNumber || 'N/A'}</h1>
      <h1>Class: {studentData?.class || 'N/A'}</h1>
      <h1>Total Working Days : {studentData?.present?.length + studentData?.halfDay?.length + studentData?.absent?.length || 0}</h1>
      <h2>Number of Days Present : {studentData?.present?.length || 0}</h2>
      <h2>Number of Half Days : {studentData?.halfDay?.length || 0}</h2>
      <h2>Number of Days Absent : {studentData?.absent?.length || 0}</h2>
      <br /><br />

      <h1>Attendance Percentage</h1>
      <h2>
        {studentData?.present && studentData?.halfDay
          ? (((studentData.present.length + (studentData.halfDay.length / 2)) / (studentData.present.length + studentData.halfDay.length + studentData.absent.length)) * 100).toFixed(2)
          : 0}%
      </h2>
      <br /><br />
      <h1>Attendance Record</h1>
      <h2>
  Present Days: {studentData?.present?.length
    ? studentData.present
        .map((day) => {
          const [year, month, date] = day.split("-");
          return `${date}-${month}-${year}`;
        })
        .join(", ")
    : "N/A"}
</h2>

<h2>
  Half Days: {studentData?.halfDay?.length
    ? studentData.halfDay
        .map((day) => {
          const [year, month, date] = day.split("-");
          return `${date}-${month}-${year}`;
        })
        .join(", ")
    : "N/A"}
</h2>

<h2>
  Absent Days: {studentData?.absent?.length
    ? studentData.absent
        .map((day) => {
          const [year, month, date] = day.split("-");
          return `${date}-${month}-${year}`;
        })
        .join(", ")
    : "N/A"}
</h2>

    </>
  );
};

      export default StudentDashboard;
