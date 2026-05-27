"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    alert(data.message);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          Create Account
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
          />

          <select
            name="role"
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
          >
            <option value="">Select Role</option>
            <option>Admin</option>
            <option>Policymaker</option>
            <option>Researcher</option>
            <option>CSO</option>
            <option>Public User</option>
          </select>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold"
          >
            Register
          </button>
        </form>
      </div>
    </main>
  );
}