import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { SearchFilters } from "../components/SearchFilters";
import { ProductGrid } from "../components/ProductGrid";
import { products } from "../data/products";

export function HomePage() {
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  const productsRef = useRef<HTMLDivElement>(null);

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
    return products.filter((product) => {
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
  }, [searchQuery, selectedCategory, selectedGenders, selectedTypes]);

  return (
    <div>
      {/* Filtros y Productos */}
      <div className="flex" ref={productsRef}>
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
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} encontrado{filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </div>
          <ProductGrid products={filteredProducts} />
        </main>
      </div>
    </div>
  );
}
