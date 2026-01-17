import { Filter, Trash2, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";

export function FloatingFilterBar({
  activeFilters,
  onClearFilter,
  onClearAll,
  totalResults
}: {
  activeFilters: Array<{ key: string; label: string; value: string }>;
  onClearFilter: (key: string, value: string) => void;
  onClearAll: () => void;
  totalResults: number;
}) {
  if (activeFilters.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green via-cyan-400 to-purple-500 rounded-2xl blur-xl opacity-40 animate-glow-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green/50 to-cyan-400/50 rounded-2xl blur-lg opacity-60"></div>

        <Card className="relative card-glass-intense border-brand-gray-700/30 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green/10 via-transparent to-cyan-400/10"></div>

          <CardContent className="relative p-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-neon-green/30 rounded-xl blur animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-brand-neon-green to-emerald-400 p-2 rounded-xl">
                    <Filter className="w-5 h-5 text-brand-black" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-white font-bold text-lg">
                    {totalResults.toLocaleString()}
                  </span>
                  <p className="text-brand-gray-300 text-xs font-medium">
                    {totalResults === 1 ? 'resultado' : 'resultados'}
                  </p>
                </div>
              </div>

              <div className="h-12 w-px bg-gradient-to-b from-transparent via-brand-gray-600 to-transparent"></div>

              <div className="flex items-center space-x-3 max-w-2xl overflow-x-auto scrollbar-hide">
                {activeFilters.map((filter, index) => (
                  <div key={`${filter.key}-${filter.value}-${index}`} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green/30 to-cyan-400/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <Badge className="relative bg-gradient-to-r from-brand-neon-green/20 to-cyan-400/20 text-white border border-brand-neon-green/40 flex items-center space-x-2 pr-2 py-2 px-3 text-sm font-medium hover:scale-105 transition-all duration-300">
                      <span className="text-brand-neon-green font-semibold">{filter.label}:</span>
                      <span>{filter.value}</span>
                      <button
                        onClick={() => onClearFilter(filter.key, filter.value)}
                        className="ml-2 hover:bg-red-500/20 hover:text-red-400 rounded-full p-1 transition-all duration-200 group/close"
                        title="Remover filtro"
                      >
                        <X className="w-3.5 h-3.5 group-hover/close:rotate-90 transition-transform duration-200" />
                      </button>
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="h-12 w-px bg-gradient-to-b from-transparent via-brand-gray-600 to-transparent"></div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Button
                  onClick={onClearAll}
                  className="relative btn-ghost h-11 px-6 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 transition-all duration-300 font-medium"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Tudo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
