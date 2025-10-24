import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Home, Users, FolderTree } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { connectRoomsApi, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/images/hConnect-logo3.png";

interface ConnectRoom {
  id: number;
  name: string;
  description: string;
  room_image_thumbnail: string | null;
  member_count: number;
  user_role: string;
  category: {
    id: number;
    name: string;
  };
  last_activity_at: string;
}

const ConnectRooms = () => {
  const [rooms, setRooms] = useState<ConnectRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("last_activity_at");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();
  }, [sortBy]);

  const fetchRooms = async () => {
    try {
      const response = await connectRoomsApi.getMyRooms({
        search: searchTerm || undefined,
        sort_by: sortBy,
        sort_order: 'desc',
        per_page: 50,
      });
      setRooms(response.rooms || []);
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
          description: "Failed to load rooms. Please try again.",
        });
      }
      setRooms([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRooms();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-700";
      case "admin":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 lg:hidden"
                onClick={() => navigate("/dashboard")}
              >
                <Home className="w-5 h-5" />
              </Button>
              <img src={logo} alt="Hebron Connect" className="w-10 h-10 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold">Hebron Connect</h1>
                <p className="text-sm text-blue-100">Connect & Collaborate</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
            >
              Logout
            </Button>
          </div>

          {/* User greeting - mobile */}
          <div className="sm:hidden mb-3">
            <p className="text-sm text-blue-100">Welcome back,</p>
            <p className="font-semibold">{user?.first_name}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Title */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Select a Connect Room
          </h2>
          <p className="text-gray-600 text-lg">
            Choose a room to start connecting
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 h-12 rounded-xl border-gray-200"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40 h-12 rounded-xl border-gray-200">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_activity_at">Recent Activity</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="member_count">Members</SelectItem>
                  <SelectItem value="created_at">Date Created</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleSearch}
                className="h-12 px-6 bg-[#1e40af] hover:bg-[#1e3a8a] rounded-xl"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Rooms Count */}
        {!loading && (
          <div className="mb-4">
            <p className="text-sm font-medium text-blue-700 bg-blue-50 inline-block px-4 py-2 rounded-full">
              {rooms?.length || 0} room{rooms?.length !== 1 ? 's' : ''} available
            </p>
          </div>
        )}

        {/* Rooms Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e40af]"></div>
          </div>
        ) : !rooms || rooms.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <FolderTree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rooms Found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms" : "You haven't joined any connect rooms yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {rooms?.map((room) => (
              <div
                key={room.id}
                onClick={() => navigate(`/room/${room.id}`)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden group border border-transparent hover:border-[#1e40af]/20"
              >
                {/* Room Image */}
                <div className="relative h-32 bg-gradient-to-br from-blue-100 to-blue-50 overflow-hidden">
                  {room.room_image_thumbnail ? (
                    <img
                      src={room.room_image_thumbnail}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-12 h-12 text-blue-300" />
                    </div>
                  )}
                  {/* Role Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${getRoleColor(room.user_role)} shadow-sm capitalize`}>
                      {room.user_role}
                    </span>
                  </div>
                </div>

                {/* Room Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#1e40af] transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {room.description}
                  </p>

                  {/* Room Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">{room.member_count} members</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#1e40af]">
                      <FolderTree className="w-4 h-4" />
                      <span className="text-xs font-medium">{room.category.name}</span>
                    </div>
                  </div>

                  {/* Enter Button */}
                  <Button className="w-full mt-4 bg-[#1e40af] hover:bg-[#1e3a8a] rounded-xl h-11 group-hover:shadow-lg transition-all">
                    Enter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ConnectRooms;

