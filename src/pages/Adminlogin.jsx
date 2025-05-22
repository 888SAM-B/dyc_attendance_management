import React from 'react';
import { useNavigate } from 'react-router-dom';

const Adminlogin = () => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const userId = e.target.userId.value; // Changed to userId
        const password = e.target.password.value;

        if (!userId || !password) {
            alert('Please fill in all fields');
            return;
        }

        fetch('http://localhost:5000/adminLogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, password }), // Changed to userId
        })
        .then(response => response.json())
        .then(data => {
            console.log('Institution found:', data);
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.message);
                // Redirect to the staff page after successful login
                navigate('/admindashboard', { replace: true });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Login failed');
        });

        console.log('UserId:', userId);
        console.log('Password:', password);
    };

    return (
        <>
            <div className='container'>
                <h1>Admin Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="userId" className="form-label">User ID</label>
                        <input type="text" name="userId" className="form-control" id="userId" /> {/* Changed name and id */}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input type="password" name="password" className="form-control" id="password" /> {/* Changed name */}
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
            </div>
        </>
    );
}

export default Adminlogin;
