import { Calendar, MapPin, Users, Bell, DollarSign, Clock, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface FeedItemProps {
  item: {
    type: "event" | "announcement" | "contribution";
    id: number;
    title: string;
    description?: string;
    [key: string]: any;
  };
}

const FeedItemCard = ({ item }: FeedItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "XAF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (item.type === "event") {
    return (
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
        {/* Event Header */}
        <div className="relative">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-40 sm:h-48 object-cover"
            />
          ) : (
            <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-blue-300" />
            </div>
          )}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
              Event
            </Badge>
          </div>
        </div>

        {/* Event Content */}
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{item.title}</h3>
          {item.description && (
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">{item.description}</p>
          )}

          {/* Event Details */}
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">
                  {formatDate(item.start_date)}
                  {item.end_date && ` - ${formatDate(item.end_date)}`}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {formatTime(item.start_date)}
                  {item.end_date && ` - ${formatTime(item.end_date)}`}
                </p>
              </div>
            </div>

            {item.location && (
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="flex-1 min-w-0">{item.location}</span>
              </div>
            )}

            {item.rsvp_count !== undefined && (
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <span>
                  {item.rsvp_count} attending
                  {item.max_attendees && ` (${item.max_attendees} max)`}
                </span>
              </div>
            )}
          </div>

          {/* Event Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button className="flex-1 bg-[#1e40af] hover:bg-[#1e3a8a] rounded-xl h-10 sm:h-auto text-sm sm:text-base">
              View Details
            </Button>
            {item.is_virtual && item.meeting_link && (
              <Button variant="outline" className="rounded-xl h-10 sm:h-auto text-sm sm:text-base">
                Join Meeting
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (item.type === "announcement") {
    return (
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-4 sm:p-6 border border-gray-100">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                  <Badge className="bg-orange-600 hover:bg-orange-700 text-white text-xs">
                    Announcement
                  </Badge>
                  {item.is_pinned && (
                    <Badge variant="outline" className="border-orange-600 text-orange-600 text-xs">
                      Pinned
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{item.title}</h3>
              </div>
            </div>

            {item.description && (
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 whitespace-pre-line line-clamp-3 sm:line-clamp-none">{item.description}</p>
            )}

            {/* Announcement Meta */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 pt-3 sm:pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{formatDate(item.created_at)}</span>
              </div>
              {item.views_count !== undefined && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{item.views_count} views</span>
                </div>
              )}
              {item.creator && (
                <div className="w-full sm:w-auto sm:ml-auto">
                  <span className="text-gray-700 font-medium">
                    {item.creator.first_name} {item.creator.last_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === "contribution") {
    const progress = item.total_expected
      ? (parseFloat(item.total_collected) / parseFloat(item.total_expected)) * 100
      : 0;

    return (
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-4 sm:p-6 border border-gray-100">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:justify-between mb-2 sm:mb-3 gap-2">
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <Badge className="bg-green-600 hover:bg-green-700 text-white mb-1.5 sm:mb-2 text-xs">
                  Contribution
                </Badge>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{item.title}</h3>
              </div>
              <div className="text-left sm:text-right sm:ml-4 flex-shrink-0">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {formatCurrency(item.amount, item.currency)}
                </div>
                <div className="text-xs text-gray-500">per member</div>
              </div>
            </div>

            {item.description && (
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">{item.description}</p>
            )}

            {/* Progress Bar */}
            {item.total_expected && (
              <div className="mb-3 sm:mb-4">
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span className="text-gray-700 font-medium">
                    {formatCurrency(item.total_collected, item.currency)} collected
                  </span>
                  <span className="text-gray-500">
                    of {formatCurrency(item.total_expected, item.currency)}
                  </span>
                </div>
                <div className="h-2 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Contribution Details */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-700 mb-4 sm:mb-5">
              {item.deadline && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span className="truncate">
                    Deadline: <span className="font-medium">{formatDate(item.deadline)}</span>
                  </span>
                </div>
              )}
              {item.paid_members_count !== undefined && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span>{item.paid_members_count} members paid</span>
                </div>
              )}
              {progress > 0 && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                  <span className="font-medium text-green-600">{progress.toFixed(0)}%</span>
                </div>
              )}
            </div>

            {/* Status Badge and Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-100">
              <Badge
                variant={item.status === "open" ? "default" : "secondary"}
                className={`${item.status === "open" ? "bg-green-100 text-green-700 hover:bg-green-200" : ""} text-xs sm:text-sm w-fit`}
              >
                {item.status === "open" ? "Open" : "Closed"}
              </Badge>
              {item.status === "open" && (
                <Button className="bg-green-600 hover:bg-green-700 rounded-xl h-10 sm:h-auto text-sm sm:text-base w-full sm:w-auto">
                  Pay Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FeedItemCard;

