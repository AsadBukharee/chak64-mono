import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/api/base44Client";
import { 
  Heart, Users, Vote, Sparkles, ArrowRight, Shield, Globe, 
  MessageSquare, Trophy, ChevronLeft, ChevronRight, Sun, Cloud, 
  CloudRain, Wind, Thermometer, Star, BookOpen, MapPin, Clock, BadgeCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Post of the Day ────────────────────────────────
function PostOfTheDay() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Mock data — in production, fetch from /api/posts/post-of-the-day/
  const postOfTheDay = {
    title: "New Community Well Completed!",
    content: "After 3 months of collective effort, the village's new clean water well is now operational. Over 200 families now have access to safe drinking water.",
    keywords: ["Community", "Clean Water", "Development", "Welfare"],
    media: [
      { type: "image", url: "https://images.unsplash.com/photo-1594398901394-4e34939a02eb?w=600&h=400&fit=crop", caption: "The completed well" },
      { type: "image", url: "https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=600&h=400&fit=crop", caption: "Inauguration ceremony" },
      { type: "image", url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop", caption: "Community celebration" },
    ],
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % postOfTheDay.media.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 text-white h-full flex flex-col justify-between shadow-2xl">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -z-10" />

      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Post of the Day</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Chak 64 JB
          </div>
        </div>

        <h3 className="text-2xl md:text-3xl font-extrabold mb-4 leading-tight tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          {postOfTheDay.title}
        </h3>
        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 font-light">
          {postOfTheDay.content}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {postOfTheDay.keywords.map((kw, i) => (
            <span key={i} className="px-3 py-1 bg-white/5 backdrop-blur rounded-full text-xs font-medium text-slate-300 border border-white/5">
              #{kw}
            </span>
          ))}
        </div>
      </div>

      {/* Media Carousel Slider */}
      <div className="relative mt-auto">
        <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-lg border border-white/5 relative group">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentSlide}
              src={postOfTheDay.media[currentSlide].url} 
              alt={postOfTheDay.media[currentSlide].caption}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex items-end">
            <p className="text-xs text-slate-200 font-medium">{postOfTheDay.media[currentSlide].caption}</p>
          </div>
        </div>

        {/* Indicator Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {postOfTheDay.media.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-indigo-500 w-6' : 'bg-slate-700 w-1.5'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Advertisements Horizontal Snap Scroll ─────────────────────────────────
function AdvertisementSection() {
  const ads = [
    { id: 1, title: "Khan General Store", description: "Fresh groceries delivered directly to your doorstep", image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=250&fit=crop", color: "from-emerald-500/20 to-teal-500/20", borderColor: "border-emerald-500/30", badgeColor: "bg-emerald-500/10 text-emerald-400" },
    { id: 2, title: "Ahmed Electronics", description: "Latest smart mobile phones, appliances & repairs", image: "https://images.unsplash.com/photo-1468495244123-6c6c332a6a55?w=400&h=250&fit=crop", color: "from-blue-500/20 to-indigo-500/20", borderColor: "border-blue-500/30", badgeColor: "bg-blue-500/10 text-blue-400" },
    { id: 3, title: "Village Clinic", description: "Expert medical consultation & diagnostic services 24/7", image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=250&fit=crop", color: "from-rose-500/20 to-orange-500/20", borderColor: "border-rose-500/30", badgeColor: "bg-rose-500/10 text-rose-400" },
  ];

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Local Directory</span>
          <h2 className="text-2xl font-bold text-slate-900">Featured Sponsors</h2>
        </div>
        <Link to="/AdDetail" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
          All Businesses <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <Link to={`/AdDetail?id=${ad.id}`} key={ad.id} className="block group">
            <div className={`h-full rounded-2xl border ${ad.borderColor} bg-gradient-to-br ${ad.color} overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 p-4 flex flex-col justify-between hover:-translate-y-1`}>
              <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 relative">
                <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${ad.badgeColor} backdrop-blur-md border border-white/10`}>SPONSORED</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base mb-1">{ad.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-light">{ad.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Weather Smart Widget ────────────────────────────────
function WeatherSection() {
  const weatherData = [
    { day: "Mon", icon: Sun, temp: "32°", desc: "Sunny", color: "text-yellow-500 fill-yellow-500" },
    { day: "Tue", icon: Sun, temp: "34°", desc: "Clear", color: "text-yellow-500 fill-yellow-500" },
    { day: "Wed", icon: Cloud, temp: "29°", desc: "Cloudy", color: "text-indigo-400" },
    { day: "Thu", icon: CloudRain, temp: "25°", desc: "Rainy", color: "text-blue-500" },
    { day: "Fri", icon: CloudRain, temp: "24°", desc: "Showers", color: "text-blue-500" },
    { day: "Sat", icon: Cloud, temp: "28°", desc: "Overcast", color: "text-slate-400" },
    { day: "Sun", icon: Sun, temp: "31°", desc: "Sunny", color: "text-yellow-500 fill-yellow-500" },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 text-white h-full flex flex-col justify-between shadow-2xl relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold">Chak 64 Weather</h2>
          </div>
          <span className="text-xs text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Pakistan</span>
        </div>

        {/* Current Info Widget */}
        <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/5 mb-6">
          <Sun className="w-12 h-12 text-yellow-400 animate-spin-slow fill-yellow-400" />
          <div>
            <div className="text-3xl font-extrabold">34°C</div>
            <div className="text-xs text-slate-400">Clear Sky • Feels like 36°</div>
          </div>
        </div>
      </div>

      {/* Week overview */}
      <div className="grid grid-cols-7 gap-1">
        {weatherData.map((w, i) => (
          <div key={i} className="text-center p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <span className="text-[10px] text-slate-400 uppercase font-medium block mb-1">{w.day}</span>
            <w.icon className={`w-6 h-6 mx-auto mb-1.5 ${w.color}`} />
            <span className="text-xs font-bold block text-slate-100">{w.temp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top Campaigns Circular Progress Cards ──────────────────────────────────
function TopCampaigns() {
  const { data: campaigns = [] } = useQuery({
    queryKey: ['topCampaigns'],
    queryFn: async () => {
      try {
        const all = await db.entities.Campaign.list('-created_date');
        return all.slice(0, 3);
      } catch { return []; }
    }
  });

  const mockCampaigns = campaigns.length > 0 ? campaigns : [
    { id: 1, title: "School Renovation Fund", description: "Renovating the village primary school building with modern tools", target_amount: 500000, collected_amount: 320000 },
    { id: 2, title: "Road Repair Campaign", description: "Fixing the main village entry road for smooth access", target_amount: 300000, collected_amount: 180000 },
    { id: 3, title: "Mosque Construction", description: "Expanding the central Jama Masjid prayer halls", target_amount: 1000000, collected_amount: 750000 },
  ];

  return (
    <section className="py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Active Projects</span>
          <h2 className="text-3xl font-extrabold text-slate-900">Top Social Welfare Campaigns</h2>
        </div>
        <Link to="/Campaigns" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
          Explore All <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {mockCampaigns.map((c, i) => {
          const progress = Math.round((Number(c.collected_amount) / Number(c.target_amount)) * 100);
          return (
            <Link to={`/CampaignDetails?id=${c.id}`} key={i} className="block group">
              <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between relative overflow-hidden group-hover:-translate-y-1">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Top Priority</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 leading-snug">{c.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 font-light">{c.description}</p>
                </div>

                <div>
                  {/* Neon Linear Progress */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div className="text-slate-400">
                      Collected: <strong className="text-slate-900 font-bold">PKR {Number(c.collected_amount).toLocaleString()}</strong>
                    </div>
                    <div className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 font-bold">
                      {progress}%
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ─── Personalities Avatar Strip ──────────────────────────────────
function PersonalitiesSection() {
  const personalities = [
    { name: "Haji Mohammad Aslam", designation: "Village Elder & Philanthropist", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&facepad=2", is_verified: true },
    { name: "Dr. Fatima Bibi", designation: "First Female Doctor from Village", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&facepad=2", is_verified: true },
    { name: "Prof. Khalid Mehmood", designation: "Renowned Educationalist", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&facepad=2", is_verified: true },
    { name: "Ustad Ghulam Hussain", designation: "Master Craftsman & Artisan", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&facepad=2", is_verified: false },
  ];

  return (
    <section className="py-16 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-8">
        <Star className="w-6 h-6 text-indigo-600" />
        <h2 className="text-3xl font-extrabold text-slate-900">Village Pillars & Leaders</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {personalities.map((p, i) => (
          <div key={i} className="text-center group bg-white border border-slate-100 p-6 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 ring-4 ring-indigo-50 group-hover:ring-indigo-300 transition-all shadow-md relative">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <h3 className="font-bold text-slate-950 text-base">{p.name}</h3>
              {p.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
            </div>
            <p className="text-xs text-slate-500 font-light">{p.designation}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Village History Sleek Timeline ────────────────────────────────
function VillageHistorySection() {
  const history = [
    { year: "1901", title: "Foundation", content: "Chak 64 was established during the British colonial era as part of the canal colony settlements in Punjab." },
    { year: "1947", title: "Independence Era", content: "After the partition of India in 1947, the village became part of Pakistan and saw a wave of migration and resettlement." },
    { year: "1975", title: "First School", content: "The first government primary school was established, marking the beginning of formal education in the village." },
    { year: "2020", title: "Digital Age", content: "The village embraced technology with the launch of My64 Village Connect, bringing the community into the digital era." },
  ];

  return (
    <section className="py-16 bg-slate-950 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden border border-slate-900 shadow-2xl">
      {/* Glowing mesh */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-500/10 to-transparent blur-3xl -z-10" />

      <div className="flex items-center gap-2 mb-12">
        <BookOpen className="w-6 h-6 text-indigo-400" />
        <h2 className="text-3xl font-extrabold">Chronicles of Chak 64</h2>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-4 md:ml-6 pl-6 space-y-12">
        {history.map((h, i) => (
          <div key={i} className="relative group">
            {/* Timeline dot */}
            <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full bg-slate-900 border-2 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] group-hover:scale-125 transition-transform duration-300" />

            <div className="max-w-2xl bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300">
              <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase block mb-1">{h.year}</span>
              <h3 className="text-xl font-bold text-white mb-2">{h.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">{h.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Main Home Component ────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      
      {/* Premium Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Animated colorful radial mesh backgrounds */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-200/50 rounded-full blur-3xl -z-10 animate-pulse-slow" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-pink-100/50 rounded-full blur-3xl -z-10 animate-pulse-slow delay-1000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Mini tag */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 mb-6 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen Community Network
            </span>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-950 mb-6 leading-tight">
              Connect Your <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">Village</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-10 font-light leading-relaxed">
              My64 Village Connect bridges digital technology with community welfare. Empowering social connections, transparent donations, and joint progress in Chak 64.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-base font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]" asChild>
                <Link to="/Feed">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 border-slate-200 text-slate-700 rounded-2xl text-base font-semibold hover:bg-slate-100 bg-white transition-all" asChild>
                <Link to="/About">Learn More</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid layout containing PostOfTheDay, Weather & Advertisements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          
          {/* Post of the Day (Bento size 2 cols) */}
          <div className="md:col-span-2">
            <PostOfTheDay />
          </div>

          {/* Weather Widget */}
          <div className="md:col-span-1">
            <WeatherSection />
          </div>

          {/* Advertisement Strip (Bento size 3 cols full width) */}
          <div className="md:col-span-3 mt-4">
            <AdvertisementSection />
          </div>

        </div>
      </section>

      {/* Top Campaigns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <TopCampaigns />
      </div>

      {/* Personalities */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <PersonalitiesSection />
      </div>

      {/* Village History */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <VillageHistorySection />
      </div>

      {/* Ultimate Call to Action Banner */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-[2.5rem] p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl border border-indigo-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent -z-10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">Build a Smarter Village, Together</h2>
            <p className="text-slate-300 text-base md:text-lg mb-8 max-w-xl mx-auto font-light leading-relaxed">
              Every small action, vote, donation or volunteer shift drives a collective wave of positive change. Sign in now to explore.
            </p>
            <Button size="lg" className="h-14 px-10 bg-white text-indigo-950 hover:bg-slate-100 rounded-2xl text-base font-semibold shadow-xl transition-all hover:scale-[1.02]" asChild>
              <Link to="/Login">Join Community Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 font-bold text-lg">
             <Globe className="w-5 h-5 text-indigo-600" />
             <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent font-extrabold tracking-wide">My64 Village Connect</span>
          </div>
          <p className="text-slate-400 text-xs font-light">© 2026 My64 Village Connect Project. All Rights Reserved. Empowering Pakistani Villages.</p>
        </div>
      </footer>
    </div>
  );
}