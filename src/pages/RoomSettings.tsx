import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  UserCog,
  Users,
  HelpCircle,
  Wallet,
  ChevronRight,
  RefreshCw,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectRoomsApi, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Room {
  id: number;
  name: string;
  description: string;
  room_image_thumbnail: string | null;
  member_count: number;
  user_role: "owner" | "admin" | "member";
  category: {
    name: string;
  };
}

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  joined_at: string;
}

const RoomSettings = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminOrOwner, setIsAdminOrOwner] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRoomDetails = async () => {
    try {
      const response = await connectRoomsApi.getMyRooms({ per_page: 50 });
      const currentRoom = response.rooms?.find((r) => r.id === Number(roomId));
      if (currentRoom) {
        setRoom(currentRoom);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async () => {
    if (!roomId || !user) return;
    
    try {
      const response = await connectRoomsApi.getRoomMembers(Number(roomId));
      const members = response.members as Member[] || [];
      
      // Find current user in members list by ID or email
      const currentUserMember = members.find((member: Member) => 
        member.id === user.id || member.email === user.email
      );
      
      if (currentUserMember) {
        const role = currentUserMember.role?.toLowerCase();
        setIsAdminOrOwner(role === 'admin' || role === 'owner');
      } else {
        setIsAdminOrOwner(false);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      setIsAdminOrOwner(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
      checkUserRole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleRefresh = () => {
    setLoading(true);
    fetchRoomDetails();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e40af]"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Room not found</h2>
          <Button onClick={() => navigate("/rooms")} className="mt-4">
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }

  // Redirect if user doesn't have admin access
  if (!isAdminOrOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access room settings. Only room admins and owners can manage room settings.
          </p>
          <Button onClick={() => navigate(`/room/${roomId}`)} className="bg-[#1e40af] hover:bg-[#1e3a8a]">
            Back to Room
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate(`/room/${roomId}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold">Room Settings</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Room Info Card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-50">
              {room.room_image_thumbnail ? (
                <img
                  src={room.room_image_thumbnail}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1e40af] mb-2">
                {room.name}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-1">
                {room.description || room.category.name}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 bg-blue-50 hover:bg-blue-100 text-[#1e40af] rounded-xl"
            >
              <Edit className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Room Management Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Room Management
            </h3>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1e40af] transition-colors"
            >
              <span className="hidden sm:inline">Refresh</span>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Manage Activities */}
            <button
              onClick={() => toast({ title: "Coming Soon", description: "This feature is under development" })}
              className="w-full bg-white rounded-2xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <UserCog className="w-6 h-6 sm:w-7 sm:h-7 text-[#1e40af]" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                    Manage Activities
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Manage events, announcements, and contributions
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </button>

            {/* Members */}
            <button
              onClick={() => toast({ title: "Coming Soon", description: "This feature is under development" })}
              className="w-full bg-white rounded-2xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                    Members
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {room.member_count} member{room.member_count !== 1 ? 's' : ''} in this room
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </button>

            {/* Room Questions */}
            <button
              onClick={() => toast({ title: "Coming Soon", description: "This feature is under development" })}
              className="w-full bg-white rounded-2xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                    Room Questions
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Manage questions for join requests
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </button>

            {/* Association Wallet */}
            <button
              onClick={() => toast({ title: "Coming Soon", description: "This feature is under development" })}
              className="w-full bg-white rounded-2xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                    Association Wallet
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Manage the finances of the association
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSettings;

