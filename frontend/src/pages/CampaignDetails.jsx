const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Users, ArrowLeft, Heart, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Checkbox } from "@/components/ui/checkbox";

export default function CampaignDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [donationAmount, setDonationAmount] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [location, setLocation] = useState("");

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const campaigns = await db.entities.Campaign.filter({ id: campaignId });
      return campaigns[0];
    },
    enabled: !!campaignId,
  });

  const { data: donations = [] } = useQuery({
    queryKey: ['campaignDonations', campaignId],
    queryFn: () => db.entities.Donation.filter({ campaign_id: campaignId, donation_type: 'campaign' }, '-created_date'),
    enabled: !!campaignId,
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const donateMutation = useMutation({
    mutationFn: async (donationData) => {
      await db.entities.Donation.create(donationData);
      await db.entities.Campaign.update(campaign.id, {
        collected_amount: (campaign.collected_amount || 0) + parseFloat(donationAmount)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaign', campaignId]);
      queryClient.invalidateQueries(['campaignDonations', campaignId]);
      setDonationAmount("");
      setLocation("");
    },
  });

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) return;

    await donateMutation.mutateAsync({
      donor_name: user.full_name,
      donor_email: user.email,
      amount: parseFloat(donationAmount),
      donation_type: 'campaign',
      campaign_id: campaign.id,
      is_public: isPublic,
      location: location,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Campaign not found</p>
      </div>
    );
  }

  const progress = (campaign.collected_amount / campaign.target_amount) * 100;
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen py-4 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link to={createPageUrl("Campaigns")}>
          <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 mb-4 rounded-lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Campaign Header */}
            <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                  <span className="text-blue-700 font-semibold">{campaign.campaign_id}</span>
                </div>
                <div className="bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
                  <span className="text-orange-700 font-medium text-sm">{daysLeft} days left</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {campaign.title}
              </h1>

              {/* Media */}
              {campaign.media_url && (
                <div className="rounded-lg overflow-hidden mb-6 border border-gray-200">
                  {campaign.media_type === 'image' ? (
                    <img 
                      src={campaign.media_url} 
                      alt={campaign.title}
                      className="w-full h-96 object-cover"
                    />
                  ) : campaign.media_type === 'video' ? (
                    <video 
                      src={campaign.media_url}
                      className="w-full h-96 object-cover"
                      controls
                    />
                  ) : null}
                </div>
              )}

              {/* Progress */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      ${campaign.collected_amount?.toLocaleString() || 0}
                    </div>
                    <div className="text-gray-600 text-sm">
                      raised of ${campaign.target_amount?.toLocaleString()} goal
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {donations.length}
                    </div>
                    <div className="text-gray-600 text-sm">donors</div>
                  </div>
                </div>
                <Progress value={progress} className="h-3 bg-gray-100" />
              </div>

              {/* Description */}
              <div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {campaign.description}
                </p>
              </div>

              {/* Campaign Dates */}
              <div className="flex gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Started: {new Date(campaign.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Ends: {new Date(campaign.end_date).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>

            {/* Donors List */}
            <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recent Donors ({donations.length})
              </h2>
              <div className="space-y-3">
                {donations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Be the first to donate!</p>
                ) : (
                  donations.map((donation) => (
                    <div key={donation.id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {donation.is_public ? donation.donor_name[0].toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="text-gray-900 font-medium">
                            {donation.is_public ? donation.donor_name : 'Anonymous'}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {new Date(donation.created_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 font-bold text-lg">
                          ${donation.amount.toLocaleString()}
                        </div>
                        {donation.location && donation.is_public && (
                          <div className="text-gray-500 text-xs">{donation.location}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Donation Form */}
          <div className="lg:col-span-1">
            <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Make a Donation
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-gray-700 mb-2 block">
                    Donation Amount ($)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter amount"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-gray-700 mb-2 block">
                    Location (Optional)
                  </Label>
                  <Input
                    id="location"
                    placeholder="Your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>

                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <Checkbox
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <label
                    htmlFor="public"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Make my donation public
                  </label>
                </div>

                <Button
                  onClick={handleDonate}
                  disabled={!donationAmount || parseFloat(donationAmount) <= 0 || donateMutation.isPending}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg h-12"
                >
                  {donateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Donate Now
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Your donation helps our village community thrive
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}