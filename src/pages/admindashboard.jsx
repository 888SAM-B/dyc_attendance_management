import React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
const admindashboard = () => {
    const navigate = useNavigate();
    const [dbName, setDbName] = useState('');

    useEffect(() => {
        const fetchDbInfo = async () => {
            try {
                const response = await fetch('http://localhost:5000/currentDb');
                const data = await response.json();
                setDbName(data.dbName);
            } catch (err) {
                console.error('Error:', err);
            }
        };
        fetchDbInfo();
    }, []);
  return (
    <>
        <h1>{dbName} </h1>
        <h2>Admin Dashboard</h2>
        <p>Welcome to the admin dashboard!</p>
        <p>Here you can manage the institution's data.</p>
        <button title='Add or edit Student Details' onClick={()=>{navigate('/addStudents')}}>Students</button>
        <button title='Add or edit Staff Details' onClick={()=>{navigate('/addStaff')}}>Staff</button>
    </>
  )
}

export default admindashboard