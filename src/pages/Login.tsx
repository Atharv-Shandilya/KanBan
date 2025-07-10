import { useState } from "react";
import { NavLink } from "react-router";

export default () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
  };

  return (
    <main className=" mt-[100px] flex items-center justify-center font-sans text-text-primary">
      <div className="bg-card-base p-10 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-center mb-8 text-white text-2xl font-normal">
          Login
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-2 text-gray-300 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3  border border-outline rounded text-white text-sm outline-none focus:border-accent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block mb-2 text-gray-300 text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3  border border-outline rounded text-white text-sm outline-none focus:border-accent"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-accent border-none rounded text-white text-base cursor-pointer hover:bg-accent/70 transition-colors duration-200"
          >
            Sign In
          </button>
        </form>

        <div className="text-center mt-5 text-sm text-gray-400">
          <NavLink
            to={"/auth/register"}
            className="text-gray-300 no-underline hover:text-white"
          >
            Don't have an Account? Register Now
          </NavLink>
        </div>
      </div>
    </main>
  );
};
