import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router";
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
      {/* Secciones Niños y Adultos */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <Link 
          to="/ninos" 
          className="relative group cursor-pointer block overflow-hidden rounded-lg"
        >
          <img 
            src="https://i.postimg.cc/nzVKDpSv/stone_kids.png" 
            alt="Niños" 
            className="w-full h-96 md:h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white text-2xl md:text-3xl font-bold">NIÑOS</span>
          </div>
        </Link>
        
        <Link 
          to="/adultos" 
          className="relative group cursor-pointer block overflow-hidden rounded-lg"
        >
          <img 
            src="https://i.postimg.cc/tTRdxpvZ/stone_adultos.jpg" 
            alt="Adultos" 
            className="w-full h-96 md:h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white text-2xl md:text-3xl font-bold">ADULTOS</span>
          </div>
        </Link>
      </div>

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
