"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Researcher",
  });

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const { data, error } =
      await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

    if (error) {
      alert(error.message);
      return;
    }

    await supabase.from("users").insert([
      {
        id: data.user?.id,
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role,
        status: "Pending",
      },
    ]);

    alert(
      "Registration successful. Check your email."
    );

    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">

        <h1 className="text-3xl font-bold mb-8 text-center">
          AMHROA Signup
        </h1>

        <form
          onSubmit={handleSignup}
          className="space-y-5"
        >
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border p-3 rounded-xl"
            onChange={(e) =>
              setFormData({
                ...formData,
                full_name: e.target.value,
              })
            }
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded-xl"
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded-xl"
            onChange={(e) =>
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }
          />

          <select
            className="w-full border p-3 rounded-xl"
            onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value,
              })
            }
          >
            <option>Researcher</option>
            <option>Policymaker</option>
            <option>CSO</option>
            <option>Coordinator</option>
          </select>

          <button
            className="w-full bg-emerald-600 text-white py-3 rounded-xl"
          >
            Create Account
          </button>
        </form>
      </div>
    </main>
  );
}