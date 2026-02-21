import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedGender: string;
  onGenderChange: (value: string) => void;
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedGender,
  onGenderChange,
  selectedTypes,
  onTypeToggle,
}: SearchFiltersProps) {
  const categories = ["Todas", "Casual", "Formal", "Deportivo"];
  const genders = ["Todos", "Hombre", "Mujer", "Unisex"];
  const types = ["Camiseta", "Pantalón", "Sudadera", "Vestido", "Camisa", "Chaqueta", "Calzado", "Blusa"];

  return (
    <div className="w-64 shrink-0 border-r border-gray-200 p-6 space-y-8">
      {/* Búsqueda */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-700">Buscar</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-white border-gray-200"
          />
        </div>
      </div>

      {/* Categoría */}
      <div className="space-y-3">
        <Label className="text-sm text-gray-700">Categoría</Label>
        <RadioGroup value={selectedCategory} onValueChange={onCategoryChange}>
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <RadioGroupItem value={category} id={`category-${category}`} />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm text-gray-600 cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Género */}
      <div className="space-y-3">
        <Label className="text-sm text-gray-700">Género</Label>
        <RadioGroup value={selectedGender} onValueChange={onGenderChange}>
          {genders.map((gender) => (
            <div key={gender} className="flex items-center space-x-2">
              <RadioGroupItem value={gender} id={`gender-${gender}`} />
              <Label
                htmlFor={`gender-${gender}`}
                className="text-sm text-gray-600 cursor-pointer"
              >
                {gender}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Tipo de Ropa */}
      <div className="space-y-3">
        <Label className="text-sm text-gray-700">Tipo de Ropa</Label>
        <div className="space-y-2">
          {types.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => onTypeToggle(type)}
              />
              <Label
                htmlFor={`type-${type}`}
                className="text-sm text-gray-600 cursor-pointer"
              >
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
