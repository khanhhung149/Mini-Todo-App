import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from './pages/LoginPage';
import BoardPage from "./pages/BoardPage";

const PrivateRoute =({children}) =>{
  const token = localStorage.getItem('token');
  return token ? children :<Navigate to ='/login'/>;
}
const PublicRoute = ({children}) =>{
  const token = localStorage.getItem('token');
  return token ? <Navigate to ='/board'/> : children;
}

function App() {
  return (
   <BrowserRouter>
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage/>
        </PublicRoute>  
      }/>
      <Route path="/board" element={
        <PrivateRoute>
          <BoardPage/>
        </PrivateRoute>
      }/>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
   </BrowserRouter>
  )
}

export default App