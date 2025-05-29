import React from 'react';
import { useNavigate } from 'react-router-dom';

const url = import.meta.env.VITE_URL;

const Adminlogin = () => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const userId = e.target.userId.value.trim();
        const password = e.target.password.value.trim();

        if (!userId || !password) {
            alert('Please fill in all fields');
            return;
        }

        fetch(`${url}/adminLogin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.message);

                // ✅ Store credentials in sessionStorage
                sessionStorage.setItem('adminUserId', userId);
                sessionStorage.setItem('adminPassword', password);

                // ✅ Navigate to dashboard
                navigate('/admindashboard', { replace: true });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Login failed');
        });
    };
    const togglePasswordVisibility = () => {
        const passwordField = document.getElementById('password');
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
        } else {
            passwordField.type = 'password';
        }
    }
    return (
        <div className='container'>
            <h1>Admin Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="userId" className="form-label">User ID</label>
                    <input type="text" name="userId" className="form-control" id="userId" />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" name="password" className="form-control" id="password" />
                    <input type="checkbox" onClick={togglePasswordVisibility} /> 
                </div>
                <button type="submit" className="btn btn-primary">Login</button>
            </form>
        </div>
    );
};

export default Adminlogin;
