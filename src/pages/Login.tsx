import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { NavLink, useNavigate } from "react-router";
import useAuthStore from "../store/AuthStore";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } =
    useAuthStore();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear auth error when user starts typing
    if (error) {
      clearError();
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate("/", { replace: true });
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center font-sans text-text-primary p-4">
      <div className="bg-card-base p-10 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-center mb-8 text-white text-2xl font-normal">
          Login to FlowMaster
        </h2>

        {/* Demo Credentials */}
        <div className="mb-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm font-medium mb-2">
            Demo Credentials:
          </p>
          <p className="text-blue-200 text-xs">Email: admin@flowmaster.com</p>
          <p className="text-blue-200 text-xs">Password: password123</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-5">
            <label className="block mb-2 text-gray-300 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded text-white text-sm outline-none focus:ring-1 transition-colors ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-outline focus:border-accent focus:ring-accent"
              }`}
              placeholder="Enter your email"
              required
              disabled={isLoading}
              autoComplete="off"
            />
            {errors.email && (
              <p className="mt-1 text-red-400 text-xs">{errors.email}</p>
            )}
          </div>

          <div className="mb-8">
            <label className="block mb-2 text-gray-300 text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 border rounded text-white text-sm outline-none focus:ring-1 transition-colors ${
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-outline focus:border-accent focus:ring-accent"
              }`}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="mt-1 text-red-400 text-xs">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-accent border-none rounded text-white text-base cursor-pointer hover:bg-accent/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center mt-5 text-sm text-gray-400">
          <NavLink
            to="/auth/register"
            className="text-gray-300 no-underline hover:text-white transition-colors"
          >
            Don't have an Account? Register Now
          </NavLink>
        </div>
      </div>
    </main>
  );
};
