const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Loader2, ArrowLeft, Edit, Trash2, UserCheck, UserX, BadgeCheck, ShieldCheck, ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => db.entities.User.list('-created_date'),
    enabled: currentUser?.role === 'admin',
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => db.entities.User.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      queryClient.invalidateQueries(['all-users-badge']);
      setEditingUser(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => db.entities.User.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
    },
  });

  const toggleVerifiedMutation = useMutation({
    mutationFn: ({ userId, is_verified }) => db.entities.User.update(userId, { is_verified }),
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      queryClient.invalidateQueries(['all-users-badge']);
    },
  });

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.cnic?.includes(searchQuery)
  );

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="bg-white p-8 shadow-sm border border-gray-200 rounded-xl text-center">
          <p className="text-gray-600">Access Denied</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("AdminDashboard")}>
              <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
              <p className="text-gray-600 text-sm">{users.length} total users</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="bg-white p-4 shadow-sm border border-gray-200 rounded-xl mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name, email, or CNIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-500 rounded-lg"
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CNIC</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        {user.full_name}
                        {user.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.cnic || '-'}</TableCell>
                    <TableCell>{user.phone_number || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleVerifiedMutation.mutate({ 
                          userId: user.id, 
                          is_verified: !user.is_verified 
                        })}
                        disabled={toggleVerifiedMutation.isPending}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          user.is_verified
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={user.is_verified ? 'Click to remove verification' : 'Click to verify user'}
                      >
                        {user.is_verified ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified
                          </>
                        ) : (
                          <>
                            <ShieldX className="w-3.5 h-3.5" />
                            Not Verified
                          </>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(user.created_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this user?')) {
                              deleteUserMutation.mutate(user.id);
                            }
                          }}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Edit Dialog */}
        {editingUser && (
          <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={editingUser.full_name || ''}
                    onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>CNIC</Label>
                  <Input
                    value={editingUser.cnic || ''}
                    onChange={(e) => setEditingUser({...editingUser, cnic: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={editingUser.phone_number || ''}
                    onChange={(e) => setEditingUser({...editingUser, phone_number: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <select
                    value={editingUser.role || 'user'}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div>
                    <Label className="text-sm font-medium">Verified Badge</Label>
                    <p className="text-xs text-gray-500 mt-0.5">Show verified tick next to user's name</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingUser({...editingUser, is_verified: !editingUser.is_verified})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editingUser.is_verified ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                        editingUser.is_verified ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updateUserMutation.mutate({
                      userId: editingUser.id,
                      data: {
                        full_name: editingUser.full_name,
                        cnic: editingUser.cnic,
                        phone_number: editingUser.phone_number,
                        role: editingUser.role,
                        is_verified: editingUser.is_verified,
                      }
                    });
                  }}
                  disabled={updateUserMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}