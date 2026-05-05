import { useState } from "react";
import api from "../services/api"; // your API file

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      const data = await api.auth.login({
        username,
        password,
      });

      // ✅ IMPORTANT (must match your API file)
      localStorage.setItem("xpect_authToken", data.token);
      localStorage.setItem("xpect_user", JSON.stringify(data.user));

      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#f4f6f9]">
      <div className="w-[420px] bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Login</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Username */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1">
              USERNAME
            </label>
            <input
              className="px-3 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="e.g. John Smith"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1">
              PASSWORD
            </label>
            <input
              type="password"
              className="px-3 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 text-blue-600 text-xs p-3 rounded-lg">
            Login credentials are securely handled. Please keep your password
            confidential.
          </div>

          {/* Button */}
          <button
            type="submit"
            className="mt-2 py-3 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-900 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
