import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const AttendanceReport = () => {
  const [className, setClassName] = useState("");
  const location = useLocation();

  useEffect(() => {
    const receivedClassName = location.state?.className;
    setClassName(receivedClassName || "Unknown Class");
  }, [location]);

  return (
    <div>
      <h1>Attendance Report for {className}</h1>
    </div>
  );
};

export default AttendanceReport;
