import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const url = import.meta.env.VITE_URL;

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [institution, setInstitution] = useState('');
  const [dbName, setDbName] = useState('');

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await fetch(`${url}/institutions`);
        if (!response.ok) throw new Error('Failed to fetch institutions');
        const institutions = await response.json();
        const institutionSelect = document.getElementById('institution');
        institutions.forEach(inst => {
          const option = document.createElement('option');
          option.value = inst.dbName;
          option.textContent = inst.dbName;
          institutionSelect.appendChild(option);
        });
      } catch (error) {
        console.error('Error fetching institutions:', error);
        alert('Failed to load institutions. Please try again later.');
      }
    };
    fetchInstitutions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;
    try {
      const response = await fetch(`${url}/staffLogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institution, username, password })
      });
      console.log('Response:', response);
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('staffUserId', username);
        setDbName(data.dbName);
        sessionStorage.setItem('adminUserId', data.adminUserId);
        sessionStorage.setItem('adminPassword', data.adminPassword);
        alert('Login successful');
        navigate('/staffDashboard', { replace: true });
      } else {
        alert('Invalid username or password');
      }
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  return (
    <>  
    <form onSubmit={handleSubmit}>
      <select id="institution" onChange={(e) => setInstitution(e.target.value)} required>
        <option value="">Select Institution</option>
      </select>
      <input type="text" name="username" placeholder="Staff ID" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <h2>{dbName}</h2>
    </>
  );
};  

export default TeacherLogin;
