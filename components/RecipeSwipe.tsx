import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe, UserProfile, MealType } from '../types';

interface RecipeSwipeProps {
  recipes: Recipe[];
  userProfile: UserProfile;
  onSave: (recipe: Recipe) => void;
  onAddToPlan: (recipe: Recipe, dayOffset: number, type: MealType) => void;
}

type Direction = 'left' | 'right' | 'up' | null;

const RecipeSwipe: React.FC<RecipeSwipeProps> = ({ recipes, userProfile, onSave, onAddToPlan }) => {
  const navigate = useNavigate();
  
  // State
  const [removedCards, setRemovedCards] = useState<string[]>([]); // IDs of processed cards
  const [drag, setDrag] = useState({ x: 0, y: 0, isDragging: false, startX: 0, startY: 0 });
  const [lastDirection, setLastDirection] = useState<Direction>(null);
  
  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    time: 60, // max minutes
    pantryOnly: false,
    mealType: 'all'
  });

  // Modal for Add to Plan
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0); // 0 = today, 1 = tomorrow...
  const [selectedMealType, setSelectedMealType] = useState<MealType>('dinner');

  const cardRef = useRef<HTMLDivElement>(null);

  // Filter recipes derived from props and local filter state
  const activeCards = recipes.filter(r => 
    !removedCards.includes(r.id) && 
    r.prepTime <= filters.time
  );
  
  const currentRecipe = activeCards[0];
  const nextRecipe = activeCards[1];

  // Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (showPlanModal) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setDrag({
      x: 0,
      y: 0,
      startX: e.clientX,
      startY: e.clientY,
      isDragging: true
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag.isDragging) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setDrag(prev => ({ ...prev, x: dx, y: dy }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!drag.isDragging) return;
    setDrag(prev => ({ ...prev, isDragging: false }));
    (e.target as Element).releasePointerCapture(e.pointerId);

    const threshold = 80; // px to trigger action
    
    if (drag.x > threshold) {
      swipe('right');
    } else if (drag.x < -threshold) {
      swipe('left');
    } else if (drag.y < -threshold) {
      swipe('up');
    } else {
      // Reset
      setDrag(prev => ({ ...prev, x: 0, y: 0 }));
    }
  };

  const swipe = (dir: Direction) => {
    if (!currentRecipe) return;

    setLastDirection(dir);
    
    if (dir === 'right') {
      onSave(currentRecipe);
    } else if (dir === 'up') {
      // Pause removal to show modal
      setShowPlanModal(true);
      return; 
    }

    // Mark as removed to advance stack
    setRemovedCards(prev => [...prev, currentRecipe.id]);
    setDrag({ x: 0, y: 0, isDragging: false, startX: 0, startY: 0 });
    setLastDirection(null);
  };

  const confirmAddToPlan = () => {
    if (currentRecipe) {
      onAddToPlan(currentRecipe, selectedDay, selectedMealType);
      setRemovedCards(prev => [...prev, currentRecipe.id]);
      setShowPlanModal(false);
      setDrag({ x: 0, y: 0, isDragging: false, startX: 0, startY: 0 });
    }
  };

  const getRotation = () => {
    const maxRot = 25; // degrees
    const screenWidth = window.innerWidth;
    const ratio = drag.x / (screenWidth / 2);
    return ratio * maxRot;
  };

  const getCardStyle = (isFront: boolean) => {
    if (!isFront) {
        return {
            transform: `scale(0.95) translateY(10px)`,
            opacity: 0.5,
            zIndex: 0
        };
    }
    
    const rotate = getRotation();
    return {
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotate}deg)`,
        transition: drag.isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        zIndex: 10,
        cursor: drag.isDragging ? 'grabbing' : 'grab'
    };
  };

  const getDifficulty = (mins: number) => {
      if (mins < 20) return 'Easy';
      if (mins < 45) return 'Medium';
      return 'Hard';
  };

  // Border colors based on drag direction
  const getBorderColor = () => {
      if (drag.y < -50) return 'border-blue-400';
      if (drag.x > 50) return 'border-green-400';
      if (drag.x < -50) return 'border-red-400';
      return 'border-transparent';
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col overflow-hidden touch-none">
      {/* Header */}
      <div className="flex justify-between items-center p-4 pt-6 bg-white/80 backdrop-blur-md z-20 shadow-sm">
        <button onClick={() => setShowFilters(true)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="fas fa-sliders-h text-gray-600"></i>
        </button>
        <h1 className="text-xl font-serif font-bold text-gray-800">Discover</h1>
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="fas fa-times text-gray-600"></i>
        </button>
      </div>

      {/* Main Card Area */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {activeCards.length === 0 ? (
           // Empty State
           <div className="text-center p-8 animate-fade-in w-full max-w-sm">
               <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
                   🍽️
               </div>
               <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">That's all for now!</h2>
               <p className="text-gray-500 mb-6">You've swiped through all matching recipes. Try adjusting your filters.</p>
               <button 
                onClick={() => {
                    setRemovedCards([]);
                    setShowFilters(true);
                }}
                className="bg-primary-600 text-white px-8 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform w-full"
               >
                   Modify Filters
               </button>
           </div>
        ) : (
            // Cards
            <div className="relative w-full max-w-sm aspect-[3/4] max-h-[70vh]">
                {/* Background Card (Next) */}
                {nextRecipe && (
                    <div 
                        className="absolute inset-0 bg-white rounded-3xl shadow-xl overflow-hidden pointer-events-none"
                        style={getCardStyle(false)}
                    >
                        <img src={nextRecipe.image} className="w-full h-1/2 object-cover" alt="" />
                        <div className="p-6">
                            <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                )}

                {/* Foreground Card (Current) */}
                {currentRecipe && (
                    <div 
                        ref={cardRef}
                        className={`absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden border-4 transition-colors ${getBorderColor()} touch-none select-none`}
                        style={getCardStyle(true)}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                    >
                         {/* Drag Indicators */}
                         <div className="absolute top-8 left-8 border-4 border-green-500 text-green-500 font-bold text-4xl px-4 py-2 rounded-xl transform -rotate-12 opacity-0 transition-opacity z-20" style={{ opacity: drag.x > 50 ? 1 : 0 }}>
                             SAVE
                         </div>
                         <div className="absolute top-8 right-8 border-4 border-red-500 text-red-500 font-bold text-4xl px-4 py-2 rounded-xl transform rotate-12 opacity-0 transition-opacity z-20" style={{ opacity: drag.x < -50 ? 1 : 0 }}>
                             NOPE
                         </div>
                         <div className="absolute bottom-32 w-full text-center opacity-0 transition-opacity z-20" style={{ opacity: drag.y < -50 ? 1 : 0 }}>
                             <div className="bg-blue-500 text-white font-bold text-xl px-6 py-2 rounded-full inline-block shadow-lg">
                                 Add to Plan 📅
                             </div>
                         </div>

                        {/* Image */}
                        <div className="h-1/2 relative">
                            <img src={currentRecipe.image} className="w-full h-full object-cover pointer-events-none" alt={currentRecipe.name} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                                <h2 className="text-3xl font-serif font-bold text-white leading-tight shadow-black drop-shadow-md">{currentRecipe.name}</h2>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col h-1/2">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <i className="fas fa-clock"></i> {currentRecipe.prepTime} min
                                </span>
                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <i className="fas fa-signal"></i> {getDifficulty(currentRecipe.prepTime)}
                                </span>
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <i className="fas fa-globe"></i> {currentRecipe.category || 'Global'}
                                </span>
                            </div>
                            
                            {/* Icons */}
                            <div className="flex gap-4 mb-4 text-gray-400">
                                {currentRecipe.tags.includes('vegetarian') && <i className="fas fa-leaf text-green-500 text-lg" title="Vegetarian"></i>}
                                {currentRecipe.tags.includes('gluten-free') && <i className="fas fa-wheat-awn-circle-exclamation text-amber-500 text-lg" title="Gluten Free"></i>}
                                {currentRecipe.tags.includes('kid-friendly') && <i className="fas fa-child text-pink-500 text-lg" title="Kid Friendly"></i>}
                            </div>

                            <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                                {currentRecipe.description}
                            </p>

                            <div className="border-t border-gray-100 pt-4">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Main Ingredients</p>
                                <div className="flex gap-2 overflow-hidden">
                                    {currentRecipe.ingredients.slice(0, 4).map((ing, i) => (
                                        <div key={i} className="bg-primary-50 text-primary-800 text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                            {ing.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Buttons */}
      <div className="p-6 pb-8 flex justify-center gap-8 items-center bg-white z-20 border-t border-gray-100">
          <button 
            onClick={() => swipe('left')}
            disabled={activeCards.length === 0}
            className="w-14 h-14 rounded-full bg-white border border-red-100 shadow-lg shadow-red-100 text-red-500 text-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
          >
              <i className="fas fa-times"></i>
          </button>
          
          <button 
            onClick={() => swipe('up')}
            disabled={activeCards.length === 0}
            className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 text-blue-500 text-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
          >
              <i className="fas fa-calendar-plus"></i>
          </button>

          <button 
            onClick={() => swipe('right')}
            disabled={activeCards.length === 0}
            className="w-14 h-14 rounded-full bg-white border border-green-100 shadow-lg shadow-green-100 text-green-500 text-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
          >
              <i className="fas fa-heart"></i>
          </button>
      </div>

      {/* Filter Modal */}
      {showFilters && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-end">
              <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold font-serif">Filters</h2>
                      <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                          <i className="fas fa-times text-xl"></i>
                      </button>
                  </div>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="text-sm font-bold text-gray-700 block mb-2">Max Prep Time</label>
                          <div className="flex items-center gap-4">
                            <input 
                                type="range" min="15" max="120" step="15" 
                                value={filters.time}
                                onChange={(e) => setFilters({...filters, time: parseInt(e.target.value)})}
                                className="w-full accent-primary-600"
                            />
                            <span className="font-bold text-primary-600 min-w-[4rem] text-right">{filters.time}m</span>
                          </div>
                      </div>

                      <div>
                         <label className="text-sm font-bold text-gray-700 block mb-2">Pantry</label>
                         <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                             <span className="text-gray-600">Use only what I have</span>
                             <input 
                                type="checkbox" 
                                checked={filters.pantryOnly}
                                onChange={(e) => setFilters({...filters, pantryOnly: e.target.checked})}
                                className="w-5 h-5 accent-primary-600"
                             />
                         </div>
                      </div>

                      <button 
                        onClick={() => setShowFilters(false)}
                        className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-200"
                      >
                          Apply Filters
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Add to Plan Modal */}
      {showPlanModal && (
          <div className="absolute inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-scale-up">
                  <h2 className="text-2xl font-serif font-bold text-center mb-1">Add to Plan</h2>
                  <p className="text-center text-gray-500 text-sm mb-6">{currentRecipe?.name}</p>
                  
                  <div className="space-y-4 mb-8">
                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">When?</label>
                          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                              {['Today', 'Tmrw', '+2', '+3', '+4', '+5', '+6'].map((d, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setSelectedDay(i)}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${selectedDay === i ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                  >
                                      {d}
                                  </button>
                              ))}
                          </div>
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Which meal?</label>
                          <div className="grid grid-cols-3 gap-2">
                              {(['breakfast', 'lunch', 'dinner'] as MealType[]).map(type => (
                                  <button
                                    key={type}
                                    onClick={() => setSelectedMealType(type)}
                                    className={`py-2 rounded-lg font-bold text-sm capitalize transition-colors ${selectedMealType === type ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                  >
                                      {type}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button 
                        onClick={() => {
                            setShowPlanModal(false);
                            setDrag({ x: 0, y: 0, isDragging: false, startX: 0, startY: 0 }); // Reset drag
                        }}
                        className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-xl"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={confirmAddToPlan}
                        className="flex-1 py-3 text-white font-bold bg-primary-600 rounded-xl shadow-lg shadow-primary-200"
                      >
                          Confirm
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default RecipeSwipe;