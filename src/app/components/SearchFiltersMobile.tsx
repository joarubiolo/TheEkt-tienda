import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from "./ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface SearchFiltersMobileProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedGenders: string[];
  onGenderChange: (genders: string[]) => void;
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  totalResults: number;
}

const categories = ["Todas", "Casual", "Formal", "Deportivo"];
const genders = ["Hombre", "Mujer", "Niño", "Niña"];
const types = ["Pantalón", "Conjunto", "Remera", "Abrigo", "Mallas", "Zapatillas"];

export function SearchFiltersMobile({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedGenders,
  onGenderChange,
  selectedTypes,
  onTypeToggle,
  sortBy,
  onSortByChange,
  totalResults,
}: SearchFiltersMobileProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount =
    (selectedCategory !== "Todas" ? 1 : 0) +
    selectedGenders.length +
    selectedTypes.length;

  const handleGenderToggle = (gender: string) => {
    if (selectedGenders.includes(gender)) {
      onGenderChange(selectedGenders.filter((g) => g !== gender));
    } else {
      onGenderChange([...selectedGenders, gender]);
    }
  };

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeToggle(type);
    } else {
      onTypeToggle(type);
    }
  };

  const clearAllFilters = () => {
    onSearchChange("");
    onCategoryChange("Todas");
    onGenderChange([]);
    onSortByChange("relevancia");
    onTypeToggle("");
  };

  return (
    <div className="md:hidden sticky top-0 z-30 bg-white border-b px-4 py-3">
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-gray-100 border-transparent"
          />
        </div>

        {/* Filters Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative shrink-0">
              <SlidersHorizontal className="w-4 h-4 mr-1" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg font-semibold">Filtros</SheetTitle>
                <SheetClose asChild>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </SheetClose>
              </div>
            </SheetHeader>

            <div className="py-4 space-y-6">
              {/* Categoría */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Categoría</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => onCategoryChange(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Género */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Género</Label>
                <div className="flex flex-wrap gap-2">
                  {genders.map((gender) => (
                    <button
                      key={gender}
                      onClick={() => handleGenderToggle(gender)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedGenders.includes(gender)
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Tipo</Label>
                <div className="flex flex-wrap gap-2">
                  {types.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeToggle(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedTypes.includes(type)
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ordenar */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Ordenar</Label>
                <Select value={sortBy} onValueChange={onSortByChange}>
                  <SelectTrigger className="w-full bg-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevancia">Relevancia</SelectItem>
                    <SelectItem value="precio-asc">Menor precio</SelectItem>
                    <SelectItem value="precio-desc">Mayor precio</SelectItem>
                    <SelectItem value="nombre">Nombre A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SheetFooter className="flex-row gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearAllFilters}
              >
                Limpiar
              </Button>
              <Button
                className="flex-1 bg-gray-900 hover:bg-gray-800"
                onClick={() => setIsOpen(false)}
              >
                Ver {totalResults}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}