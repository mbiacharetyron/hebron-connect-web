import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Menu,
  Settings,
  FolderOpen,
  Calendar,
  Bell,
  DollarSign,
  Home,
  ChevronRight,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { connectRoomsApi, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import FeedItemCard from "@/components/FeedItemCard";

interface Room {
  id: number;
  name: string;
  description: string;
  room_image_thumbnail: string | null;
  member_count: number;
  category: {
    name: string;
  };
}

interface FeedItem {
  type: "event" | "announcement" | "contribution";
  id: number;
  title: string;
  description?: string;
  [key: string]: any;
}

const RoomDashboard = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "event" | "announcement" | "contribution">("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (roomId) {
      fetchAllRooms();
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      fetchFeed();
    }
  }, [roomId, filterType]);

  const fetchFeed = async () => {
    try {
      const type = filterType === "all" ? undefined : filterType;
      const response = await connectRoomsApi.getRoomFeed(Number(roomId), type);
      setFeed(response.feed || []);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load feed. Please try again.",
        });
      }
      setFeed([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRooms = async () => {
    try {
      const response = await connectRoomsApi.getMyRooms({ per_page: 50 });
      setRooms(response.rooms || []);
      
      // Find and set the current room from the list
      const currentRoom = response.rooms?.find(r => r.id === Number(roomId));
      if (currentRoom) {
        setRoom(currentRoom);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms([]); // Set empty array on error
    }
  };

  const handleRoomSwitch = (newRoomId: number) => {
    navigate(`/room/${newRoomId}`);
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Hebron Connect</h2>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">Connect & Collaborate</p>
      </div>

      {/* Search Rooms */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search connect rooms..."
          className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent"
        />
      </div>

      {/* Connect Rooms List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Connect Rooms
          </h3>
          <div className="space-y-2">
            {rooms?.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRoomSwitch(r.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  r.id === Number(roomId)
                    ? "bg-[#1e40af] text-white shadow-md"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {r.room_image_thumbnail ? (
                    <img
                      src={r.room_image_thumbnail}
                      alt={r.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className={`w-5 h-5 ${r.id === Number(roomId) ? "text-white" : "text-blue-600"}`} />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{r.name}</p>
                  <p className={`text-xs ${r.id === Number(roomId) ? "text-blue-100" : "text-gray-500"}`}>
                    {r.category.name}
                  </p>
                </div>
                {r.id === Number(roomId) && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-all">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Home className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium flex-1 text-left">Create Connect Room</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-all">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-medium flex-1 text-left">Join Connect Room</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );

  if (!room && !loading) {
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 border-r border-gray-200 bg-white sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] text-white shadow-lg sticky top-0 z-40">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 lg:hidden"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                </Sheet>
                
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden">
                  {room?.room_image_thumbnail ? (
                    <img
                      src={room.room_image_thumbnail}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-6 h-6" />
                  )}
                </div>
                
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold line-clamp-1">
                    {room?.name || "Loading..."}
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-100">
                    {room?.category.name}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Document Banner */}
        <div className="px-4 sm:px-6 py-4">
          <div className="bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Documents</h3>
                  <p className="text-blue-100 text-sm">
                    Find here the archives of your Connect-Room to stay updated
                  </p>
                </div>
              </div>
              <Button className="bg-white text-[#1e40af] hover:bg-blue-50 rounded-xl font-medium flex-shrink-0 ml-4 shadow-sm">
                View Docs <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Feed Filter Tabs */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                filterType === "all"
                  ? "bg-[#1e40af] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Updates
            </button>
            <button
              onClick={() => setFilterType("event")}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
                filterType === "event"
                  ? "bg-[#1e40af] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Calendar className={`w-4 h-4 ${filterType === "event" ? "text-white" : "text-gray-700"}`} />
              Events
            </button>
            <button
              onClick={() => setFilterType("announcement")}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
                filterType === "announcement"
                  ? "bg-[#1e40af] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Bell className={`w-4 h-4 ${filterType === "announcement" ? "text-white" : "text-gray-700"}`} />
              Announcements
            </button>
            <button
              onClick={() => setFilterType("contribution")}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
                filterType === "contribution"
                  ? "bg-[#1e40af] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <DollarSign className={`w-4 h-4 ${filterType === "contribution" ? "text-white" : "text-gray-700"}`} />
              Contributions
            </button>
          </div>
        </div>

        {/* Feed Content */}
        <main className="flex-1 px-4 sm:px-6 py-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e40af]"></div>
            </div>
          ) : feed.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Updates Yet</h3>
              <p className="text-gray-600">
                There are no {filterType !== "all" ? filterType + "s" : "updates"} in this room yet
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {feed?.map((item) => (
                <FeedItemCard key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RoomDashboard;

