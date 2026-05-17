const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Loader2, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Campaigns() {
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => db.entities.Campaign.filter({ is_active: true }, '-created_date'),
  });

  return (
    <div className="min-h-screen py-4 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Active Campaigns</h1>
              <p className="text-gray-600">Support causes that matter to our village</p>
            </div>
          </div>
        </Card>

        {/* Campaigns Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="bg-white p-12 text-center shadow-sm border border-gray-200 rounded-xl">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No active campaigns at the moment</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignCard({ campaign }) {
  const progress = (campaign.collected_amount / campaign.target_amount) * 100;
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <Link to={createPageUrl(`CampaignDetails?id=${campaign.id}`)}>
      <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group cursor-pointer h-full flex flex-col">
        {/* Campaign Media */}
        {campaign.media_url && (
          <div className="relative h-48 overflow-hidden bg-gray-100">
            {campaign.media_type === 'image' ? (
              <img 
                src={campaign.media_url} 
                alt={campaign.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : campaign.media_type === 'video' ? (
              <video 
                src={campaign.media_url}
                className="w-full h-full object-cover"
                muted
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-lg">
              <span className="text-sm font-semibold text-gray-900">{campaign.campaign_id}</span>
            </div>
          </div>
        )}

        {/* Campaign Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {campaign.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
            {campaign.description}
          </p>

          {/* Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-900 font-semibold">
                ${campaign.collected_amount?.toLocaleString() || 0}
              </span>
              <span className="text-gray-500">
                of ${campaign.target_amount?.toLocaleString()}
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-100" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{progress.toFixed(0)}% funded</span>
              <span>{daysLeft} days left</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(campaign.start_date).toLocaleDateString()}</span>
            </div>
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              View <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}