import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import onboardImage1 from "@/assets/images/Connected_world_onboard2.png";
import onboardImage2 from "@/assets/images/Connected_world_amico_1.png";
import onboardImage3 from "@/assets/images/Connect_work_onboard3.png";
import logo from "@/assets/images/hConnect-logo3.png";

const onboardingSlides = [
  {
    image: onboardImage1,
    title: "Stay updated within your Organization",
    description:
      "Manage your association in one place and get latest information and stay up-to-date when it comes to your association",
  },
  {
    image: onboardImage2,
    title: "Connect with loved ones around the world",
    description:
      "It's easier to connect around the world in real time with friends and family with Hebron Connect",
  },
  {
    image: onboardImage3,
    title: "Manage all finances with ease",
    description:
      "It's easier to manage finances and track association contributions for better accountability and clarity",
  },
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-black rounded-full px-6 py-3 flex items-center gap-3 shadow-lg">
            <img src={logo} alt="Hebron Connect" className="w-8 h-8 object-contain" />
            <span className="text-white font-semibold">Hebron Connect</span>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          {/* Image */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-sm aspect-square flex items-center justify-center">
              <img
                src={onboardingSlides[currentSlide].image}
                alt={onboardingSlides[currentSlide].title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Title and Description */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {onboardingSlides[currentSlide].title}
            </h2>
            <p className="text-gray-600 text-base leading-relaxed">
              {onboardingSlides[currentSlide].description}
            </p>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {onboardingSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-6 bg-[#1e40af]"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {currentSlide === onboardingSlides.length - 1 ? (
              <>
                <Button
                  onClick={handleRegister}
                  className="w-full h-14 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-full text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Register Now
                </Button>
                <Button
                  onClick={handleLogin}
                  variant="ghost"
                  className="w-full h-14 text-gray-700 hover:text-gray-900 rounded-full text-base font-medium hover:bg-gray-100 transition-all duration-200"
                >
                  Login
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleNext}
                  className="w-full h-14 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-full text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Next
                </Button>
                <Button
                  onClick={() => setCurrentSlide(onboardingSlides.length - 1)}
                  variant="ghost"
                  className="w-full h-14 text-gray-700 hover:text-gray-900 rounded-full text-base font-medium hover:bg-gray-100 transition-all duration-200"
                >
                  Skip
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

