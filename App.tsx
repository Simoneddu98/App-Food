import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Onboarding from './components/Onboarding';
import WeeklyPlanner from './components/WeeklyPlanner';
import RecipeBrowser from './components/RecipeBrowser';
import ShoppingList from './components/ShoppingList';
import RecipeSwipe from './components/RecipeSwipe';
import { UserProfile, Recipe, WeeklyPlan, MealSlot, MealType } from './types';

// Mock Data
const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Grilled Chicken & Quinoa Salad',
    description: 'A healthy and filling salad with fresh greens and protein.',
    image: 'https://picsum.photos/400/300?random=1',
    prepTime: 20,
    calories: 450,
    category: 'salad',
    tags: ['healthy', 'gluten-free'],
    ingredients: [
        { name: 'Chicken Breast', amount: 200, unit: 'g', category: 'Meat' },
        { name: 'Quinoa', amount: 100, unit: 'g', category: 'Grains' },
        { name: 'Mixed Greens', amount: 1, unit: 'bag', category: 'Produce' }
    ]
  },
  {
    id: '2',
    name: 'Tomato Basil Soup',
    description: 'Classic comfort food, perfect for dipping grilled cheese.',
    image: 'https://picsum.photos/400/300?random=2',
    prepTime: 30,
    calories: 300,
    category: 'soup',
    tags: ['vegetarian', 'comfort'],
    ingredients: [
        { name: 'Tomatoes', amount: 5, unit: 'whole', category: 'Produce' },
        { name: 'Heavy Cream', amount: 50, unit: 'ml', category: 'Dairy' },
        { name: 'Basil', amount: 1, unit: 'bunch', category: 'Produce' }
    ]
  },
  {
    id: '3',
    name: 'Turkey Club Sandwich',
    description: 'Triple-decker sandwich with roasted turkey and crisp bacon.',
    image: 'https://picsum.photos/400/300?random=3',
    prepTime: 10,
    calories: 550,
    category: 'sandwich',
    tags: ['classic', 'quick'],
    ingredients: [
        { name: 'Turkey Slices', amount: 100, unit: 'g', category: 'Meat' },
        { name: 'Bread', amount: 3, unit: 'slices', category: 'Bakery' },
        { name: 'Bacon', amount: 2, unit: 'strips', category: 'Meat' }
    ]
  },
  {
    id: '4',
    name: 'Spaghetti Carbonara',
    description: 'Traditional Italian pasta with egg, cheese, pancetta, and pepper.',
    image: 'https://picsum.photos/400/300?random=4',
    prepTime: 25,
    calories: 600,
    category: 'main',
    tags: ['classic', 'comfort'],
    ingredients: [
        { name: 'Spaghetti', amount: 200, unit: 'g', category: 'Pantry' },
        { name: 'Eggs', amount: 2, unit: 'large', category: 'Dairy' },
        { name: 'Pancetta', amount: 100, unit: 'g', category: 'Meat' }
    ]
  },
  {
    id: '5',
    name: 'Veggie Stir Fry',
    description: 'Quick and colorful mix of seasonal vegetables.',
    image: 'https://picsum.photos/400/300?random=5',
    prepTime: 15,
    calories: 300,
    category: 'main',
    tags: ['vegetarian', 'vegan', 'healthy'],
    ingredients: [
        { name: 'Broccoli', amount: 1, unit: 'head', category: 'Produce' },
        { name: 'Carrots', amount: 2, unit: 'medium', category: 'Produce' },
        { name: 'Soy Sauce', amount: 30, unit: 'ml', category: 'Pantry' }
    ]
  }
];

const INITIAL_PLAN: WeeklyPlan = {
    id: 'week-1',
    weekStartDate: new Date().toISOString().split('T')[0],
    slots: []
};

function Layout({ children }: { children?: React.ReactNode }) {
    const location = useLocation();
    
    const isActive = (path: string) => location.pathname === path;
    
    // Hide bottom nav on Swipe screen
    if (location.pathname === '/swipe') {
        return <div className="min-h-screen bg-[#fcfcfc] max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-100">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc] max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-100">
            {children}
            
            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                <Link to="/" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') ? 'text-primary-600' : 'text-gray-400'}`}>
                    <i className={`fas fa-calendar-week text-xl ${isActive('/') ? 'animate-bounce-subtle' : ''}`}></i>
                    <span className="text-[10px] font-bold">Plan</span>
                </Link>
                <Link to="/recipes" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/recipes') ? 'text-primary-600' : 'text-gray-400'}`}>
                    <div className="relative">
                         <i className="fas fa-utensils text-xl"></i>
                         {/* Notification dot example */}
                         <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full"></div>
                    </div>
                    <span className="text-[10px] font-bold">Recipes</span>
                </Link>
                <div className="-mt-8">
                     <Link to="/recipes" className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-200 hover:scale-105 transition-transform">
                        <i className="fas fa-plus text-xl"></i>
                     </Link>
                </div>
                <Link to="/list" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/list') ? 'text-primary-600' : 'text-gray-400'}`}>
                    <i className="fas fa-shopping-basket text-xl"></i>
                    <span className="text-[10px] font-bold">Shop</span>
                </Link>
                <Link to="/profile" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/profile') ? 'text-primary-600' : 'text-gray-400'}`}>
                    <i className="fas fa-user text-xl"></i>
                    <span className="text-[10px] font-bold">Chef</span>
                </Link>
            </nav>
        </div>
    );
}

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(INITIAL_PLAN);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Simple slot selection state
  const [pendingSlot, setPendingSlot] = useState<{date: string, type: 'breakfast'|'lunch'|'dinner'} | null>(null);

  useEffect(() => {
    if (userProfile) {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const handleSlotClick = (date: string, type: 'breakfast'|'lunch'|'dinner') => {
    setPendingSlot({ date, type });
    window.location.hash = '#/recipes';
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    if (pendingSlot) {
        // Add to plan
        const newSlots = [...weeklyPlan.slots.filter(s => !(s.date === pendingSlot.date && s.type === pendingSlot.type))];
        newSlots.push({
            date: pendingSlot.date,
            type: pendingSlot.type,
            recipeId: recipe.id
        });
        setWeeklyPlan({ ...weeklyPlan, slots: newSlots });
        setPendingSlot(null);
        window.location.hash = '#/';
        
        // Add recipe to list if generic AI recipe
        if (!recipes.find(r => r.id === recipe.id)) {
            setRecipes([...recipes, recipe]);
        }
    }
  };

  const handleClearSlot = (date: string, type: 'breakfast'|'lunch'|'dinner') => {
     const newSlots = weeklyPlan.slots.filter(s => !(s.date === date && s.type === type));
     setWeeklyPlan({ ...weeklyPlan, slots: newSlots });
  };

  // Logic for adding from Swipe View
  const handleAddToPlanFromSwipe = (recipe: Recipe, dayOffset: number, type: MealType) => {
      const today = new Date(weeklyPlan.weekStartDate);
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + dayOffset);
      const dateStr = targetDate.toISOString().split('T')[0];
      
      const newSlots = [...weeklyPlan.slots.filter(s => !(s.date === dateStr && s.type === type))];
      newSlots.push({
          date: dateStr,
          type: type,
          recipeId: recipe.id
      });
      setWeeklyPlan({ ...weeklyPlan, slots: newSlots });
  };

  const handleSaveFavorite = (recipe: Recipe) => {
      if (!favorites.includes(recipe.id)) {
          setFavorites([...favorites, recipe.id]);
          // Add visuals or toast here in full app
      }
  };

  if (!userProfile?.isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <HashRouter>
        <Layout>
            <Routes>
                <Route path="/" element={
                    <WeeklyPlanner 
                        plan={weeklyPlan} 
                        recipes={recipes} 
                        onSlotClick={handleSlotClick}
                        onClearSlot={handleClearSlot}
                    />
                } />
                <Route path="/recipes" element={
                    <RecipeBrowser 
                        recipes={recipes} 
                        onSelectRecipe={handleRecipeSelect}
                        userProfile={userProfile}
                    />
                } />
                <Route path="/swipe" element={
                    <RecipeSwipe
                        recipes={recipes}
                        userProfile={userProfile}
                        onSave={handleSaveFavorite}
                        onAddToPlan={handleAddToPlanFromSwipe}
                    />
                } />
                <Route path="/list" element={
                    <ShoppingList 
                        plan={weeklyPlan}
                        recipes={recipes}
                    />
                } />
                <Route path="/profile" element={
                    <div className="p-6">
                        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Chef Profile</h2>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-3xl">
                                    👨‍🍳
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{userProfile.name}</h3>
                                    <p className="text-gray-500 text-sm">Household of {userProfile.householdSize}</p>
                                </div>
                             </div>
                             <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500">Diet</span>
                                    <span className="font-medium capitalize text-primary-700 bg-primary-50 px-3 py-1 rounded-full text-sm">{userProfile.dietType}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500">Goal</span>
                                    <span className="font-medium">{userProfile.goals[0] || 'Eat Well'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500">Favorites</span>
                                    <span className="font-medium">{favorites.length} saved</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        localStorage.removeItem('userProfile');
                                        window.location.reload();
                                    }}
                                    className="w-full mt-4 py-3 text-red-500 font-medium bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                                >
                                    Reset Profile
                                </button>
                             </div>
                        </div>
                    </div>
                } />
            </Routes>
        </Layout>
    </HashRouter>
  );
}

export default App;
