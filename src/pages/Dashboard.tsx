import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/images/hConnect-logo3.png";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Hebron Connect" className="w-10 h-10 object-contain" />
            <h1 className="text-xl font-semibold text-[#1e40af]">Hebron Connect</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="rounded-full"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="text-center mb-8">
            {user?.profile_image_thumbnail ? (
              <img
                src={user.profile_image_thumbnail}
                alt={`${user.first_name} ${user.last_name}`}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-[#1e40af]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-[#1e40af] flex items-center justify-center text-white text-3xl font-bold">
                {user?.first_name?.charAt(0)}
                {user?.last_name?.charAt(0)}
              </div>
            )}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user?.first_name} {user?.last_name}!
            </h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-gray-600">{user?.phone}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Account Status
              </h3>
              <p className="text-gray-600">
                {user?.is_verified ? (
                  <span className="text-green-600 font-medium">✓ Verified</span>
                ) : (
                  <span className="text-orange-600 font-medium">Pending Verification</span>
                )}
              </p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Member Since
              </h3>
              <p className="text-gray-600">
                {new Date(user?.created_at || "").toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              🎉 You're all set!
            </h3>
            <p className="text-gray-700">
              Your Hebron Connect account is ready. You can now manage your organization,
              connect with members, and track contributions all in one place.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

