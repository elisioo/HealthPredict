import React, { useState } from 'react';

const fields = [
  {
    name: 'pregnancies',
    label: 'Pregnancies',
    icon: 'fa-baby',
    placeholder: '0',
    type: 'number',
    min: 0,
    step: 1,
    hint: 'Number of times pregnant',
  },
  {
    name: 'glucose',
    label: 'Glucose Level',
    icon: 'fa-vial',
    placeholder: '120',
    type: 'number',
    min: 0,
    step: 1,
    hint: 'Plasma glucose concentration (mg/dL)',
  },
  {
    name: 'bloodPressure',
    label: 'Blood Pressure',
    icon: 'fa-heart-pulse',
    placeholder: '80',
    type: 'number',
    min: 0,
    step: 1,
    hint: 'Diastolic blood pressure (mm Hg)',
  },
  {
    name: 'skinThickness',
    label: 'Skin Thickness',
    icon: 'fa-ruler',
    placeholder: '20',
    type: 'number',
    min: 0,
    step: 1,
    hint: 'Triceps skin fold thickness (mm)',
  },
  {
    name: 'insulin',
    label: 'Insulin',
    icon: 'fa-syringe',
    placeholder: '85',
    type: 'number',
    min: 0,
    step: 1,
    hint: '2-Hour serum insulin (mu U/ml)',
  },
  {
    name: 'bmi',
    label: 'BMI',
    icon: 'fa-weight-scale',
    placeholder: '25.5',
    type: 'number',
    min: 0,
    step: 0.1,
    hint: 'Body Mass Index (kg/m²)',
  },
  {
    name: 'diabetesPedigree',
    label: 'Diabetes Pedigree',
    icon: 'fa-dna',
    placeholder: '0.5',
    type: 'number',
    min: 0,
    step: 0.001,
    hint: 'Diabetes pedigree function (genetic factor)',
  },
  {
    name: 'age',
    label: 'Age',
    icon: 'fa-calendar-days',
    placeholder: '35',
    type: 'number',
    min: 1,
    max: 120,
    step: 1,
    hint: 'Age in years',
  },
];

function PredictionPage({ onNavigate }) {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onNavigate('result');
    }, 2500);
  };

  return (
    <div className="bg-white font-sans min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-heartbeat text-white text-lg"></i>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Diabetes Risk Prediction</h1>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <button
                onClick={() => onNavigate('user-dashboard')}
                className="text-gray-600 hover:text-primary transition-colors text-sm font-medium"
              >
                Dashboard
              </button>
              <button className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">
                History
              </button>
              <button className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">
                Help
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Intro */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              Assess Your Diabetes Risk
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Enter your health information below to receive a personalized diabetes risk assessment
              based on clinical data.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-10">
            {!isLoading ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <i className={`fa-solid ${field.icon} text-primary text-xs`}></i>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      />
                      <p className="text-xs text-gray-500">{field.hint}</p>
                    </div>
                  ))}
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-xl hover:bg-primary-dark transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 text-base"
                  >
                    <i className="fa-solid fa-brain"></i>
                    <span>Predict Risk</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Loading State */
              <div className="py-16">
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-700 font-medium text-lg mb-1">Analyzing Your Data</p>
                    <p className="text-gray-500 text-sm">This will only take a moment...</p>
                  </div>
                  <div className="flex gap-2">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}s` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: 'fa-shield-halved', title: 'Secure & Private', desc: 'Your data is encrypted and protected' },
              { icon: 'fa-stethoscope', title: 'Clinically Validated', desc: 'Based on medical research data' },
              { icon: 'fa-clock', title: 'Instant Results', desc: 'Get your risk assessment quickly' },
            ].map((card) => (
              <div key={card.title} className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`fa-solid ${card.icon} text-white text-sm`}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{card.title}</h3>
                    <p className="text-xs text-gray-600">{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          <p className="mb-1">This tool is for informational purposes only and does not replace professional medical advice.</p>
          <p className="text-xs text-gray-500">© 2024 HealthPredict. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default PredictionPage;
