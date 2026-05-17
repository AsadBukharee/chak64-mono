const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Search, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminDonations() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const { data: donations = [], isLoading } = useQuery({
    queryKey: ['adminDonations'],
    queryFn: () => db.entities.Donation.list('-created_date'),
    enabled: currentUser?.role === 'admin',
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ donationId, isPublic }) => 
      db.entities.Donation.update(donationId, { is_public: !isPublic }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminDonations']);
    },
  });

  const filteredDonations = donations.filter(donation => 
    donation.donor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donation.donor_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donation.donation_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTotalAmount = () => {
    return donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  };

  if (currentUser?.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Access Denied</p></div>;
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
              <h1 className="text-2xl font-bold text-gray-900">Donations Management</h1>
              <p className="text-gray-600 text-sm">
                {donations.length} donations • Total: ${getTotalAmount().toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="bg-white p-4 shadow-sm border border-gray-200 rounded-xl mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by donor name, email, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-500 rounded-lg"
            />
          </div>
        </Card>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <Card className="bg-gradient-to-br from-red-500 to-pink-500 p-6 shadow-sm border-0 rounded-xl text-white">
            <h3 className="text-sm font-medium mb-2 opacity-90">Charity Donations</h3>
            <p className="text-3xl font-bold">
              ${donations.filter(d => d.donation_type === 'charity').reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
            </p>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500 to-purple-500 p-6 shadow-sm border-0 rounded-xl text-white">
            <h3 className="text-sm font-medium mb-2 opacity-90">Campaign Donations</h3>
            <p className="text-3xl font-bold">
              ${donations.filter(d => d.donation_type === 'campaign').reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
            </p>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-yellow-500 p-6 shadow-sm border-0 rounded-xl text-white">
            <h3 className="text-sm font-medium mb-2 opacity-90">Sponsor Funds</h3>
            <p className="text-3xl font-bold">
              ${donations.filter(d => d.donation_type === 'sponsor_fund').reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
            </p>
          </Card>
        </div>

        {/* Donations Table */}
        <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="p-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No donations found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purpose/Campaign</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {donation.is_public ? donation.donor_name : 'Anonymous'}
                        </div>
                        {donation.is_public && (
                          <div className="text-xs text-gray-500">{donation.donor_email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      ${donation.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        donation.donation_type === 'charity' ? 'bg-red-100 text-red-700' :
                        donation.donation_type === 'campaign' ? 'bg-pink-100 text-pink-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {donation.donation_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {donation.charity_type || donation.fund_type || donation.campaign_id || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {donation.is_public && donation.location ? donation.location : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(donation.created_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        donation.is_public 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {donation.is_public ? 'Public' : 'Private'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleVisibilityMutation.mutate({
                          donationId: donation.id,
                          isPublic: donation.is_public
                        })}
                        className="text-blue-600 hover:bg-blue-50"
                        title={donation.is_public ? 'Make Anonymous' : 'Make Public'}
                      >
                        {donation.is_public ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}