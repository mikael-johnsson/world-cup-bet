"use client";

import { useAuth } from "@/context/AuthContext";

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
    <div className="flex items-center justify-center p-4 bg-gray-800 text-white gap-4">
      <h1 className="text-3xl font-bold">World Cup Bet</h1>
      <div className="flex gap-4">
        {authUser ? (
          <div>
            <span>
              Logged in as {authUser.role}: {authUser.username}
            </span>
            {authUser.role === "admin" && (
              <button className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Admin Panel {/* this button doesnt do anything */}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        ) : isAuthLoading ? (
          <span>Loading...</span>
        ) : null}
      </div>
    </div>
  );
};

export default Header;
