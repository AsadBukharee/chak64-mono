import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/api/base44Client";
import { Loader2, ShieldCheck, Lock, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { checkAppState } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const returnUrl = searchParams.get("returnUrl") || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    try {
      await db.auth.login(username, password);
      await checkAppState(); // Refresh auth state in context
      toast({
        title: "Login Successful",
        description: "Welcome back to My64 Village Connect!",
      });
      navigate(returnUrl);
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.data?.error || "Invalid username or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <Card className="w-full max-w-md p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
        <div className="text-center mb-8">
          <img src="/assets/logo.png" alt="My64 Logo" className="h-24 w-auto mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
            <div className="relative group">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" title="Enter your password"  className="text-sm font-medium text-gray-700">Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/Register" className="text-purple-600 font-bold hover:underline">Register</Link>
            </p>
          </div>
        </form>
      </Card>
      
      {/* Decorative blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl -z-10 animate-pulse opacity-70"></div>
    </div>
  );
}
