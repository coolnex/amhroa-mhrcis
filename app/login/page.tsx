"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
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
  
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
  
    if (error) {
      alert(error.message);
      return;
    }
  
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();
  
    if (!profile) {
      alert("User profile not found");
      return;
    }
  
    localStorage.setItem(
      "user",
      JSON.stringify(profile)
    );
  
    if (profile.role === "Admin") {
      window.location.href = "/admin";
    } else if (
      profile.role === "Researcher"
    ) {
      window.location.href =
        "/researcher";
    } else if (
      profile.role === "Policymaker"
    ) {
      window.location.href =
        "/policymaker";
    } else if (profile.role === "CSO") {
      window.location.href = "/cso";
    } else {
      window.location.href = "/public";
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          AMHROA Login
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter password"
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold"
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}