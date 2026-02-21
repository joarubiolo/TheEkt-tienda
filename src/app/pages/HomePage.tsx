import { useState, useMemo } from "react";
import { SearchFilters } from "../components/SearchFilters";
import { ProductGrid } from "../components/ProductGrid";
import { products } from "../data/products";

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedGender, setSelectedGender] = useState("Todos");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filtro de búsqueda
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro de categoría
      const matchesCategory =
        selectedCategory === "Todas" || product.category === selectedCategory;

      // Filtro de género
      const matchesGender =
        selectedGender === "Todos" || product.gender === selectedGender || product.gender === "Unisex";

      // Filtro de tipo
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(product.type);

      return matchesSearch && matchesCategory && matchesGender && matchesType;
    });
  }, [searchQuery, selectedCategory, selectedGender, selectedTypes]);

  return (
    <div className="flex">
      {/* Sidebar con filtros */}
      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedGender={selectedGender}
        onGenderChange={setSelectedGender}
        selectedTypes={selectedTypes}
        onTypeToggle={handleTypeToggle}
      />

      {/* Grid de productos */}
      <main className="flex-1 p-8">
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} encontrado{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <ProductGrid products={filteredProducts} />
      </main>
    </div>
  );
}
