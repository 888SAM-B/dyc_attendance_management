import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const url = import.meta.env.VITE_URL;

const Teacher = () => {
  const [display, setDisplay] = useState('none');
  const [classes, setClasses] = useState([]);
  const inputRef = useRef(null);
  const  navigate=useNavigate();
  const fetchClasses = async () => {
    try {
      const response = await fetch(`${url}/classes`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': sessionStorage.getItem('adminUserId'),
          'x-user-password': sessionStorage.getItem('adminPassword'),
        },
      });
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);



  

  

  return (
    <>
      <div className="classesList">
        {classes.map((cls, idx) => (
          <button
          onClick={()=>{navigate('/markAttendance', { state: { students: cls.Students, className: cls.className } })}}
          ><div className="Classes" key={cls._id || idx}>
            <h2>{cls.className}</h2>
          </div></button>
        ))}
      </div>
    </>
  );
};

export default Teacher;
