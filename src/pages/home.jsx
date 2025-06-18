import React from 'react';


const url = import.meta.env.VITE_URL;

const Home = () => {
  return (
    <>
      <div className="home-container">
        <h1 className="home-title">Welcome to the Attendance Management System</h1>
        <h2 className="home-url">{url}</h2>

        <p className="home-description">
          This system simplifies attendance tracking for institutions, staff, and students. Whether you're managing a school, college, or workplace, our platform is designed to automate and streamline the attendance process.
        </p>

        <div className="home-button-group">
          <button className="home-button" onClick={() => window.location.href = '/createinstitution'}>
            New Institution Registration
          </button>
          <button className="home-button" onClick={() => window.location.href = '/adminlogin'}>
            Admin Login
          </button>
          <button className="home-button" onClick={() => window.location.href = '/stafflogin'}>
            Staff Login
          </button>
          <button className="home-button" onClick={() => window.location.href = '/studentlogin'}>
            Student Login
          </button>
        </div>

        <section className="home-features">
          <h3>Key Features</h3>
          <ul>
            <li>✅ Institution registration & centralized control</li>
            <li>✅ Role-based login for Admin, Staff, and Students</li>
            <li>✅ Real-time attendance marking</li>
            <li>✅ Automated attendance reports</li>
            <li>✅ Secure authentication</li>
          </ul>
        </section>

        <section className="home-how-it-works">
          <h3>How It Works</h3>
          <ol>
            <li>📝 Institution registers on the platform</li>
            <li>👤 Admin adds classes, staff, and students</li>
            <li>📅 Staff marks daily attendance</li>
            <li>📊 System generates reports</li>
            <li>👀 Students can view their attendance</li>
          </ol>
        </section>

        <footer className="home-footer">
          <p>Need help? Contact us at <a href="mailto:support@attendancems.com">support@attendancems.com</a></p>
          <p>&copy; {new Date().getFullYear()} Attendance Management System. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default Home;
