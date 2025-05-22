import React from 'react'

const home = () => {
  return (
    <>
        <h1>Welcome to the Attendance Management System</h1>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={() => window.location.href = '/createinstitution'}>New Institution registration</button>
            <button onClick={() => window.location.href = '/adminlogin'}>Admin Login</button>
            <button onClick={() => window.location.href = '/stafflogin'}>Staff Login</button>
            <button onClick={() => window.location.href = '/studentlogin'}>Student Login</button>
        </div>
    </>
  )
}

export default home