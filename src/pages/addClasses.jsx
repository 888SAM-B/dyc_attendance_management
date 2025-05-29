import React, { useEffect, useRef, useState } from 'react';

const url = import.meta.env.VITE_URL;

const AddClasses = () => {
  const [display, setDisplay] = useState('none');
  const [classes, setClasses] = useState([]);
  const inputRef = useRef(null);

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

  useEffect(() => {
    if (display === 'flex' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [display]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const className = e.target.name.value;

    try {
      const response = await fetch(`${url}/addClass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': sessionStorage.getItem('adminUserId'),
          'x-user-password': sessionStorage.getItem('adminPassword'),
        },
        body: JSON.stringify({ className }),
      });

      const data = await response.json();
      alert(data.message || data.error);
      if (!data.error) {
        setClasses([...classes, { className, _id: data.id || Date.now() }]);
        setDisplay('none');
        e.target.reset();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add class');
    }
  };

  const handleDeleteClass = async (classId, className) => {
    if (!window.confirm(`All Data Inside Class "${className}" Will Be Deleted? `)) return;

    try {
      const response = await fetch(`${url}/deleteClass/${classId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': sessionStorage.getItem('adminUserId'),
          'x-user-password': sessionStorage.getItem('adminPassword'),
        },
        body: JSON.stringify({ className }),
      });

      const data = await response.json();
      alert(data.message || data.error);
      if (!data.error) {
        setClasses(classes.filter(cls => cls._id !== classId));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete class');
    }
  };

  return (
    <>
      <h1>Add Classes</h1>
      <button onClick={() => setDisplay('flex')}>Add Class</button>

      <div className="classesList">
        {classes.map((cls, idx) => (
          <div className="Classes" key={cls._id || idx}>
            <h2>{cls.className}</h2>
            <button onClick={() => handleDeleteClass(cls._id, cls.className)}>X</button>
          </div>
        ))}
      </div>

      <div className="mainContainer">
        <div className="addcontainer" style={{ display }}>
          <div className="add">
            <button className="close" onClick={() => setDisplay('none')}>X</button>
            <h2>Add Class</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                id="className"
                placeholder="Class Name"
                required
                ref={inputRef}
              />
              <button type="submit" className="addButton">Add Class</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddClasses;
