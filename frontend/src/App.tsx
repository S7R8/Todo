import { Route, Routes } from "react-router-dom";

import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { TodoDashboard } from "./pages/TodoDashboard";
import { LoginPrompt } from "./components/LoginPrompt";

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/dashboard' element={<TodoDashboard />} />
        <Route path='/' element={<Home />} />
      </Routes>
      <LoginPrompt />
    </>
  )
}

export default AppRoutes;