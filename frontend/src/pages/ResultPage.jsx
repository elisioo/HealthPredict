import React from 'react';

// Risk configurations
const riskConfig = {
  high: {
    label: 'HIGH',
    sublabel: 'RISK',
    probability: '78%',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    badgeBg: 'bg-red-50',
    message:
      'Based on your health profile, you have a high probability of developing diabetes within the next 5-10 years. This assessment considers factors such as your BMI, family history, lifestyle patterns, and other health indicators.',
  },
  medium: {
    label: 'MEDIUM',
    sublabel: 'RISK',
    probability: '45%',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    badgeBg: 'bg-yellow-50',
    message:
      'Your health profile indicates a moderate diabetes risk. Consider making lifestyle improvements and scheduling regular check-ups to monitor your progress.',
  },
  low: {
    label: 'LOW',
    sublabel: 'RISK',
    probability: '15%',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    badgeBg: 'bg-green-50',
    message:
      'Great news! Your health profile indicates a low risk of developing diabetes. Maintain your healthy lifestyle and continue with regular medical check-ups.',
  },
};

function ResultPage({ onNavigate, riskLevel = 'high' }) {
  const config = riskConfig[riskLevel] || riskConfig.high;

  const recommendations = [
    'Schedule an appointment with your healthcare provider within 2 weeks',
    'Consider dietary modifications and regular exercise routine',
    'Monitor blood glucose levels regularly',
    'Maintain a healthy weight and active lifestyle',
  ];

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-heart-pulse text-white text-sm"></i>
              </div>
              <span className="text-xl font-semibold text-gray-900">HealthPredict</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => onNavigate('user-dashboard')}
                className="text-gray-600 hover:text-primary transition-colors text-sm"
              >
                Dashboard
              </button>
              <button className="text-gray-600 hover:text-primary transition-colors text-sm">History</button>
              <button className="text-gray-600 hover:text-primary transition-colors text-sm">Settings</button>
            </nav>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-user text-primary text-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-2xl">
          {/* Result Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

            {/* Card Header */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 sm:px-8 py-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-chart-line text-primary text-xl"></i>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Prediction Results</h1>
              <p className="text-gray-600 text-sm sm:text-base">Your diabetes risk assessment is complete</p>
            </div>

            {/* Risk Section */}
            <div className="px-6 sm:px-8 py-8 text-center">
              {/* Risk Badge */}
              <div
                className={`inline-flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 ${config.bgColor} border-4 ${config.borderColor} rounded-full mb-6`}
              >
                <div className="text-center">
                  <div className={`text-3xl sm:text-4xl font-bold ${config.textColor} mb-1`}>
                    {config.label}
                  </div>
                  <div className={`text-sm font-medium ${config.textColor}`}>{config.sublabel}</div>
                </div>
              </div>

              {/* Probability */}
              <div className="mb-8">
                <div className="text-5xl sm:text-6xl font-bold text-gray-900 mb-2">{config.probability}</div>
                <p className="text-gray-600 text-lg">Probability of Developing Diabetes</p>
              </div>

              {/* Explanation */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <i className="fa-solid fa-info-circle text-primary mr-2"></i>
                  What This Means
                </h3>
                <p className="text-gray-700 leading-relaxed">{config.message}</p>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="fa-solid fa-user-doctor text-primary mr-2"></i>
                  Medical Recommendations
                </h3>
                <ul className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start">
                      <i className="fa-solid fa-check text-green-500 mt-1 mr-3 flex-shrink-0"></i>
                      <span className="text-gray-700 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <i className="fa-solid fa-save"></i>
                  Save Result
                </button>
                <button
                  onClick={() => onNavigate('prediction')}
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-8 rounded-xl border border-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i>
                  New Prediction
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-100">
              <div className="flex items-center justify-center text-sm text-gray-500 gap-2">
                <i className="fa-solid fa-shield-alt text-primary"></i>
                <span>This assessment is for informational purposes only and should not replace professional medical advice</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center justify-center gap-2 text-gray-600 hover:text-primary transition-colors text-sm">
              <i className="fa-solid fa-download"></i>
              Download PDF Report
            </button>
            <button className="flex items-center justify-center gap-2 text-gray-600 hover:text-primary transition-colors text-sm">
              <i className="fa-solid fa-share"></i>
              Share with Doctor
            </button>
            <button
              onClick={() => onNavigate('user-dashboard')}
              className="flex items-center justify-center gap-2 text-gray-600 hover:text-primary transition-colors text-sm"
            >
              <i className="fa-solid fa-history"></i>
              View History
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500 text-sm">
          <p>© 2024 HealthPredict. All rights reserved. | Medical AI Assistant</p>
        </div>
      </footer>
    </div>
  );
}

export default ResultPage;
