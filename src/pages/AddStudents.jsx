import React, { useEffect, useState } from 'react';
const url=import.meta.env.VITE_URL
const AddStudents = () => {
  const [dbName, setDbName] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true); // for initial loader
  const [error, setError] = useState('');
  const [display, setDisplay] = useState('none');
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchDbInfo = async () => {
      try {
        const response = await fetch(`${url}/currentDb`, {
          headers: {
            'x-user-id': sessionStorage.getItem('adminUserId'),
            'x-user-password': sessionStorage.getItem('adminPassword')
          }
        } );
        const data = await response.json();

        if (data.dbName && data.dbName !== 'No active database connection') {
          setDbName(data.dbName);
          setStudents(data.students || []);
          setLoading(false);
        } else {
          // Retry after short delay if DB is not yet connected
          setTimeout(fetchDbInfo, 500);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error connecting to server');
        setLoading(false);
      }
    };

    fetchDbInfo();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      try {

        const response = await fetch(`${url}/classes`
          , {
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': sessionStorage.getItem('adminUserId'),
            'x-user-password': sessionStorage.getItem('adminPassword')
          }} 
        );

        const data = await response.json();
        console.log('Fetched classes:', data); // Debugging line
        if (Array.isArray(data)) {
          setClasses(data);
        } else {
          console.error('Unexpected data format:', data);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to fetch classes');
      }
    };
    fetchClasses();
  }, []);

  const handleDelete = async (studentId) => {
    //confirm box
    const a=window.confirm("Are you sure you want to delete this Student?")
    if(!a){
      return
    }
    try {
      const response = await fetch(`${url}/deleteStudent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': sessionStorage.getItem('adminUserId'),
          'x-user-password': sessionStorage.getItem('adminPassword')
        },
        body: JSON.stringify({ studentId }),
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
        setStudents(students.filter((student) => student._id !== studentId));
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to delete student');
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
          <button className='addButton' onClick={() => setDisplay('flex')}>Add Student</button>
      {!loading && !error && (
        <div>
          <h2>Students List:</h2>
          {students.length === 0 ? (
            <p>No students found.</p>
          ) : (
            <table border={1} cellPadding={5} cellSpacing={0}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Roll No</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student._id || index}>
                    <td>{student.name}</td>
                    <td>{student.class}</td>
                    <td>{student.rollNumber}</td>
                    <td className='actions'>
                      <button onClick={() => handleDelete(student._id)} className='deleteButton'  >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      <div className="addcontainer" style={{display: display}}>
      <div className="add" >
        <button className='close' onClick={() => setDisplay('none')} >X</button>
        <h2>Add Student</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const name = e.target.name.value;
            const className = e.target.className.value;
            const rollNumber = e.target.rollNumber.value;
            
            if (!name || !className || !rollNumber) {
              alert('Please fill in all fields');
              return;
            }
            
            try {
              const response = await fetch(`${url}/addStudent`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-id': sessionStorage.getItem('adminUserId'),
                  'x-user-password': sessionStorage.getItem('adminPassword'),
                },
                body: JSON.stringify({ name, class: className, rollNumber }),
              });
              
              const data = await response.json();
              if (data.error) {
                alert(data.error);
              } else {
                alert(data.message);
                setStudents([...students, { name, class: className, rollNumber }]);
                e.target.reset();
                setDisplay('none');
              }
            } catch (err) {
              console.error('Error:', err);
              alert('Failed to add student');
            }
          }}
        >
          <input type="text" name="name" placeholder="Name" required /> 
          {/* <input list='classes' placeholder="Class" required /> 
          <datalist id='classes'>
            {classes.map((classItem, index) => (
              <option key={index} value={classItem.className}>{classItem.className}</option>
            ))}
          </datalist> */}
          <select name="className" id="" required>
            <option value="" disabled selected>Select Class</option>
            {classes.map((classItem, index) => (
              <option key={index} value={classItem.className}>{classItem.className}</option>
            ))}
          </select>
          <input type="text" name="rollNumber" placeholder="Roll Number" required /> 
          <button type="submit" className='addButton'>Add Student</button>
        </form>
      </div>
      </div>
    </>
  );
};

export default AddStudents;
