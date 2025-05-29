import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const url = import.meta.env.VITE_URL;

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [dbName, setDbName] = useState('');

    useEffect(() => {
        const userId = sessionStorage.getItem('adminUserId');
        const password = sessionStorage.getItem('adminPassword');

        if (!userId || !password) {
            alert("Session expired. Please log in again.");
            navigate('/adminlogin');
            return;
        }

        const fetchDbInfo = async () => {
            try {
                const response = await fetch(`${url}/currentDb`, {
                    headers: {
                        'x-user-id': userId,
                        'x-user-password': password
                    }
                });

                const data = await response.json();

                if (data.error) {
                    alert(data.error);
                    navigate('/adminlogin');
                } else {
                    setDbName(data.dbName);
                }
            } catch (err) {
                console.error('Error fetching DB info:', err);
                alert('Failed to fetch DB info');
            }
        };

        fetchDbInfo();
    }, [navigate]);

    return (
        <>
            <div className="container">
                <h1>{dbName ? `Connected to: ${dbName}` : 'Loading DB...'}</h1>
                <h2>Admin Dashboard</h2>
                <p>Welcome to the admin dashboard!</p>
                <p>Here you can manage the institution's data.</p>
                <div className="button-group">
                    <button title="Add or edit Student Details" onClick={() => navigate('/addStudents')}>Students</button>
                    <button title="Add or edit Staff Details" onClick={() => navigate('/addStaff')}>Staff</button>
                    <button title="Add or Remove Classes" onClick={() => navigate('/addClasses')}>Class</button>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
