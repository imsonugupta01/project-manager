
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import Dashboard from './Pages/Dashboard';
import TaskPage from './Pages/Tasks';

function App() {
   return (
    <Routes>
      <Route path="/" element={<Login/>}  />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/tasks/:projectId" element={<TaskPage />} />

    </Routes>
  );
}

export default App;
