import './App.css'
import {Routes,Route} from 'react-router-dom'
import Home from './pages/home'
import CreateInstitution from './pages/createinstitution'
import Adminlogin from './pages/Adminlogin'
import Teacherlogin from './pages/Teacherlogin'
import Studentlogin from './pages/Studentlogin'
import Teacher from './pages/teacher'
import Student from './pages/student'
import Admindashboard from './pages/admindashboard'
import AddStudents from './pages/AddStudents'
import AddStaff from './pages/addStaff'
function App() {
  return (
   <div>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/createinstitution" element={<CreateInstitution/>}/>
        <Route path="/stafflogin" element={<Teacherlogin/>}/>
        <Route path="/studentlogin" element={<Studentlogin/>}/>
        <Route path="/adminlogin" element={<Adminlogin/>}/>
        <Route path="/addStudents" element={<AddStudents/>}/>
        <Route path="/addStaff" element={<AddStaff/>}/>
        <Route path="/staff" element={<Teacher/>}/>
        <Route path="/student" element={<Student/>}/>
        <Route path="/admindashboard" element={<Admindashboard/>}/>
      </Routes>
    </div>
  )
}
export default App;