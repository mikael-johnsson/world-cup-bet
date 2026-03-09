"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validationSchemas";
import Link from "next/link";
import Heading from "@/components/Heading";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setServerError(errorData.error || "Registration failed");
        return;
      }

      // Registration successful, redirect to login
      router.push("/login?registered=true");
    } catch (error) {
      setServerError("An unexpected error occurred");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      <Heading />
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Skapa konto</h2>
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Användarnamn
            </label>
            <input
              id="username"
              type="text"
              placeholder="Välj ett användarnamn (3-30 tecken)"
              {...register("username")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Ange din email"
              {...register("email")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Förnamn
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="Ange ditt förnamn"
              {...register("firstName")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Efternamn
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Ange ditt efternamn"
              {...register("lastName")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lösenord
            </label>
            <input
              id="password"
              type="password"
              placeholder="Skapa ett lösenord (6+ tecken)"
              {...register("password")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 rounded-md transition"
          >
            {isLoading ? "Skapar konto..." : "Skapa konto"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Har du redan ett konto?{" "}
          <Link
            href="/login"
            className="text-green-500 hover:text-green-600 font-medium"
          >
            Logga in här
          </Link>
        </p>
      </div>
    </div>
  );
}
