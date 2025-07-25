import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Utensils, LogOut, User } from "lucide-react";
import type { Restaurant } from "@shared/schema";

interface TopNavigationProps {
  restaurant?: Restaurant;
}

export default function TopNavigation({ restaurant }: TopNavigationProps) {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Utensils className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {restaurant?.name || "Loading..."}
              </h1>
              <p className="text-xs text-gray-500">Order Management Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Real-time indicator */}
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">Live</span>
            </div>
            
            {/* User info */}
            <div className="flex items-center space-x-2 text-gray-700 px-3 py-2 rounded-lg">
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user?.email || "User"}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
