import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { SearchFilters } from "../components/SearchFilters";
import { SearchFiltersMobile } from "../components/SearchFiltersMobile";
import { ProductGrid } from "../components/ProductGrid";
import { products as allProducts } from "../data/products";
import { Product } from "../types/product";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

function shuffleArray< T >(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function HomePage() {
  const location = useLocation();

  const [shuffledProducts] = useState< Product[] >(() => shuffleArray(allProducts));

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedGenders, setSelectedGenders] = useState< string[] >([]);
  const [selectedTypes, setSelectedTypes] = useState< string[] >([]);
  const [sortBy, setSortBy] = useState< string >("relevancia");

  const productsRef = useRef< HTMLDivElement >(null);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/ninos") {
      setSelectedGenders(["Niño", "Niña"]);
    } else if (path === "/adultos") {
      setSelectedGenders(["Hombre", "Mujer"]);
    } else {
      setSelectedGenders([]);
    }
  }, [location.pathname]);

  useEffect(() => {
    const path = location.pathname;
    if ((path === "/ninos" || path === "/adultos") && productsRef.current) {
      setTimeout(() => {
        productsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [selectedGenders, location.pathname]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const filteredProducts = useMemo(() => {
    let filtered = shuffledProducts.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "Todas" || product.category === selectedCategory;

      const matchesGender =
        selectedGenders.length === 0 || selectedGenders.includes(product.gender);

      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(product.type);

      return matchesSearch && matchesCategory && matchesGender && matchesType;
    });

    // Apply sorting
    switch (sortBy) {
      case "precio-asc":
        filtered = filtered.sort((a, b) => a.purchasePrice - b.purchasePrice);
        break;
      case "precio-desc":
        filtered = filtered.sort((a, b) => b.purchasePrice - a.purchasePrice);
        break;
      case "nombre":
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "relevancia":
      default:
        // Keep original shuffle order
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedGenders, selectedTypes, sortBy]);

  return (
    <div>
      {/* Mobile Filters */}      <SearchFiltersMobile
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedGenders={selectedGenders}
        onGenderChange={setSelectedGenders}
        selectedTypes={selectedTypes}
        onTypeToggle={handleTypeToggle}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        totalResults={filteredProducts.length}
      />

      {/* Desktop Filters and Products */}
      <div className="flex hidden md:flex" ref={productsRef}>
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedGenders={selectedGenders}
          onGenderChange={setSelectedGenders}
          selectedTypes={selectedTypes}
          onTypeToggle={handleTypeToggle}
        />

        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} encontrado{filteredProducts.length !== 1 ? "s" : ""}
            </p>            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Ordenar:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>                  <SelectItem value="relevancia">Relevancia</SelectItem>
                  <SelectItem value="precio-asc">Menor precio</SelectItem>                  <SelectItem value="precio-desc">Mayor precio</SelectItem>
                  <SelectItem value="nombre">Nombre A- Z</SelectItem>
                </SelectContent>
              </Select>            </div>
          </div>
          <ProductGrid products={filteredProducts} />
        </main>
      </div>

      {/* Mobile Products Grid - full width without sidebar */}      <div className="md:hidden p-4" ref={productsRef}>
        <p className="text-sm text-gray-600 mb-4">
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} encontrado{filteredProducts.length !== 1 ? "s" : ""}
        </p>
        <ProductGrid products={filteredProducts} />
      </div>

      <footer className="bg-gray-900 text-gray-400 py-4 px-6 text-center text-sm">
        *El precio indicado es el descuento que se hace al realizar la compra por transferencia, para más detalles póngase en contacto con nosotros
      </footer>
    </div>
  );
}