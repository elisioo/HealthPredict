import React from "react";

function LandingPage({ onNavigate }) {
  return (
    <div className="font-sans bg-white">
      {/* Header */}
      <header className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-heartbeat text-white text-lg"></i>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                HealthPredict
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Home
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Contact
              </a>
              <button
                onClick={() => onNavigate("login")}
                className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary-dark transition-colors font-medium"
              >
                Sign In
              </button>
            </nav>
            <button className="md:hidden p-2">
              <i className="fa-solid fa-bars text-gray-600"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-blue-50 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="text-primary">Diabetes Risk</span> <br />
                Prediction
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Get accurate diabetes risk assessment using logistic regression
                and business analytics. Take control of your health with
                data-driven insights and personalized recommendations.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => onNavigate("login")}
                className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-dark transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <i className="fa-solid fa-chart-line mr-3"></i>
                Start Prediction
              </button>
              <button className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-light transition-all shadow-lg hover:shadow-xl">
                <i className="fa-solid fa-info-circle mr-3"></i>
                Learn More
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 pt-4">
              <div className="flex items-center space-x-2 text-gray-500">
                <i className="fa-solid fa-shield-halved text-primary"></i>
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <i className="fa-solid fa-chart-bar text-primary"></i>
                <span className="text-sm">Logistic Regression</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <i className="fa-solid fa-users text-primary"></i>
                <span className="text-sm">10K+ Patients</span>
              </div>
            </div>
          </div>

          {/* Illustration / Dashboard Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main Dashboard Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 w-80 sm:w-96">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Risk Assessment
                    </h3>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>

                  {/* Risk Meter */}
                  <div className="relative">
                    <div className="w-32 h-32 mx-auto relative">
                      <svg
                        className="w-32 h-32 transform -rotate-90"
                        viewBox="0 0 128 128"
                      >
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="8"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="8"
                          strokeDasharray="220"
                          strokeDashoffset="66"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            15%
                          </div>
                          <div className="text-xs text-gray-500">Risk</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                        Low Risk
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        120
                      </div>
                      <div className="text-xs text-gray-500">Glucose</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        24.5
                      </div>
                      <div className="text-xs text-gray-500">BMI</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className="w-full bg-primary text-white py-3 rounded-xl font-medium"
                    disabled
                  >
                    View Full Report
                  </button>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg p-4">
                <i className="fa-solid fa-calculator text-primary text-2xl"></i>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg p-4">
                <i className="fa-solid fa-chart-line text-green-500 text-2xl"></i>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-heartbeat text-white text-lg"></i>
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  HealthPredict
                </span>
              </div>
              <p className="text-gray-600 mb-6 max-w-md">
                Advanced diabetes risk prediction platform using logistic
                regression and business analytics, trusted by healthcare
                professionals worldwide.
              </p>
              <div className="flex space-x-4">
                {["twitter", "linkedin", "facebook"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors"
                  >
                    <i className={`fa-brands fa-${social}`}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-600 text-sm">
                  <i className="fa-solid fa-envelope w-4 text-primary"></i>
                  <span>support@healthpredict.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 text-sm">
                  <i className="fa-solid fa-phone w-4 text-primary"></i>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 text-sm">
                  <i className="fa-solid fa-location-dot w-4 text-primary"></i>
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <div className="space-y-3">
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "HIPAA Compliance",
                  "Cookie Policy",
                ].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-gray-600 hover:text-primary transition-colors text-sm"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 HealthPredict. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
              <span className="text-sm text-gray-500">
                🔒 Secure & Encrypted
              </span>
              <span className="text-sm text-gray-500">🏥 Medical Grade</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
