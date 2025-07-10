import { Route, Routes } from "react-router";
import "./App.css";
import KanBan from "./pages/KanBan";
import Login from "./pages/Login";
import RegistrationPage from "./pages/Registration";
function App() {
  return (
    <>
      <Routes>
        <Route path="auth">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<RegistrationPage />} />
        </Route>
        <Route path="/" element={<KanBan />} />
      </Routes>
    </>
  );
}

export default App;
