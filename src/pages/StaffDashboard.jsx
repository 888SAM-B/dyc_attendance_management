import React from 'react'
import {useNavigate} from 'react-router-dom'
const staffDashboard = () => {
  const navigate = useNavigate();

  const handleMarkAttendance = () => {
    navigate('/class-list');
  };

  const handleViewAttendanceReport = () => {
    navigate('/class_list');
  };

  return (
    <div>
        <h1>STAFF DASHBOARD</h1>
        <button onClick={handleMarkAttendance} >Mark Attendance</button>
        <button onClick={handleViewAttendanceReport}>View Attendance Report</button>
    </div>
  )
}

export default staffDashboard