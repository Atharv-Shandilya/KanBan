import React, { useState, type FormEvent, type ChangeEvent } from "react";
import { NavLink, useNavigate } from "react-router";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      console.log("Registration attempt:", {
        email: formData.email,
        password: formData.password,
      });
      navigate("/");
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <main className=" mt-[100px] flex items-center justify-center font-sans text-white p-4">
      <div className="bg-card-base p-10 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-center mb-8 text-white text-2xl font-normal">
          Create Account
        </h2>

        <input
          type="text"
          name="fake-username"
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
        />
        <input
          type="password"
          name="fake-password"
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
        />

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          autoComplete="off"
          noValidate
        >
          <div>
            <label className="block mb-2 text-gray-300 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3  border  rounded text-white text-sm outline-none focus:ring-1  transition-colors ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-outline  focus:border-accent "
              }`}
              placeholder="Enter your email"
              required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {errors.email && (
              <p className="mt-1 text-red-400 text-xs">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-gray-300 text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3  border  rounded text-white text-sm outline-none focus:ring-1  transition-colors ${
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-outline  focus:border-accent "
              }`}
              placeholder="Enter your password"
              required
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {errors.password && (
              <p className="mt-1 text-red-400 text-xs">{errors.password}</p>
            )}
          </div>

          <div className="mb-10">
            <label className="block mb-2 text-gray-300 text-sm">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-3  border  rounded text-white text-sm outline-none focus:ring-1  transition-colors  ${
                errors.confirmPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-outline  focus:border-accent "
              }`}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-red-400 text-xs">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-accent border-none rounded text-white text-base cursor-pointer hover:bg-accent/70 transition-colors duration-200"
          >
            Create Account
          </button>
        </form>

        <div className="text-center mt-5 text-sm text-gray-400">
          Already have an account?{" "}
          <NavLink
            to={"/auth/login"}
            className="text-gray-300 no-underline hover:text-white transition-colors"
          >
            Sign in
          </NavLink>
        </div>
      </div>
    </main>
  );
};
