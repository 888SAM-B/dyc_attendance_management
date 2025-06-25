import React, { useEffect, useState } from 'react';
import './addStaff.css';
const AddStaff = () => {
  const [dbName, setDbName] = useState('');
  const [staff, setStaff] = useState([]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [display, setDisplay] = useState('none');
 
const url=import.meta.env.VITE_URL
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
 
  useEffect(() => {
    const fetchDbInfo = async () => {
      try {
        const response = await fetch(`${url}/currentDb`, {
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': sessionStorage.getItem('adminUserId'),
            'x-user-password': sessionStorage.getItem('adminPassword'),
          },
        });
        const data = await response.json();

        if (data.dbName && data.dbName !== 'No active database connection') {
          setDbName(data.dbName);
          setStaff(data.staff || []);
          setLoading(false);
        } else {
          setTimeout(fetchDbInfo, 500); // retry if db not yet ready
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error connecting to server');
        setLoading(false);
      }
    };

    fetchDbInfo();
  }, []);

  const handleDelete = async (staffId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this staff?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${url}/deleteStaff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': sessionStorage.getItem('adminUserId'),
          'x-user-password': sessionStorage.getItem('adminPassword'),
        },  
        body: JSON.stringify({ staffId }),
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
        setStaff(staff.filter((s) => s.staffId !== staffId));
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to delete staff');
    }
  };

  return (
    <>
  <h1 className="db-connection-status1">
    {error
      ? error
      : loading
      ? 'Connecting to database...'
      : `Connected to: ${dbName}`}
  </h1>

  <button className="add-student-button" onClick={() => setDisplay('flex')}>
    Add Staff
  </button>

  {!loading && !error && (
    <div className="student-section">
      <h2 className="student-list-heading">Staff List:</h2>
      {staff.length === 0 ? (
        <p className="no-students-message">No staff found.</p>
      ) : (
        <table className="student-table" border={1} cellPadding={5} cellSpacing={0}>
          <thead>
            <tr className="student-table-header">
              <th>Name</th>
              <th>Staff ID</th>
              <th>Password</th>
              <th>Subject</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s, index) => (
              <tr key={s._id || index} className="student-row">
                <td>{s.name}</td>
                <td>{s.staffId}</td>
                <td>{s.password}</td>
                <td>{s.subject}</td>
                <td className="action-cell">
                  <button
                    onClick={() => handleDelete(s.staffId)}
                    className="delete-student-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )}

  <div className="add-student-container" style={{ display: display }}>
    <div className="add-student-box">
      <button className="close-add-student-button" onClick={() => setDisplay('none')}>
        BACK
      </button>
      <h2 className="add-student-title">Add Staff</h2>
      <form
        className="add-student-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const name = e.target.name.value;
          const staffId = e.target.staffId.value;
          const subject = e.target.subject.value;
          const password = e.target.password.value;
          if (!name || !staffId || !subject || !password) {
            alert('Please fill in all fields');
            return;
          }

          try {
            const response = await fetch(`${url}/addStaff`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': sessionStorage.getItem('adminUserId'),
                'x-user-password': sessionStorage.getItem('adminPassword'),
              },
              body: JSON.stringify({ name, staffId, password, subject }),
            });

            const data = await response.json();
            if (data.error) {
              alert(data.error);
            } else {
              alert(data.message);
              setStaff([...staff, { name, staffId, subject }]);
              e.target.reset();
              setDisplay('none');
            }
          } catch (err) {
            console.error('Error:', err);
            alert('Failed to add staff');
          }
        }}
      >
        <input type="text" name="name" placeholder="Name" required className="student-input" />
        <input type="text" name="staffId" placeholder="Staff ID" required className="student-input" />
        <input type="text" name="password" placeholder="Password" required className="student-input" />
        <input type="text" name="subject" placeholder="Subject" required className="student-input" />
        <button type="submit" className="submit-add-student-button">
          Add Staff
        </button>
      </form>
    </div>
  </div>
</>

  );
};

export default AddStaff;
