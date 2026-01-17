"use client";

import React from 'react';
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { useDebouncedCallback } from 'use-debounce';
import { type GalleryFilters } from './gallery.types';
import { CreativeStatus, CreativeFormat } from '@/modules/creative/dto/creative.schema';
import { FORMAT_LABELS } from '@/modules/creative/dto/creative.schema';

// Props para a sidebar
interface FilterSidebarProps {
  filters: GalleryFilters;
  onFilterChange: (newFilters: Partial<GalleryFilters>) => void;
  className?: string;
}

// Componente para um grupo de filtros
function FilterGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="border-t border-brand-gray-700 pt-4 mt-4 first:mt-0 first:border-t-0 first:pt-0">
      <h3 className="text-base font-semibold text-white mb-3">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

export function FilterSidebar({ filters, onFilterChange, className }: FilterSidebarProps) {
  
  // Debounce para o campo de busca
  const debouncedSearch = useDebouncedCallback((value) => {
    onFilterChange({ search: value, page: 1 }); // Reseta para a pág 1 na busca
  }, 500);

  // Handler para os checkboxes de array (status, formato)
  const handleCheckboxArrayChange = (
    field: 'status' | 'format', 
    value: string, 
    checked: boolean
  ) => {
    const currentValues = filters[field] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v: string) => v !== value);
    onFilterChange({ [field]: newValues, page: 1 });
  };
  
  return (
    <aside className={className}>
      <div className="sticky top-6 p-6 card-glass-intense rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Filtros</h2>
        
        {/* Filtro de Busca */}
        <FilterGroup title="Busca Textual">
          <Input
            type="text"
            placeholder="Buscar por título ou prompt..."
            className="input-glass text-white"
            defaultValue={filters.search}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </FilterGroup>

        {/* Filtro de Status */}
        <FilterGroup title="Status">
          {Object.values(CreativeStatus.Values).map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status}`}
                checked={filters.status?.includes(status)}
                onCheckedChange={(checked) => handleCheckboxArrayChange('status', status, !!checked)}
              />
              <Label htmlFor={`status-${status}`} className="text-brand-gray-300 capitalize cursor-pointer">
                {status}
              </Label>
            </div>
          ))}
        </FilterGroup>
        
        {/* Filtro de Formato */}
        <FilterGroup title="Formato">
          {Object.entries(FORMAT_LABELS).map(([value, label]) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`format-${value}`}
                checked={filters.format?.includes(value as any)}
                onCheckedChange={(checked) => handleCheckboxArrayChange('format', value, !!checked)}
              />
              <Label htmlFor={`format-${value}`} className="text-brand-gray-300 cursor-pointer">
                {label}
              </Label>
            </div>
          ))}
        </FilterGroup>
      </div>
    </aside>
  );
} 