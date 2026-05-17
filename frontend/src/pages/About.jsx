import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Users, Trophy, Vote, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function About() {
  const features = [
    {
      icon: Users,
      title: "Social Connection",
      description: "Connect with your neighbors through posts, comments, and community discussions.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Vote,
      title: "Community Polls",
      description: "Participate in village decision-making through democratic polls and voting.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Sparkles,
      title: "Campaign Support",
      description: "Contribute to village development through transparent fundraising campaigns.",
      color: "from-pink-500 to-purple-500",
    },
    {
      icon: Heart,
      title: "Charitable Giving",
      description: "Support those in need through targeted donations for zakat, medical, and more.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Trophy,
      title: "Sponsor Funds",
      description: "Sponsor essential village services like education and mosque maintenance.",
      color: "from-orange-500 to-yellow-500",
    },
  ];

  return (
    <div className="min-h-screen py-4 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <Card className="bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-12 shadow-lg border-0 rounded-xl mb-6 text-center">
          <div className="inline-block p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to My64
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            A digital home for our village community, bringing neighbors together 
            through social connection, democratic participation, and collaborative development.
          </p>
        </Card>

        {/* Mission Statement */}
        <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Info className="w-6 h-6 text-blue-600" />
            Our Mission
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            My64 is more than just a social platform – it's a movement to strengthen our 
            village bonds and create a thriving, self-sufficient community. We believe that 
            when neighbors connect, communicate, and collaborate, incredible things happen. 
            Our platform empowers every villager to have a voice, support each other, and 
            work together towards a brighter future.
          </p>
        </Card>

        {/* Features Grid */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl hover:shadow-md transition-all"
                >
                  <div className={`inline-block p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Create Your Profile</h3>
                <p className="text-gray-600">
                  Sign up with your CNIC and phone number to become part of our verified village community.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Connect & Share</h3>
                <p className="text-gray-600">
                  Post updates, share news, and engage with your neighbors through comments and discussions.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Participate & Vote</h3>
                <p className="text-gray-600">
                  Have your say in village decisions through community polls and democratic voting.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Give & Support</h3>
                <p className="text-gray-600">
                  Contribute to campaigns, make charitable donations, or sponsor village services.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Values */}
        <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2">Unity</h3>
              <p className="text-gray-600 text-sm">
                Together, we're stronger. Every voice matters in building our community.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-3">
                <Info className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2">Transparency</h3>
              <p className="text-gray-600 text-sm">
                Open, honest communication builds trust and accountability.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2">Compassion</h3>
              <p className="text-gray-600 text-sm">
                Supporting each other in times of need strengthens our bonds.
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 p-12 shadow-lg border-0 rounded-xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Involved?
          </h2>
          <p className="text-white/90 mb-6 text-lg">
            Join your neighbors in building a better My64 village
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to={createPageUrl("Feed")}>
              <Button className="bg-white text-blue-600 hover:bg-gray-100 rounded-lg px-8 h-12 font-semibold">
                <Users className="w-5 h-5 mr-2" />
                Join the Community
              </Button>
            </Link>
            <Link to={createPageUrl("Campaigns")}>
              <Button className="bg-white/20 text-white hover:bg-white/30 rounded-lg px-8 h-12 font-semibold border border-white/30">
                <Sparkles className="w-5 h-5 mr-2" />
                View Campaigns
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}