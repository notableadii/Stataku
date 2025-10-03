import { useState, useEffect, useCallback } from "react";

export interface SearchUser {
  id: string;
  username: string;
  slug: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface UseUserSearchReturn {
  users: SearchUser[];
  filteredUsers: SearchUser[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isUserSearch: boolean;
  refreshUsers: () => Promise<void>;
}

export function useUserSearch(): UseUserSearchReturn {
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserSearch, setIsUserSearch] = useState(false);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search-users");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.data || []);
      setFilteredUsers(data.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter users based on search query
  const filterUsers = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFilteredUsers(users);
        setIsUserSearch(false);
        return;
      }

      // Check if search starts with @
      if (query.startsWith("@")) {
        setIsUserSearch(true);
        const searchTerm = query.slice(1).toLowerCase().trim();

        if (searchTerm === "") {
          setFilteredUsers(users);
          return;
        }

        const filtered = users.filter((user) => {
          const username = user.username.toLowerCase();
          const displayName = user.display_name?.toLowerCase() || "";

          return (
            username.includes(searchTerm) || displayName.includes(searchTerm)
          );
        });

        setFilteredUsers(filtered);
      } else {
        setIsUserSearch(false);
        setFilteredUsers([]);
      }
    },
    [users]
  );

  // Handle search query changes
  const handleSearchQuery = useCallback(
    (query: string) => {
      setSearchQuery(query);
      filterUsers(query);
    },
    [filterUsers]
  );

  // Refresh users data
  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  // Initial fetch when hook is first used
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users when search query changes
  useEffect(() => {
    filterUsers(searchQuery);
  }, [searchQuery, filterUsers]);

  return {
    users,
    filteredUsers,
    loading,
    error,
    searchQuery,
    setSearchQuery: handleSearchQuery,
    isUserSearch,
    refreshUsers,
  };
}
