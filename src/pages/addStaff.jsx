import React, { useEffect, useState } from 'react';

const AddStaff = () => {
  const [dbName, setDbName] = useState('');
  const [staff, setStaff] = useState([]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [display, setDisplay] = useState('none');
const url=import.meta.env.VITE_URL
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
      <h1>
        {error
          ? error
          : loading
          ? 'Connecting to database...'
          : `Connected to: ${dbName}`}
      </h1>

      <button  className='addButton'  onClick={() => setDisplay('flex')}>Add Staff</button>

      {!loading && !error && (
        <div>
          <h2>Staff List:</h2>
          {staff.length === 0 ? (
            <p>No staff found.</p>
          ) : (
            <table border={1} cellPadding={5} cellSpacing={0}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th>Name</th>
                  <th>Staff ID</th>
                  <th>Password</th>
                  <th>Subject</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s, index) => (
                  <tr key={s._id || index}>
                    <td>{s.name}</td>
                    <td>{s.staffId}</td>
                    <td>{s.password}</td>
                    <td>{s.subject}</td>
                    <td className='actions' >
                      <button onClick={() => handleDelete(s.staffId)}  className="deleteButton"  >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="addcontainer" style={{ display: display }}>
        <div className="add">
          <button className="close" onClick={() => setDisplay('none')}>X</button>
          <h2>Add Staff</h2>
          <form
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
            <input type="text" name="name" placeholder="Name" required />
            <input type="text" name="staffId" placeholder="Staff ID" required />
            <input type="text" name="password" placeholder="Password" required />
            <input type="text" name="subject" placeholder="Subject" required />
            <button type="submit" className='addButton' >Add Staff</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddStaff;
