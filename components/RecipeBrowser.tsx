import React, { useState } from 'react';
import { Recipe, UserProfile } from '../types';
import { suggestRecipes } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';

interface RecipeBrowserProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  userProfile: UserProfile;
}

const CATEGORIES = [
  { id: 'all', name: 'All Recipes', icon: '🍽️', color: 'bg-orange-100' },
  { id: 'sandwich', name: 'Sandwiches', icon: '🥪', color: 'bg-amber-100' },
  { id: 'soup', name: 'Soups & Mac', icon: '🍲', color: 'bg-red-100' },
  { id: 'salad', name: 'Salads', icon: '🥗', color: 'bg-green-100' },
  { id: 'main', name: 'Family Feast', icon: '🍗', color: 'bg-blue-100' },
  { id: 'budget', name: 'Value Duets', icon: '💰', color: 'bg-yellow-100' },
];

const RecipeBrowser: React.FC<RecipeBrowserProps> = ({ recipes, onSelectRecipe, userProfile }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);

  const handleGeminiSuggest = async () => {
    setIsSuggesting(true);
    const newRecipes = await suggestRecipes(userProfile, `I want something for the ${activeCategory === 'all' ? 'week' : activeCategory} category.`);
    setAiRecipes(newRecipes);
    setIsSuggesting(false);
  };

  const displayRecipes = [...recipes, ...aiRecipes].filter(r => {
    const matchesCategory = activeCategory === 'all' || r.category.toLowerCase().includes(activeCategory);
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-24 animate-fade-in">
      {/* Search Header */}
      <div className="sticky top-0 bg-primary-900 text-white p-4 pt-6 z-20 shadow-lg rounded-b-3xl">
        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-full backdrop-blur-sm border border-white/20">
            <i className="fas fa-search text-white/70 ml-2"></i>
            <input 
                type="text" 
                placeholder="Search the menu..." 
                className="bg-transparent border-none outline-none text-white placeholder-white/70 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <button onClick={() => setSearchTerm('')}><i className="fas fa-times text-white/70"></i></button>}
        </div>
        <div className="flex gap-4 mt-4 overflow-x-auto no-scrollbar pb-2 items-center">
            <button 
                onClick={handleGeminiSuggest}
                disabled={isSuggesting}
                className="flex-shrink-0 flex items-center gap-2 bg-accent-400 text-primary-900 px-4 py-2 rounded-full font-bold text-sm shadow-md active:scale-95 transition-transform"
            >
                {isSuggesting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
                AI Suggest
            </button>
            
            <button 
                onClick={() => navigate('/swipe')}
                className="flex-shrink-0 flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-white/30 transition-colors"
            >
                <i className="fas fa-fire"></i>
                Discover
            </button>

            <button className="flex-shrink-0 text-sm font-medium text-white/90 border-b-2 border-white pb-1">Menu</button>
            <button className="flex-shrink-0 text-sm font-medium text-white/60 pb-1">Recents</button>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4">
        <h3 className="text-lg font-serif font-bold text-gray-800 mb-3">Categories</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map(cat => (
                <button 
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl w-24 transition-all ${
                        activeCategory === cat.id ? 'bg-primary-100 ring-2 ring-primary-500' : 'bg-white shadow-sm border border-gray-100'
                    }`}
                >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs font-medium text-center leading-tight">{cat.name}</span>
                </button>
            ))}
        </div>
      </div>

      {/* Featured Banner */}
      {activeCategory === 'all' && (
           <div className="px-4 mb-6">
            <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <h2 className="font-serif text-2xl font-bold mb-1 relative z-10">MUST-HAVE</h2>
                <h2 className="font-handwriting text-3xl text-accent-400 italic font-bold mb-2 relative z-10">Meals</h2>
                <p className="text-xs opacity-80 max-w-[60%] relative z-10">Curated specifically for your {userProfile.dietType} diet.</p>
                <img src="https://picsum.photos/150/150?random=99" className="absolute bottom-[-20px] right-[-20px] w-32 h-32 rounded-full border-4 border-white/20 shadow-xl object-cover" alt="Featured" />
            </div>
           </div>
      )}

      {/* List */}
      <div className="px-4 space-y-4">
        <h3 className="text-lg font-serif font-bold text-gray-800 flex justify-between items-center">
            {activeCategory === 'all' ? 'Popular Items' : CATEGORIES.find(c => c.id === activeCategory)?.name}
            <span className="text-xs font-sans font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{displayRecipes.length} results</span>
        </h3>
        
        {displayRecipes.map(recipe => (
            <div 
                key={recipe.id} 
                onClick={() => onSelectRecipe(recipe)}
                className="group bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4 items-center active:scale-[0.98] transition-all cursor-pointer hover:shadow-md"
            >
                <img src={recipe.image} alt={recipe.name} className="w-24 h-24 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{recipe.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{recipe.description}</p>
                    <div className="flex gap-2 mt-2">
                         <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{recipe.prepTime} min</span>
                         {recipe.calories && <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded-full">{recipe.calories} cal</span>}
                    </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm">
                    <i className="fas fa-plus"></i>
                </button>
            </div>
        ))}
        
        {displayRecipes.length === 0 && (
            <div className="text-center py-12 text-gray-400">
                <i className="fas fa-cookie-bite text-4xl mb-3"></i>
                <p>No recipes found.</p>
                <button onClick={handleGeminiSuggest} className="mt-4 text-primary-600 font-bold text-sm">Ask AI for ideas</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default RecipeBrowser;