const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Loader2, CheckCircle2, Trophy, Upload, GraduationCap, Users, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Donate() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("donation");
  
  // Donation fields
  const [donationAmount, setDonationAmount] = useState("");
  const [charityType, setCharityType] = useState("");
  const [donationLocation, setDonationLocation] = useState("");
  const [donationIsPublic, setDonationIsPublic] = useState(false);
  const [donationBankTitle, setDonationBankTitle] = useState("");
  const [donationScreenshot, setDonationScreenshot] = useState(null);
  const [donationScreenshotUrl, setDonationScreenshotUrl] = useState("");
  const [isUploadingDonation, setIsUploadingDonation] = useState(false);

  // Sponsor fields
  const [sponsorAmount, setSponsorAmount] = useState("");
  const [fundType, setFundType] = useState("");
  const [sponsorLocation, setSponsorLocation] = useState("");
  const [sponsorIsPublic, setSponsorIsPublic] = useState(false);
  const [sponsorBankTitle, setSponsorBankTitle] = useState("");
  const [sponsorScreenshot, setSponsorScreenshot] = useState(null);
  const [sponsorScreenshotUrl, setSponsorScreenshotUrl] = useState("");
  const [isUploadingSponsor, setIsUploadingSponsor] = useState(false);

  const [donationAccountNumber] = useState("PK12ABCD0000001234567890");
  const [sponsorAccountNumber] = useState("PK12WXYZ0000009876543210");
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const { data: charityTypes = [] } = useQuery({
    queryKey: ['charityTypes'],
    queryFn: () => db.entities.CharityType.list(),
  });

  const { data: fundTypes = [] } = useQuery({
    queryKey: ['fundTypes'],
    queryFn: () => db.entities.FundType.list(),
  });

  const donateMutation = useMutation({
    mutationFn: (donationData) => db.entities.Donation.create(donationData),
    onSuccess: () => {
      queryClient.invalidateQueries(['donations']);
      if (activeTab === "donation") {
        setDonationAmount("");
        setCharityType("");
        setDonationLocation("");
        setDonationIsPublic(false);
        setDonationBankTitle("");
        setDonationScreenshot(null);
        setDonationScreenshotUrl("");
      } else {
        setSponsorAmount("");
        setFundType("");
        setSponsorLocation("");
        setSponsorIsPublic(false);
        setSponsorBankTitle("");
        setSponsorScreenshot(null);
        setSponsorScreenshotUrl("");
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleDonationScreenshot = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingDonation(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setDonationScreenshotUrl(file_url);
      setDonationScreenshot(file);
    } catch (error) {
      console.error("Error uploading screenshot:", error);
    }
    setIsUploadingDonation(false);
  };

  const handleSponsorScreenshot = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingSponsor(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setSponsorScreenshotUrl(file_url);
      setSponsorScreenshot(file);
    } catch (error) {
      console.error("Error uploading screenshot:", error);
    }
    setIsUploadingSponsor(false);
  };

  const handleDonationSubmit = async () => {
    if (!donationAmount || !charityType || !donationBankTitle || !donationScreenshotUrl || parseFloat(donationAmount) <= 0) return;

    await donateMutation.mutateAsync({
      donor_name: user.full_name,
      donor_email: user.email,
      amount: parseFloat(donationAmount),
      donation_type: 'charity',
      charity_type: charityType,
      is_public: donationIsPublic,
      location: donationLocation,
      account_number: donationAccountNumber,
      bank_title: donationBankTitle,
      transaction_screenshot: donationScreenshotUrl,
    });
  };

  const handleSponsorSubmit = async () => {
    if (!sponsorAmount || !fundType || !sponsorBankTitle || !sponsorScreenshotUrl || parseFloat(sponsorAmount) <= 0) return;

    await donateMutation.mutateAsync({
      donor_name: user.full_name,
      donor_email: user.email,
      amount: parseFloat(sponsorAmount),
      donation_type: 'sponsor_fund',
      fund_type: fundType,
      is_public: sponsorIsPublic,
      location: sponsorLocation,
      account_number: sponsorAccountNumber,
      bank_title: sponsorBankTitle,
      transaction_screenshot: sponsorScreenshotUrl,
    });
  };

  return (
    <div className="min-h-screen py-4 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl mb-4">
          <div className="flex items-center gap-4">
            <img src="/assets/logo.png" alt="My64 Logo" className="h-16 w-auto object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Support My64 Village</h1>
              <p className="text-gray-600">Your generosity makes a difference</p>
            </div>
          </div>
        </Card>

        {/* Success Message */}
        {showSuccess && (
          <Card className="bg-green-50 p-4 border border-green-200 rounded-xl mb-4">
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Thank you! Your contribution has been recorded.</span>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="donation" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Donation
            </TabsTrigger>
            <TabsTrigger value="sponsor" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Sponsor
            </TabsTrigger>
          </TabsList>

          {/* Donation Tab */}
          <TabsContent value="donation">
            <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl">
              <div className="space-y-6">
                {/* Account Information */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-gray-900 font-semibold mb-4">Donation Account Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Account Number:</span>
                      <span className="text-gray-900 font-mono font-medium">{donationAccountNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Account Name:</span>
                      <span className="text-gray-900 font-medium">My64 Village Fund</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Bank:</span>
                      <span className="text-gray-900 font-medium">Village Bank</span>
                    </div>
                  </div>
                </div>

                {/* Donation Amount */}
                <div>
                  <Label htmlFor="donationAmount" className="text-gray-700 mb-2 block">
                    Donation Amount ($) *
                  </Label>
                  <Input
                    id="donationAmount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter amount"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-lg h-12"
                  />
                </div>

                {/* Bank Account Title */}
                <div>
                  <Label htmlFor="donationBankTitle" className="text-gray-700 mb-2 block">
                    Your Bank Account Title *
                  </Label>
                  <Input
                    id="donationBankTitle"
                    placeholder="Enter your bank account title"
                    value={donationBankTitle}
                    onChange={(e) => setDonationBankTitle(e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg h-12"
                  />
                </div>

                {/* Charity Type */}
                <div>
                  <Label htmlFor="charityType" className="text-gray-700 mb-2 block">
                    Purpose of Donation *
                  </Label>
                  <Select value={charityType} onValueChange={setCharityType}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg h-12">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {charityTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                      {charityTypes.length === 0 && (
                        <>
                          <SelectItem value="Zakat">Zakat</SelectItem>
                          <SelectItem value="Marriage of Girl">Marriage of Girl</SelectItem>
                          <SelectItem value="Medical Treatment">Medical Treatment</SelectItem>
                          <SelectItem value="Construction">Construction</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Transaction Screenshot */}
                <div>
                  <Label className="text-gray-700 mb-2 block">
                    Transaction Screenshot *
                  </Label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDonationScreenshot}
                      className="hidden"
                      id="donationScreenshot"
                      disabled={isUploadingDonation}
                    />
                    <label htmlFor="donationScreenshot">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                        {isUploadingDonation ? (
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                        ) : donationScreenshotUrl ? (
                          <div className="relative">
                            <img src={donationScreenshotUrl} alt="Screenshot" className="max-h-40 mx-auto rounded" />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setDonationScreenshotUrl("");
                                setDonationScreenshot(null);
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Click to upload transaction screenshot</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="donationLocation" className="text-gray-700 mb-2 block">
                    Your Location (Optional)
                  </Label>
                  <Input
                    id="donationLocation"
                    placeholder="Enter your location"
                    value={donationLocation}
                    onChange={(e) => setDonationLocation(e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg h-12"
                  />
                </div>

                {/* Public/Private */}
                <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <Checkbox
                    id="donationPublic"
                    checked={donationIsPublic}
                    onCheckedChange={setDonationIsPublic}
                  />
                  <label
                    htmlFor="donationPublic"
                    className="text-sm text-gray-700 cursor-pointer flex-1"
                  >
                    Make my donation information public (name and location visible)
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleDonationSubmit}
                  disabled={!donationAmount || !charityType || !donationBankTitle || !donationScreenshotUrl || parseFloat(donationAmount) <= 0 || donateMutation.isPending}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg h-14 text-lg"
                >
                  {donateMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing Donation...
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      Submit Donation
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  * Required fields. After making the payment, upload the screenshot and submit this form.
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Sponsor Tab */}
          <TabsContent value="sponsor">
            {/* Fund Types Info */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-gray-900 font-semibold">Imam Masjid Fund</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Support our mosque imam and maintain religious services for the community.
                </p>
              </Card>

              <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-cyan-100">
                    <GraduationCap className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h3 className="text-gray-900 font-semibold">Educational Fund</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Help provide quality education and learning resources for village children.
                </p>
              </Card>
            </div>

            <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl">
              <div className="space-y-6">
                {/* Account Information */}
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="text-gray-900 font-semibold mb-4">Sponsor Fund Account Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Account Number:</span>
                      <span className="text-gray-900 font-mono font-medium">{sponsorAccountNumber}</span>
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
                  <Label htmlFor="sponsorAmount" className="text-gray-700 mb-2 block">
                    Sponsorship Amount ($) *
                  </Label>
                  <Input
                    id="sponsorAmount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter amount"
                    value={sponsorAmount}
                    onChange={(e) => setSponsorAmount(e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-lg h-12"
                  />
                </div>

                {/* Bank Account Title */}
                <div>
                  <Label htmlFor="sponsorBankTitle" className="text-gray-700 mb-2 block">
                    Your Bank Account Title *
                  </Label>
                  <Input
                    id="sponsorBankTitle"
                    placeholder="Enter your bank account title"
                    value={sponsorBankTitle}
                    onChange={(e) => setSponsorBankTitle(e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg h-12"
                  />
                </div>

                {/* Fund Type */}
                <div>
                  <Label htmlFor="fundType" className="text-gray-700 mb-2 block">
                    Select Fund Type *
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
                          <SelectItem value="Imam Masjid">Imam Masjid</SelectItem>
                          <SelectItem value="Educational Fund">Educational Fund</SelectItem>
                          <SelectItem value="Appreciate the Team">Appreciate the Team</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Transaction Screenshot */}
                <div>
                  <Label className="text-gray-700 mb-2 block">
                    Transaction Screenshot *
                  </Label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSponsorScreenshot}
                      className="hidden"
                      id="sponsorScreenshot"
                      disabled={isUploadingSponsor}
                    />
                    <label htmlFor="sponsorScreenshot">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500 transition-colors">
                        {isUploadingSponsor ? (
                          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-2" />
                        ) : sponsorScreenshotUrl ? (
                          <div className="relative">
                            <img src={sponsorScreenshotUrl} alt="Screenshot" className="max-h-40 mx-auto rounded" />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setSponsorScreenshotUrl("");
                                setSponsorScreenshot(null);
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Click to upload transaction screenshot</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="sponsorLocation" className="text-gray-700 mb-2 block">
                    Your Location (Optional)
                  </Label>
                  <Input
                    id="sponsorLocation"
                    placeholder="Enter your location"
                    value={sponsorLocation}
                    onChange={(e) => setSponsorLocation(e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg h-12"
                  />
                </div>

                {/* Public/Private */}
                <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <Checkbox
                    id="sponsorPublic"
                    checked={sponsorIsPublic}
                    onCheckedChange={setSponsorIsPublic}
                  />
                  <label
                    htmlFor="sponsorPublic"
                    className="text-sm text-gray-700 cursor-pointer flex-1"
                  >
                    Make my sponsorship information public (name and location visible)
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSponsorSubmit}
                  disabled={!sponsorAmount || !fundType || !sponsorBankTitle || !sponsorScreenshotUrl || parseFloat(sponsorAmount) <= 0 || donateMutation.isPending}
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
                  * Required fields. After making the payment, upload the screenshot and submit this form.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}