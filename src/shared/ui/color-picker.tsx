"use client";

import { useState, useCallback } from "react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Palette, Copy, Check, RotateCcw } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultColors?: string[];
}

const DEFAULT_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Purple
  '#98D8C8', // Mint
  '#FFB347', // Orange
  '#F7DC6F', // Light Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9', // Light Blue
  '#82E0AA', // Light Green
  '#F8C471', // Light Orange
  '#F1948A', // Light Pink
  '#D5DBDB', // Light Gray
  '#2C3E50', // Dark Blue
  '#34495E', // Dark Gray
  '#E74C3C', // Bright Red
  '#3498DB', // Bright Blue
  '#2ECC71', // Bright Green
];

export function ColorPicker({
  value = "",
  onChange,
  label,
  placeholder = "#000000",
  disabled = false,
  className,
  defaultColors = DEFAULT_COLORS,
}: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Valida se a cor está no formato HEX válido
  const isValidHex = useCallback((color: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }, []);

  // Normaliza a cor HEX (adiciona # se não tiver)
  const normalizeHex = useCallback((color: string) => {
    if (!color) return "";
    
    const cleaned = color.replace(/[^A-Fa-f0-9]/g, "");
    
    if (cleaned.length === 3) {
      return `#${cleaned}`;
    } else if (cleaned.length === 6) {
      return `#${cleaned}`;
    }
    
    return color;
  }, []);

  // Atualiza a cor quando o input muda
  const handleInputChange = useCallback((newValue: string) => {
    setInputValue(newValue);
    
    const normalized = normalizeHex(newValue);
    if (isValidHex(normalized)) {
      onChange(normalized);
    }
  }, [onChange, normalizeHex, isValidHex]);

  // Seleciona uma cor predefinida
  const selectColor = useCallback((color: string) => {
    setInputValue(color);
    onChange(color);
    setIsOpen(false);
  }, [onChange]);

  // Copia cor para clipboard
  const copyColor = useCallback(async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar cor:', error);
    }
  }, []);

  // Limpa a cor
  const clearColor = useCallback(() => {
    setInputValue("");
    onChange("");
  }, [onChange]);

  const currentColor = isValidHex(inputValue) ? inputValue : (isValidHex(value) ? value : "#000000");
  const hasValidColor = isValidHex(inputValue || value);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-white font-medium">{label}</Label>
      )}
      
      <div className="flex items-center space-x-2">
        {/* Color Preview + Picker */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              disabled={disabled}
              className={cn(
                "w-12 h-12 p-0 border-2 border-brand-gray-600 rounded-lg overflow-hidden transition-all duration-200",
                "hover:border-brand-neon-green focus:border-brand-neon-green focus:ring-2 focus:ring-brand-neon-green/20",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              style={{ backgroundColor: hasValidColor ? currentColor : '#1a1a1a' }}
            >
              {!hasValidColor && (
                <Palette className="w-5 h-5 text-brand-gray-400" />
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-72 p-4 bg-brand-gray-800 border-brand-gray-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">Selecione uma cor</h4>
                {hasValidColor && (
                  <Button
                    type="button"
                    onClick={clearColor}
                    className="h-6 px-2 text-xs bg-transparent hover:bg-brand-gray-700 text-brand-gray-400"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
              
              {/* Cores Predefinidas */}
              <div className="grid grid-cols-8 gap-2">
                {defaultColors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-md border-2 transition-all duration-200",
                      "hover:scale-110 hover:border-white",
                      currentColor === color 
                        ? "border-brand-neon-green ring-2 ring-brand-neon-green/50" 
                        : "border-brand-gray-600"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              
              {/* Cor Atual */}
              {hasValidColor && (
                <div className="flex items-center justify-between p-3 bg-brand-gray-900 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded border border-brand-gray-600"
                      style={{ backgroundColor: currentColor }}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{currentColor.toUpperCase()}</p>
                      <p className="text-xs text-brand-gray-400">Cor selecionada</p>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={() => copyColor(currentColor)}
                    className="h-8 px-3 bg-transparent hover:bg-brand-gray-700 text-brand-gray-400"
                  >
                    {copiedColor === currentColor ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Input HEX */}
        <div className="flex-1">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "input-glass h-12 text-white font-mono",
              !hasValidColor && inputValue && "border-red-500 focus:border-red-500"
            )}
            maxLength={7}
          />
          
          {inputValue && !hasValidColor && (
            <p className="text-xs text-red-400 mt-1">
              Formato inválido. Use #000000 ou #000
            </p>
          )}
        </div>

        {/* Copy Button */}
        {hasValidColor && (
          <Button
            type="button"
            onClick={() => copyColor(currentColor)}
            disabled={disabled}
            className="h-12 px-3 bg-transparent border border-brand-gray-600 hover:border-brand-neon-green hover:bg-brand-gray-800 text-brand-gray-400"
          >
            {copiedColor === currentColor ? (
              <Check className="w-4 h-4 text-brand-neon-green" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* Color Info */}
      {hasValidColor && (
        <div className="flex items-center space-x-2 text-xs text-brand-gray-400">
          <div 
            className="w-3 h-3 rounded border border-brand-gray-600"
            style={{ backgroundColor: currentColor }}
          />
          <span>RGB: {hexToRgb(currentColor)}</span>
        </div>
      )}
    </div>
  );
}

// Utilitário para converter HEX para RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "Inválido";
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r}, ${g}, ${b}`;
} 