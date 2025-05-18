import React from 'react'
import { useNavigate } from 'react-router-dom'
const Teacherlogin = () => {
  const navigate = useNavigate()
  const handleSubmit = (e) => {
    e.preventDefault()
    const username = e.target.username.value
    const password = e.target.password.value
    // Perform login logic here, such as sending a request to the server
    // For now, we'll just log the values to the console
    console.log('Username:', username)
    console.log('Password:', password)
    // Redirect to the staff page after successful login
    navigate('/staff', { replace: true })
  }
  return (
    <>
        <div className='container'>
            <h1>Staff Login</h1>
            <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input type="text" className="form-control" id="username" />
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" id="password" />
            </div>
            <button type="submit" className="btn btn-primary" >Login</button>
            </form>
        </div>
    </>
  )
}

export default Teacherlogin