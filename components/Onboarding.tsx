import React, { useState } from 'react';
import { UserProfile, DietType } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: 'Chef',
    householdSize: 2,
    hasChildren: false,
    dietType: 'omnivorous',
    goals: [],
    allergies: [],
    cookingTime: 'medium',
    budget: 'standard',
    isOnboarded: false
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const finish = () => {
    onComplete({ ...profile, isOnboarded: true } as UserProfile);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-primary-900">Who are you cooking for?</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-700 font-medium">Household Size</span>
                <input 
                  type="range" min="1" max="10" 
                  value={profile.householdSize} 
                  onChange={(e) => setProfile({...profile, householdSize: parseInt(e.target.value)})}
                  className="w-full mt-2 accent-primary-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center text-3xl font-bold text-primary-600 mt-2">{profile.householdSize} People</div>
              </label>
              
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
                 <input 
                    type="checkbox" 
                    checked={profile.hasChildren}
                    onChange={(e) => setProfile({...profile, hasChildren: e.target.checked})}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                 />
                 <span className="text-gray-700">I cook for children under 12</span>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-primary-900">Dietary Preferences</h2>
            <div className="grid grid-cols-2 gap-3">
              {['Omnivorous', 'Vegetarian', 'Vegan', 'Pescatarian', 'Flexitarian'].map((diet) => (
                <button
                  key={diet}
                  onClick={() => setProfile({...profile, dietType: diet.toLowerCase() as DietType})}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    profile.dietType === diet.toLowerCase() 
                    ? 'border-primary-500 bg-primary-50 text-primary-900 ring-2 ring-primary-200' 
                    : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="font-medium">{diet}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
         return (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-primary-900">Your Goals</h2>
            <div className="space-y-3">
              {['Eat Healthier', 'Save Money', 'Reduce Waste', 'Try New Foods', 'Save Time'].map((goal) => (
                <button
                  key={goal}
                  onClick={() => {
                    const goals = profile.goals || [];
                    if (goals.includes(goal)) {
                        setProfile({...profile, goals: goals.filter(g => g !== goal)});
                    } else {
                        setProfile({...profile, goals: [...goals, goal]});
                    }
                  }}
                  className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${
                    profile.goals?.includes(goal)
                    ? 'border-primary-500 bg-primary-50 text-primary-900' 
                    : 'border-gray-200'
                  }`}
                >
                  <span>{goal}</span>
                  {profile.goals?.includes(goal) && <i className="fas fa-check text-primary-600"></i>}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
             <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-3xl">
                🥗
             </div>
        </div>
        
        {renderStep()}

        <div className="mt-8 flex gap-4">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="flex-1 py-3 px-6 rounded-full border border-gray-300 font-medium text-gray-600 hover:bg-gray-50"
            >
              Back
            </button>
          )}
          <button 
            onClick={step < 3 ? nextStep : finish}
            className="flex-1 py-3 px-6 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            {step < 3 ? 'Next Step' : 'Get Started'}
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary-500' : 'w-2 bg-gray-200'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
