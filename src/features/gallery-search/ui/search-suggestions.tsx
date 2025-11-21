import { Search } from "lucide-react";
import { useMemo } from "react";

export function SearchSuggestions({
  query,
  onSuggestionClick,
  isVisible
}: {
  query: string;
  onSuggestionClick: (suggestion: string) => void;
  isVisible: boolean;
}) {
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];

    const baseSuggestions = [
      'moderno', 'vintage', 'minimalista', 'colorido', 'elegante',
      'campanha', 'produto', 'social media', 'instagram', 'facebook',
      'verão', 'inverno', 'natal', 'black friday', 'promoção'
    ];

    return baseSuggestions
      .filter(s => s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [query]);

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-brand-gray-900/95 border border-brand-gray-700/50 rounded-lg backdrop-blur-xl shadow-2xl">
      <div className="p-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left px-3 py-2 text-sm text-brand-gray-300 hover:bg-brand-neon-green/10 hover:text-brand-neon-green rounded-md transition-colors duration-200"
          >
            <Search className="w-3 h-3 inline mr-2" />
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
