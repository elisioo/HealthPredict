import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState(null);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

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
                Glucogu
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollTo(aboutRef)}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollTo(contactRef)}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Contact
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                Sign In
              </button>
            </nav>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <i
                className={`fa-solid ${mobileOpen ? "fa-xmark" : "fa-bars"} text-gray-600 text-xl`}
              ></i>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden pb-4 border-t border-gray-100 pt-3 space-y-2">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setMobileOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-50"
              >
                Home
              </button>
              <button
                onClick={() => scrollTo(aboutRef)}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-50"
              >
                About
              </button>
              <button
                onClick={() => scrollTo(contactRef)}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-50"
              >
                Contact
              </button>
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-primary font-medium rounded-lg hover:bg-primary/5"
              >
                Sign In
              </button>
            </div>
          )}
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
                Get accurate diabetes risk assessment using HistGradient
                Boosting Classifier and business analytics. Take control of your
                health with data-driven insights and personalized
                recommendations.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/login")}
                className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-dark transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <i className="fa-solid fa-chart-line mr-3"></i>
                Start Prediction
              </button>
              <button
                className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-light transition-all shadow-lg hover:shadow-xl"
                onClick={() => scrollTo(aboutRef)}
              >
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
                  <button className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors">
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

      {/* ─── About Section ─── */}
      <section ref={aboutRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              About <span className="text-primary">Glucogu</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Glucogu is an intelligent diabetes risk prediction platform built
              to empower individuals and healthcare professionals with early,
              data-driven insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "fa-brain",
                title: "ML-Powered Predictions",
                desc: "Our model uses Histogram Gradient Boosting trained on validated clinical datasets to deliver accurate risk assessments in seconds.",
              },
              {
                icon: "fa-user-doctor",
                title: "Healthcare Integration",
                desc: "Staff members can run predictions for patients, manage appointments, and communicate securely through the built-in messaging system.",
              },
              {
                icon: "fa-shield-halved",
                title: "Security First",
                desc: "End-to-end encryption, role-based access control, input validation, and comprehensive audit logging protect every piece of health data.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <i
                    className={`fa-solid ${item.icon} text-primary text-2xl`}
                  ></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl p-8 sm:p-12">
            <div className="grid sm:grid-cols-4 gap-8 text-center">
              {[
                { value: "95%+", label: "Model Accuracy" },
                { value: "10K+", label: "Patients Served" },
                { value: "<2s", label: "Prediction Speed" },
                { value: "24/7", label: "System Availability" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Contact Section ─── */}
      <section ref={contactRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Get In <span className="text-primary">Touch</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Have questions about Glucogu? Reach out to our team — we're happy
              to help.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: "fa-envelope",
                title: "Email Us",
                info: "support@glucogu.com",
                sub: "We reply within 24 hours",
              },
              {
                icon: "fa-phone",
                title: "Call Us",
                info: "+63 (930) 000-9000",
                sub: "Mon – Fri, 8 AM – 5 PM",
              },
              {
                icon: "fa-location-dot",
                title: "Visit Us",
                info: "Davao City, Philippines",
                sub: "By appointment only",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <i
                    className={`fa-solid ${item.icon} text-primary text-2xl`}
                  ></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-primary font-medium mb-1">{item.info}</p>
                <p className="text-gray-500 text-sm">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-heartbeat text-white text-lg"></i>
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  Glucogu
                </span>
              </div>
              <p className="text-gray-600 mb-6 max-w-md">
                Advanced diabetes risk prediction platform using logistic
                regression and business analytics, trusted by healthcare
                professionals worldwide.
              </p>
              <div className="flex space-x-4">
                {["twitter", "linkedin", "facebook"].map((social) => (
                  <span
                    key={social}
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                  >
                    <i className={`fa-brands fa-${social}`}></i>
                  </span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-600 text-sm">
                  <i className="fa-solid fa-envelope w-4 text-primary"></i>
                  <span>support@glucogu.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 text-sm">
                  <i className="fa-solid fa-phone w-4 text-primary"></i>
                  <span>+63 (930) 000-9000</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 text-sm">
                  <i className="fa-solid fa-location-dot w-4 text-primary"></i>
                  <span>Davao, Philippines</span>
                </div>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setModal("privacy")}
                  className="block text-gray-600 hover:text-primary transition-colors text-sm"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setModal("terms")}
                  className="block text-gray-600 hover:text-primary transition-colors text-sm"
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => setModal("cookies")}
                  className="block text-gray-600 hover:text-primary transition-colors text-sm"
                >
                  Cookie Policy
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2026 Glucogu. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
              <span className="text-sm text-gray-500">Secure & Encrypted</span>
              <span className="text-sm text-gray-500">Medical Grade</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Privacy Policy Modal ─── */}
      {modal === "privacy" && (
        <PolicyModal onClose={() => setModal(null)} title="Privacy Policy">
          <p>
            <strong>Effective Date:</strong> January 1, 2026
          </p>
          <p>
            Glucogu (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is
            committed to protecting the privacy of our users. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your
            information when you use our diabetes risk prediction platform.
          </p>
          <p>
            <strong>Information We Collect</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Personal information (name, email, phone number) provided during
              registration.
            </li>
            <li>
              Health data (blood glucose, BMI, HbA1c, etc.) submitted for risk
              predictions.
            </li>
            <li>
              Usage data such as login timestamps and IP addresses for security
              auditing.
            </li>
          </ul>
          <p>
            <strong>How We Use Your Information</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and maintain diabetes risk prediction services.</li>
            <li>
              To communicate with you regarding appointments and health
              insights.
            </li>
            <li>
              To improve our machine learning models using anonymized,
              aggregated data.
            </li>
            <li>
              To comply with legal obligations and protect against security
              threats.
            </li>
          </ul>
          <p>
            <strong>Data Security</strong>
          </p>
          <p>
            We use AES-256-GCM encryption for sensitive data at rest, bcrypt
            password hashing, HTTPS in transit, and role-based access controls.
            All health data is accessible only to authorized personnel.
          </p>
          <p>
            <strong>Data Retention</strong>
          </p>
          <p>
            Your data is retained for as long as your account is active. You may
            request account deletion at any time through your account settings.
            Deleted data is permanently removed after the scheduled grace
            period.
          </p>
          <p>
            <strong>Contact</strong>
          </p>
          <p>
            For privacy inquiries, email us at{" "}
            <strong>support@glucogu.com</strong>.
          </p>
        </PolicyModal>
      )}

      {/* ─── Terms of Service Modal ─── */}
      {modal === "terms" && (
        <PolicyModal onClose={() => setModal(null)} title="Terms of Service">
          <p>
            <strong>Effective Date:</strong> January 1, 2026
          </p>
          <p>
            By accessing or using the Glucogu platform, you agree to be bound by
            these Terms of Service. If you do not agree, please do not use the
            platform.
          </p>
          <p>
            <strong>1. Use of Service</strong>
          </p>
          <p>
            Glucogu provides a diabetes risk prediction tool for informational
            purposes only. Predictions are not a substitute for professional
            medical diagnosis, treatment, or advice. Always consult a qualified
            healthcare provider for medical decisions.
          </p>
          <p>
            <strong>2. User Accounts</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              You must provide accurate and complete information during
              registration.
            </li>
            <li>
              You are responsible for maintaining the confidentiality of your
              account credentials.
            </li>
            <li>
              You must notify us immediately of any unauthorized use of your
              account.
            </li>
          </ul>
          <p>
            <strong>3. Prohibited Conduct</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Attempting to access accounts or data belonging to other users.
            </li>
            <li>
              Using automated tools to scrape or submit data to the platform.
            </li>
            <li>Interfering with the operation or security of the platform.</li>
          </ul>
          <p>
            <strong>4. Limitation of Liability</strong>
          </p>
          <p>
            Glucogu is provided &ldquo;as is&rdquo; without warranties of any
            kind. We shall not be liable for any damages arising from the use of
            risk prediction results. Use all predictions as supplementary
            information alongside professional medical consultation.
          </p>
          <p>
            <strong>5. Changes</strong>
          </p>
          <p>
            We reserve the right to modify these Terms at any time. Continued
            use of the platform after changes constitutes acceptance of the
            revised Terms.
          </p>
        </PolicyModal>
      )}

      {/* ─── Cookie Policy Modal ─── */}
      {modal === "cookies" && (
        <PolicyModal onClose={() => setModal(null)} title="Cookie Policy">
          <p>
            <strong>Effective Date:</strong> January 1, 2026
          </p>
          <p>
            This Cookie Policy explains how Glucogu uses cookies and similar
            technologies to provide, secure, and improve our platform.
          </p>
          <p>
            <strong>What Are Cookies?</strong>
          </p>
          <p>
            Cookies are small text files stored on your device when you visit a
            website. They help us recognize your browser and maintain your
            session.
          </p>
          <p>
            <strong>Cookies We Use</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Authentication Cookies</strong> — HttpOnly, Secure cookies
              that store your session tokens (access token and refresh token).
              These are essential for login functionality.
            </li>
            <li>
              <strong>Security Cookies</strong> — Used to prevent cross-site
              request forgery (CSRF) and enforce same-site policies.
            </li>
          </ul>
          <p>
            <strong>Third-Party Cookies</strong>
          </p>
          <p>
            We use Google reCAPTCHA during registration and login, which may set
            its own cookies for bot detection purposes. Please refer to
            Google&apos;s Privacy Policy for details.
          </p>
          <p>
            <strong>Managing Cookies</strong>
          </p>
          <p>
            You can disable cookies through your browser settings. However,
            disabling essential authentication cookies will prevent you from
            logging in to the platform.
          </p>
        </PolicyModal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Simple Policy Modal                                                  */
/* ------------------------------------------------------------------ */
function PolicyModal({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-sm text-gray-600 leading-relaxed space-y-4">
          {children}
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
