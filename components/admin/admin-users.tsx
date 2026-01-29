"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, ShieldOff, Trash2, Loader2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ is_admin: !currentStatus }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, is_admin: !currentStatus } : u))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">All Users</h2>
        <p className="text-sm text-muted-foreground">Total: {users.length}</p>
      </div>

      {users.length === 0 ? (
        <p className="text-muted-foreground">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-card p-4 rounded-lg border shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{user.full_name || "No name"}</h3>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center flex-wrap justify-start sm:justify-end">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.is_admin
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {user.is_admin ? "Admin" : "User"}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAdmin(user.id, user.is_admin)}
                    disabled={actionLoading === user.id}
                  >
                    {actionLoading === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.is_admin ? (
                      <ShieldOff className="h-4 w-4" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteUser(user.id)}
                    disabled={actionLoading === user.id}
                  >
                    {actionLoading === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
