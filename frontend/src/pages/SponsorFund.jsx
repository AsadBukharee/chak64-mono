const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Loader2, CheckCircle2, GraduationCap, Users, Droplets, BookOpen, Building2, HeartPulse, Star, Landmark, Lightbulb } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function SponsorFund() {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [fundType, setFundType] = useState("");
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [accountNumber, setAccountNumber] = useState("PK12WXYZ0000009876543210");
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const { data: fundTypes = [] } = useQuery({
    queryKey: ['fundTypes'],
    queryFn: () => db.entities.FundType.list(),
  });

  const donateMutation = useMutation({
    mutationFn: (donationData) => db.entities.Donation.create(donationData),
    onSuccess: () => {
      queryClient.invalidateQueries(['donations']);
      setAmount("");
      setFundType("");
      setLocation("");
      setIsPublic(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleDonate = async () => {
    if (!amount || !fundType || parseFloat(amount) <= 0) return;

    await donateMutation.mutateAsync({
      donor_name: user.full_name,
      donor_email: user.email,
      amount: parseFloat(amount),
      donation_type: 'sponsor_fund',
      fund_type: fundType,
      is_public: isPublic,
      location: location,
      account_number: accountNumber,
    });
  };

  return (
    <div className="min-h-screen py-4 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sponsor Fund</h1>
              <p className="text-gray-600">Support village development initiatives</p>
            </div>
          </div>
        </Card>

        {/* Success Message */}
        {showSuccess && (
          <Card className="bg-green-50 p-4 border border-green-200 rounded-xl mb-4">
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Thank you for sponsoring! Your contribution has been recorded.</span>
            </div>
          </Card>
        )}

        {/* Fund Types Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { icon: BookOpen, color: "bg-cyan-100 text-cyan-600", name: "Education", desc: "School fees & scholarships" },
            { icon: Droplets, color: "bg-blue-100 text-blue-600", name: "Water Filter", desc: "Clean water access" },
            { icon: Users, color: "bg-purple-100 text-purple-600", name: "Imam Masjid Fund", desc: "Religious services" },
            { icon: Landmark, color: "bg-emerald-100 text-emerald-600", name: "Masjid Fund", desc: "Mosque construction" },
            { icon: Building2, color: "bg-orange-100 text-orange-600", name: "Home Building", desc: "Housing support" },
            { icon: HeartPulse, color: "bg-red-100 text-red-600", name: "Health", desc: "Medical treatment" },
            { icon: Star, color: "bg-pink-100 text-pink-600", name: "Girls Marriage", desc: "Marriage support" },
            { icon: Lightbulb, color: "bg-yellow-100 text-yellow-600", name: "Village Development", desc: "Roads & street lights" },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.name} className="bg-white p-4 shadow-sm border border-gray-200 rounded-xl">
                <div className={`p-2 rounded-lg ${f.color} inline-flex mb-2`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-gray-900 font-semibold text-sm leading-tight">{f.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{f.desc}</p>
              </Card>
            );
          })}
        </div>

        {/* Sponsor Form */}
        <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl">
          <div className="space-y-6">
            {/* Account Information */}
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <h3 className="text-gray-900 font-semibold mb-4">Sponsor Fund Account Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Account Number:</span>
                  <span className="text-gray-900 font-mono font-medium">{accountNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Account Name:</span>
                  <span className="text-gray-900 font-medium">My64 Sponsor Fund</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Bank:</span>
                  <span className="text-gray-900 font-medium">Village Bank</span>
                </div>
              </div>
            </div>

            {/* Sponsor Amount */}
            <div>
              <Label htmlFor="amount" className="text-gray-700 mb-2 block">
                Sponsorship Amount ($)
              </Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-lg h-12"
              />
            </div>

            {/* Fund Type */}
            <div>
              <Label htmlFor="fundType" className="text-gray-700 mb-2 block">
                Select Fund Type
              </Label>
              <Select value={fundType} onValueChange={setFundType}>
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg h-12">
                  <SelectValue placeholder="Choose a fund" />
                </SelectTrigger>
                <SelectContent>
                  {fundTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                  {fundTypes.length === 0 && (
                    <>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Water Filter">Water Filter</SelectItem>
                      <SelectItem value="Imam Masjid Fund">Imam Masjid Fund</SelectItem>
                      <SelectItem value="Masjid Fund">Masjid Fund</SelectItem>
                      <SelectItem value="Home Building">Home Building</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Girls Marriage">Girls Marriage</SelectItem>
                      <SelectItem value="Village Development">Village Development</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-gray-700 mb-2 block">
                Your Location (Optional)
              </Label>
              <Input
                id="location"
                placeholder="Enter your location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg h-12"
              />
            </div>

            {/* Public/Private */}
            <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <Checkbox
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <label
                htmlFor="public"
                className="text-sm text-gray-700 cursor-pointer flex-1"
              >
                Make my sponsorship information public (name and location visible)
              </label>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleDonate}
              disabled={!amount || !fundType || parseFloat(amount) <= 0 || donateMutation.isPending}
              className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white rounded-lg h-14 text-lg"
            >
              {donateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing Sponsorship...
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  Submit Sponsorship
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              After making the payment, please submit this form to record your sponsorship.
              Your support helps maintain essential village services.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}