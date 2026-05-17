import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/api/base44Client";
import { Loader2, UserPlus, Lock, User, Smartphone, CreditCard, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    phone_number: "",
    cnic: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Create user + auto-login
      await db.auth.register({
        username: formData.username,
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        cnic: formData.cnic,
        password: formData.password,
      });
      
      toast({
        title: "Registration Successful",
        description: "Welcome to My64 Village Connect!",
      });
      navigate("/Feed");
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.data?.error || "Could not complete registration. Please check your details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4 py-12">
      <Card className="w-full max-w-lg p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
        <div className="text-center mb-8">
          <img src="/assets/logo.png" alt="My64 Logo" className="h-24 w-auto mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-blue-600" />
                <Input id="full_name" placeholder="John Doe" value={formData.full_name} onChange={handleChange} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative group">
                <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-blue-600" />
                <Input id="username" placeholder="johndoe123" value={formData.username} onChange={handleChange} className="pl-10" required />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">WhatsApp / Phone</Label>
              <div className="relative group">
                <Smartphone className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-blue-600" />
                <Input id="phone_number" placeholder="03XXXXXXXXX" value={formData.phone_number} onChange={handleChange} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnic">CNIC Number</Label>
              <div className="relative group">
                <Shield className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-blue-600" />
                <Input id="cnic" placeholder="XXXXX-XXXXXXX-X" value={formData.cnic} onChange={handleChange} className="pl-10" required />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-blue-600" />
              <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className="pl-10" required />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg mt-4"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Register Account"}
          </Button>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/Login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
