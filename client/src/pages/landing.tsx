import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, Clock, Users, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-xl flex items-center justify-center mb-6">
            <Utensils className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Order Management</h1>
          <p className="mt-2 text-gray-600">Sign in to manage your restaurant orders</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-700">Real-time order tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-700">Multi-restaurant support</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-700">Secure access control</span>
              </div>
            </div>

            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full"
              size="lg"
            >
              Sign In to Dashboard
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Secure authentication powered by your organization
          </p>
        </div>
      </div>
    </div>
  );
}
