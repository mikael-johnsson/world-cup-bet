"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const Header = () => {
  const { authUser, isAuthLoading, refreshAuth } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        await refreshAuth();
        window.location.href = "/login";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <header className="flex gap-4 bg-green-700 text-green-500 p-4 items-center">
      {authUser ? (
        <div>
          <span>Välkommen {authUser.username}!</span>
          <button
            onClick={handleLogout}
            className="ml-4 bg-green-500 hover:bg-gray-800 text-green-700 font-bold py-2 px-4 rounded"
          >
            Logga ut
          </button>
        </div>
      ) : isAuthLoading ? (
        <span>Loading...</span>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 bg-green-500 hover:bg-gray-800 text-green-700 font-bold rounded"
          >
            Logga in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-green-500 hover:bg-gray-800 text-green-700 font-bold rounded"
          >
            Registrera
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
