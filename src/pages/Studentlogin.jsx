import React from 'react'
import { useEffect,useState } from 'react'
import { replace, useNavigate } from 'react-router-dom'
const Studentlogin = () => {
const url = import.meta.env.VITE_URL
  const [institution, setInstitution] = useState('')
  const [studentdata, setStudentData] = useState({})
  
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
  const navigate = useNavigate()
  const handleSubmit = (e) => {
    e.preventDefault()
    const rollNumber = e.target.rollNumber.value
    console.log('Roll Number:', rollNumber)
    console.log('Institution:', institution)
   fetch(`${url}/studentLogin`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ institution, rollNumber })
})
  .then(res => {
    if (!res.ok) throw new Error('Login failed');
    return res.json(); // only once!
  })
  .then(response => {
    console.log('Student Data:', response);
    navigate('/studentDashboard', { state: { studentData: response.studentData } });
    alert('Login Successful');
  })
  .catch(err => {
    console.error('Login error:', err);
    alert('Login failed. Please check your details.');
  });


    // Redirect to the staff page after successful login
    // navigate('/staff', { replace: true })
  }
  return (
    <>
        <div className='container'>
            <h1>Student Login</h1>
            <form  onSubmit={handleSubmit}>
               <select id="institution" onChange={(e) => setInstitution(e.target.value)} required>
        <option value="">Select Institution</option>
      </select>
                <div className="mb-3">
                    <label htmlFor="rollNumber" className="form-label">Roll Number</label>
                    <input type="text" className="form-control" id="rollNumber" name="rollNumber" required />
                </div>
                
            <button type="submit" className="btn btn-primary" >Login</button>
            </form>
        </div>
    </>
  )
}

export default Studentlogin