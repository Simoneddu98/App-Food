import React from 'react';
import { MealSlot, WeeklyPlan, Recipe } from '../types';

interface WeeklyPlannerProps {
  plan: WeeklyPlan;
  recipes: Recipe[];
  onSlotClick: (date: string, type: 'breakfast'|'lunch'|'dinner') => void;
  onClearSlot: (date: string, type: 'breakfast'|'lunch'|'dinner') => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ plan, recipes, onSlotClick, onClearSlot }) => {
  
  const getRecipeForSlot = (dateOffset: number, type: string) => {
    // Generate simple date string for demo logic
    const today = new Date(plan.weekStartDate);
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dateOffset);
    const dateStr = targetDate.toISOString().split('T')[0];

    const slot = plan.slots.find(s => s.date === dateStr && s.type === type);
    if (!slot || !slot.recipeId) return null;
    return {
        slot,
        recipe: recipes.find(r => r.id === slot.recipeId)
    };
  };

  const renderSlot = (dayIndex: number, type: 'breakfast'|'lunch'|'dinner') => {
    const data = getRecipeForSlot(dayIndex, type);
    const today = new Date(plan.weekStartDate);
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayIndex);
    const dateStr = targetDate.toISOString().split('T')[0];

    return (
        <div 
            className={`
                relative h-24 rounded-xl border transition-all cursor-pointer overflow-hidden group
                ${data ? 'bg-white border-primary-200 shadow-sm' : 'bg-gray-50 border-dashed border-gray-200 hover:border-primary-300'}
            `}
            onClick={() => !data && onSlotClick(dateStr, type)}
        >
            {data ? (
                <>
                    <img src={data.recipe?.image} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="bg" />
                    <div className="absolute inset-0 p-2 flex flex-col justify-between z-10">
                        <span className="text-xs font-bold text-gray-900 leading-tight line-clamp-2">{data.recipe?.name}</span>
                        <div className="flex justify-end">
                             <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClearSlot(dateStr, type);
                                }}
                                className="w-6 h-6 bg-white/80 rounded-full text-red-500 flex items-center justify-center hover:bg-red-50"
                             >
                                <i className="fas fa-trash text-[10px]"></i>
                             </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-300">
                    <i className="fas fa-plus"></i>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="pb-24 p-4 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900">Your Week</h2>
                <p className="text-gray-500 text-sm">Jan 8 - Jan 14</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <i className="fas fa-calendar-alt text-gray-600"></i>
            </button>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-4">
            <div className="flex flex-col gap-4 pt-8">
                {DAYS.map((d, i) => (
                    <div key={d} className="h-24 flex flex-col justify-center items-center w-10">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{d}</span>
                        <span className={`text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center mt-1 ${i===0 ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-gray-800'}`}>
                            {8 + i}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-4 overflow-x-auto pb-4">
                {/* Header for meal types - simplified for mobile vertical scroll, 
                    typically we'd want horizontal scroll for days, but sticking to vertical for week view simplicity */}
                 <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="text-xs font-bold text-center text-gray-400">Breakfast</div>
                    <div className="text-xs font-bold text-center text-gray-400">Lunch</div>
                    <div className="text-xs font-bold text-center text-gray-400">Dinner</div>
                 </div>

                {DAYS.map((_, i) => (
                     <div key={i} className="grid grid-cols-3 gap-2">
                        {renderSlot(i, 'breakfast')}
                        {renderSlot(i, 'lunch')}
                        {renderSlot(i, 'dinner')}
                     </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default WeeklyPlanner;
