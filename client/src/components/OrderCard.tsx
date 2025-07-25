import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Check, CheckCircle, User, Phone, Eye, AlertTriangle, Utensils, Loader2 } from "lucide-react";
import type { Order } from "@shared/schema";
import { format } from "date-fns";

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, status: string) => void;
  isUpdating: boolean;
}

export default function OrderCard({ order, onStatusUpdate, isUpdating }: OrderCardProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "new":
        return {
          badge: <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />New</Badge>,
          color: "border-l-yellow-500",
          bgColor: "bg-yellow-50",
          actions: [{ label: "Confirm", status: "confirmed", icon: Check, variant: "default" as const }]
        };
      case "confirmed":
        return {
          badge: <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Utensils className="h-3 w-3 mr-1" />Confirmed</Badge>,
          color: "border-l-blue-500",
          bgColor: "bg-blue-50",
          actions: [{ label: "Mark Ready", status: "ready", icon: CheckCircle, variant: "default" as const }]
        };
      case "ready":
        return {
          badge: <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>,
          color: "border-l-green-500",
          bgColor: "bg-green-50",
          actions: [{ label: "Complete", status: "completed", icon: CheckCircle, variant: "secondary" as const }]
        };
      case "completed":
        return {
          badge: <Badge variant="secondary" className="bg-gray-100 text-gray-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>,
          color: "border-l-gray-500",
          bgColor: "bg-gray-50",
          actions: []
        };
      default:
        return {
          badge: <Badge variant="secondary">{status}</Badge>,
          color: "border-l-gray-500",
          bgColor: "bg-gray-50",
          actions: []
        };
    }
  };

  const config = getStatusConfig(order.status);
  
  // Check if order is older than 30 minutes and still not confirmed
  const isUrgent = () => {
    const orderTime = new Date(order.createdAt!);
    const now = new Date();
    const diffMinutes = (now.getTime() - orderTime.getTime()) / (1000 * 60);
    return diffMinutes > 30 && order.status === "new";
  };

  const urgent = isUrgent();

  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 ${urgent ? 'border-l-4 border-l-red-500' : `border-l-4 ${config.color}`}`}>
      <CardContent className="p-6">
        {/* Order Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Phone Order</h3>
            <p className="text-sm text-gray-600">{order.customerPhone}</p>
          </div>
          <div className="flex flex-col items-end">
            {urgent ? (
              <Badge variant="destructive" className="bg-red-100 text-red-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            ) : (
              config.badge
            )}
            <span className="text-xs text-gray-500 mt-1">
              {format(new Date(order.createdAt!), 'MMM d, h:mm a')}
            </span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Order Details:</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{order.orderSummary}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {config.actions.map((action) => (
            <Button
              key={action.status}
              variant={action.variant}
              size="sm"
              className="flex-1"
              onClick={() => onStatusUpdate(order.id, action.status)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <action.icon className="h-4 w-4 mr-1" />
              )}
              {action.label}
            </Button>
          ))}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-sm text-gray-900">{order.customerPhone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{order.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Time</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {format(new Date(order.createdAt!), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {format(new Date(order.updatedAt!), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Order Details</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{order.orderSummary}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
