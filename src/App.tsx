import { Route, Routes, Navigate } from "react-router";
import "./App.css";
import KanBan from "./pages/KanBan";
import Login from "./pages/Login";
import RegistrationPage from "./pages/Registration";
import MainLayout from "./pages/MainLayout";
import WelcomeScreen from "./pages/WelcomeScreen";
import useAuthStore from "./store/AuthStore";
import ProtectedRoute from "./components/ProtectRoute";

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route path="/auth/*">
        <Route path="login" element={<Login />} />
        <Route path="register" element={<RegistrationPage />} />
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WelcomeScreen />} />
        <Route path="workflow/:workflowId" element={<KanBan />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/" : "/auth/login"} replace />
        }
      />
    </Routes>
  );
}

export default App;
