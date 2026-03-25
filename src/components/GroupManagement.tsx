"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface GroupManagementProps {
  initialGroup?: string;
  onGroupChanged?: (group: string) => void;
}

const GROUP_NAME_MAX_LENGTH = 50;

export default function GroupManagement({
  initialGroup = "default",
  onGroupChanged,
}: GroupManagementProps) {
  const { authUser, isAuthLoading } = useAuth();

  const [currentGroup, setCurrentGroup] = useState(initialGroup);
  const [createInput, setCreateInput] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState(initialGroup);
  const [joinPassword, setJoinPassword] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentGroup(initialGroup);
    setSelectedGroup(initialGroup);
  }, [initialGroup]);

  const selectOptions = useMemo(() => {
    // Ensure current group remains selectable even if no one else currently uses it.
    const merged = new Set([...availableGroups, currentGroup]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [availableGroups, currentGroup]);

  const fetchGroups = async () => {
    try {
      setIsLoadingGroups(true);
      const response = await fetch("/api/groups");

      if (!response.ok) {
        throw new Error("Misslyckades att hämta grupper");
      }

      const data = await response.json();
      setAvailableGroups(Array.isArray(data.groups) ? data.groups : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Okänt fel");
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const fetchCurrentUserGroup = async () => {
    try {
      const response = await fetch("/api/user/group");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Misslyckades att hämta användarens grupp",
        );
      }

      const userGroup =
        typeof data.group === "string"
          ? data.group
          : typeof data.group?.name === "string"
            ? data.group.name
            : "default";

      setCurrentGroup(userGroup);
      setSelectedGroup(userGroup);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Okänt fel");
    }
  };

  useEffect(() => {
    if (!authUser) {
      return;
    }

    const loadGroupData = async () => {
      await Promise.all([fetchGroups(), fetchCurrentUserGroup()]);
    };

    loadGroupData();
  }, [authUser]);

  const updateGroup = async (groupName: string, password: string) => {
    try {
      setIsUpdating(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch("/api/user/group", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Misslyckades att skapa grupp");
      }

      const updatedGroup =
        typeof data.group === "string"
          ? data.group
          : typeof data.group?.name === "string"
            ? data.group.name
            : "default";

      setCurrentGroup(updatedGroup);
      setSelectedGroup(updatedGroup);
      setCreateInput("");
      setCreatePassword("");
      setJoinPassword("");
      setSuccessMessage("Grupp vald");
      onGroupChanged?.(updatedGroup);

      await fetchGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Okänt fel");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateGroupSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const normalizedName = createInput.trim();
    const normalizedPassword = createPassword.trim();

    if (!normalizedName) {
      setError("En grupp måste anges");
      return;
    }

    if (normalizedName.length > GROUP_NAME_MAX_LENGTH) {
      setError("Gruppnamn får inte vara längre än 50 tecken");
      return;
    }

    if (!normalizedPassword) {
      setError("Lösenord krävs för att skapa grupp");
      return;
    }

    if (normalizedPassword.length < 6) {
      setError("Lösenord måste vara minst 6 tecken");
      return;
    }

    await updateGroup(normalizedName, normalizedPassword);
  };

  const handleChooseGroupSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedGroup) {
      setError("Vänligen välj en grupp");
      return;
    }

    const normalizedPassword = joinPassword.trim();
    if (!normalizedPassword) {
      setError("Lösenord krävs för att gå med i en grupp");
      return;
    }

    if (normalizedPassword.length < 6) {
      setError("Lösenord måste vara minst 6 tecken");
      return;
    }

    await updateGroup(selectedGroup, normalizedPassword);
  };

  if (isAuthLoading) {
    return (
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        Laddar gruppinformation...
      </div>
    );
  }

  if (!authUser) {
    return null;
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-lg font-semibold text-gray-900">Grupper</h3>
      <p className="mt-1 text-sm text-gray-600">
        Din grupp:{" "}
        <span className="font-semibold text-gray-900">{currentGroup}</span>
      </p>

      {error && (
        <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {successMessage && (
        <p className="mt-3 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          {successMessage}
        </p>
      )}

      <form onSubmit={handleCreateGroupSubmit} className="mt-4 space-y-2">
        <label
          htmlFor="createGroup"
          className="block text-sm font-medium text-gray-700"
        >
          Skapa grupp
        </label>
        <div className="flex gap-2">
          <input
            id="createGroup"
            type="text"
            value={createInput}
            onChange={(event) => setCreateInput(event.target.value)}
            placeholder="friends-2026"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none"
          />
          <input
            id="createGroupPassword"
            type="password"
            value={createPassword}
            onChange={(event) => setCreatePassword(event.target.value)}
            placeholder="Lösenord"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isUpdating}
            className="rounded bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
          >
            Skapa
          </button>
        </div>
      </form>

      <form onSubmit={handleChooseGroupSubmit} className="mt-4 space-y-2">
        <label
          htmlFor="chooseGroup"
          className="block text-sm font-medium text-gray-700"
        >
          Välj grupp
        </label>
        <div className="flex gap-2">
          <select
            id="chooseGroup"
            value={selectedGroup}
            onChange={(event) => setSelectedGroup(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none"
            disabled={isLoadingGroups || isUpdating}
          >
            {selectOptions.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          <input
            id="joinGroupPassword"
            type="password"
            value={joinPassword}
            onChange={(event) => setJoinPassword(event.target.value)}
            placeholder="Lösenord"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none"
            disabled={isLoadingGroups || isUpdating}
          />
          <button
            type="submit"
            disabled={isUpdating || isLoadingGroups}
            className="rounded bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
          >
            Välj
          </button>
        </div>
      </form>
    </div>
  );
}
