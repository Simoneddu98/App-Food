import React, { useState, useEffect } from 'react';
import { Ingredient, WeeklyPlan, Recipe } from '../types';

interface ShoppingListProps {
  plan: WeeklyPlan;
  recipes: Recipe[];
}

const ShoppingList: React.FC<ShoppingListProps> = ({ plan, recipes }) => {
  const [items, setItems] = useState<Ingredient[]>([]);

  useEffect(() => {
    // Aggregate ingredients
    const newItems: Ingredient[] = [];
    const itemMap = new Map<string, Ingredient>();

    plan.slots.forEach(slot => {
        if (!slot.recipeId) return;
        const recipe = recipes.find(r => r.id === slot.recipeId);
        if (!recipe) return;

        recipe.ingredients.forEach(ing => {
            const key = ing.name.toLowerCase();
            if (itemMap.has(key)) {
                const existing = itemMap.get(key)!;
                existing.amount += ing.amount;
            } else {
                itemMap.set(key, { ...ing, checked: false });
            }
        });
    });

    setItems(Array.from(itemMap.values()));
  }, [plan, recipes]);

  const toggleCheck = (name: string) => {
    setItems(items.map(i => i.name === name ? { ...i, checked: !i.checked } : i));
  };

  const categories = Array.from(new Set(items.map(i => i.category)));

  return (
    <div className="pb-24 p-4 animate-fade-in">
        <div className="bg-primary-900 text-white p-6 rounded-3xl shadow-xl mb-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-serif font-bold">Shopping List</h2>
                    <p className="text-primary-200 text-sm mt-1">{items.filter(i => !i.checked).length} items remaining</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <i className="fas fa-shopping-basket text-xl"></i>
                </div>
            </div>
            <div className="mt-6 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                    className="bg-accent-400 h-full transition-all duration-500" 
                    style={{ width: `${items.length > 0 ? (items.filter(i => i.checked).length / items.length) * 100 : 0}%` }}
                ></div>
            </div>
        </div>

        {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
                <i className="fas fa-carrot text-4xl mb-4"></i>
                <p>Your list is empty.</p>
                <p className="text-sm">Add meals to your plan to generate a list.</p>
            </div>
        ) : (
            <div className="space-y-6">
                {categories.map(cat => {
                    const catItems = items.filter(i => i.category === cat);
                    if (catItems.length === 0) return null;
                    return (
                        <div key={cat}>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">{cat}</h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {catItems.map((item, idx) => (
                                    <div 
                                        key={item.name}
                                        onClick={() => toggleCheck(item.name)}
                                        className={`
                                            p-4 flex items-center justify-between cursor-pointer transition-colors
                                            ${idx !== catItems.length - 1 ? 'border-b border-gray-50' : ''}
                                            ${item.checked ? 'bg-gray-50' : 'hover:bg-primary-50'}
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                                ${item.checked ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}
                                            `}>
                                                {item.checked && <i className="fas fa-check text-white text-xs"></i>}
                                            </div>
                                            <span className={`font-medium ${item.checked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500 font-medium">
                                            {item.amount > 0 && item.amount} {item.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};

export default ShoppingList;
