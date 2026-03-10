import { Product } from "../types/product";

export const products: Product[] = [
  {
    id: 1,
    name: "Remera Sta Monica",
    description: "Remera cuello redondo tipo pupera.",
    price: 19500.00,
    image: "https://i.postimg.cc/25xMh7rX/D_NQ_NP_2X_695467_MLA101110920480_122025_F.jpg",
    images: [
      "https://i.postimg.cc/25xMh7rX/D_NQ_NP_2X_695467_MLA101110920480_122025_F.jpg",
      "https://i.postimg.cc/25xMh7rX/D_NQ_NP_2X_695467_MLA101110920480_122025_F.jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Camiseta",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Beige"],
    inStock: true,
    reviews: [
      { rating: 5, comment: "Muy linda y de buena calidad", user: "María", date: "2026-02-15" },
      { rating: 4, comment: "Buena tela, recomiendo", user: "Sofía", date: "2026-01-20" }
    ]
  },
  {
    id: 2,
    name: "Remera MC Driver Club",
    description: "Remera MC Driver Club, cuello redondo algodón",
    price: 28200.00,
    image: "https://i.postimg.cc/TPcFgJfs/D_NQ_NP_611828_MLA101103761668_122025_O_convertido_de_webp.jpg",
    images: [
      "https://i.postimg.cc/TPcFgJfs/D_NQ_NP_611828_MLA101103761668_122025_O_convertido_de_webp.jpg"
    ],
    category: "Casual",
    gender: "Niño",
    type: "Camiseta",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro"],
    inStock: true,
  },
  {
    id: 3,
    name: "Jean Fly Back",
    description: "Jean elastizado",
    price: 68400.00,
    image: "https://i.postimg.cc/ZKX3R3Lq/Niña_modela_ropa_(9).jpg",
    images: [
      "https://i.postimg.cc/ZKX3R3Lq/Niña_modela_ropa_(9).jpg"
    ],
    category: "Casual",
    gender: "Niño",
    type: "Pantalón",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Azul marino"],
    inStock: true,
  },
  {
    id: 4,
    name: "Jean Total Blue",
    description: "Jean elastizado en color azul.",
    price: 67800.00,
    image: "https://i.postimg.cc/Wbxr3r73/Niña_modela_ropa_(8).jpg",
    images: [
      "https://i.postimg.cc/Wbxr3r73/Niña_modela_ropa_(8).jpg"
    ],
    category: "Casual",
    gender: "Niño",
    type: "Pantalón",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Azul"],
    inStock: true,
    reviews: [
      { rating: 5, comment: "Excelente calidad, muy cómodo", user: "Carlos", date: "2026-03-01" }
    ]
  },
  {
    id: 5,
    name: "Jean Wide Leg Chill",
    description: "Jean de piernas anchas color claro.",
    price: 65400.00,
    image: "https://i.postimg.cc/dtgd1d93/Niña_modela_ropa_(7).jpg",
    images: [
      "https://i.postimg.cc/dtgd1d93/Niña_modela_ropa_(7).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Pantalón",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Azul"],
    inStock: true,
  },
  {
    id: 6,
    name: "Mono Minnie Mouse",
    description: "Mono de algodón con bolsillos, cintura elástica y tiras ajustables.",
    price: 22800.00,
    image: "https://i.postimg.cc/DzTXQTDC/Niña_modelando_ropa.jpg",
    images: [
      "https://i.postimg.cc/DzTXQTDC/Niña_modelando_ropa.jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Conjunto",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Gris"],
    inStock: true,
  },
  {
    id: 7,
    name: "Vestido Minnie Mouse",
    description: "Vestido de algodón estampado con volados en la manga y falda con brillo.",
    price: 31200.00,
    image: "https://i.postimg.cc/8CS6dS3b/Niña_modelando_ropa_(1).jpg",
    images: [
      "https://i.postimg.cc/8CS6dS3b/Niña_modelando_ropa_(1).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Conjunto",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Rosa"],
    inStock: true,
    reviews: [
      { rating: 5, comment: "Mi hija lo ama, muy lindo", user: "Ana", date: "2026-02-28" },
      { rating: 5, comment: "Perfecto para el cumpleañeros", user: "Laura", date: "2026-02-10" }
    ]
  },
  {
    id: 8,
    name: "Pupera Negra Minnie",
    description: "Remera de algodón corta tipo pupera, ancha con estampa en su frente.",
    price: 13800.00,
    image: "https://i.postimg.cc/JzJXBnTQ/Niña_modelando_ropa_(10).jpg",
    images: [
      "https://i.postimg.cc/JzJXBnTQ/Niña_modelando_ropa_(10).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Remera",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro"],
    inStock: true,
  },
  {
    id: 9,
    name: "Campera Spider-Man",
    description: "Campera con diseño original y muy abrigada.",
    price: 100000.00,
    image: "https://i.postimg.cc/5NDv0vm2/Niña_modela_ropa_(10).jpg",
    images: [
      "https://i.postimg.cc/5NDv0vm2/Niña_modela_ropa_(10).jpg"
    ],
    category: "Casual",
    gender: "Niño",
    type: "Abrigo",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro y rojo"],
    inStock: true,
  },
  {
    id: 10,
    name: "Campera Minnie Mouse",
    description: "Campera con diseño original y muy abrigada.",
    price: 100000.00,
    image: "https://i.postimg.cc/J4SJnJQ1/Niña_modela_ropa_(11).jpg",
    images: [
      "https://i.postimg.cc/J4SJnJQ1/Niña_modela_ropa_(11).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Abrigo",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Rosa"],
    inStock: true,
    reviews: [
      { rating: 4, comment: "Muy abrigada, ideal para invierno", user: "Patricia", date: "2026-02-05" }
    ]
  },
  {
    id: 11,
    name: "Campera Frozzen",
    description: "Campera con diseño original y muy abrigada.",
    price: 100000.00,
    image: "https://i.postimg.cc/c4PYHYcd/Niña_modela_ropa_(12).jpg",
    images: [
      "https://i.postimg.cc/c4PYHYcd/Niña_modela_ropa_(12).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Abrigo",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Fantasia"],
    inStock: true,
  },
  {
    id: 12,
    name: "Campera Mickey Mouse",
    description: "Campera con diseño original y muy abrigada.",
    price: 100000.00,
    image: "https://i.postimg.cc/pX38T8BW/Niña_modela_ropa_(13).jpg",
    images: [
      "https://i.postimg.cc/pX38T8BW/Niña_modela_ropa_(13).jpg"
    ],
    category: "Casual",
    gender: "Niño",
    type: "Abrigo",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Gris"],
    inStock: true,
  },
  {
    id: 13,
    name: "Campera Avengers",
    description: "Campera con diseño original y muy abrigada.",
    price: 100000.00,
    image: "https://i.postimg.cc/dtgd1d9F/Niña_modela_ropa_(14).jpg",
    images: [
      "https://i.postimg.cc/dtgd1d9F/Niña_modela_ropa_(14).jpg"
    ],
    category: "Casual",
    gender: "Niño",
    type: "Abrigo",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro"],
    inStock: true,
  },
  {
    id: 14,
    name: "Malla Premium Minnie Mouse",
    description: "Malla de alta calidad con diseño original.",
    price: 31200.00,
    image: "https://i.postimg.cc/sgSWZXnj/Niña_modela_ropa_(2).jpg",
    images: [
      "https://i.postimg.cc/sgSWZXnj/Niña_modela_ropa_(2).jpg"
    ],
    category: "Baño",
    gender: "Niña",
    type: "Mallas",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Rojo"],
    inStock: true,
  },
  {
    id: 15,
    name: "Bikini Premium Minnie Mouse",
    description: "Bikini de alta calidad con diseño original.",
    price: 31200.00,
    image: "https://i.postimg.cc/fRXd0LHw/Niña_modela_ropa_(3).jpg",
    images: [
      "https://i.postimg.cc/fRXd0LHw/Niña_modela_ropa_(3).jpg"
    ],
    category: "Baño",
    gender: "Niña",
    type: "Mallas",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro"],
    inStock: true,
  },
  {
    id: 16,
    name: "Top y Calza Stone",
    description: "Top y calza de lycra para un look moderno.",
    price: 24000.00,
    image: "https://i.postimg.cc/m2KMDMS1/Niña_modela_ropa_(4).jpg",
    images: [
      "https://i.postimg.cc/m2KMDMS1/Niña_modela_ropa_(4).jpg"
    ],
    category: "Deportivo",
    gender: "Niña",
    type: "Conjunto",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Azul"],
    inStock: true,
  },
  {
    id: 17,
    name: "Pollera Jean",
    description: "Pollera de jean para un look moderno.",
    price: 33000.00,
    image: "https://i.postimg.cc/MKgRTRYn/Niña_modela_ropa_(5).jpg",
    images: [
      "https://i.postimg.cc/MKgRTRYn/Niña_modela_ropa_(5).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Pantalón",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Azul"],
    inStock: true,
  },
  {
    id: 18,
    name: "Bermuda Korea",
    description: "Bermuda de gabardina para un look moderno.",
    price: 36750.00,
    image: "https://i.postimg.cc/tC8PTPzY/Niña_modela_ropa_(6).jpg",
    images: [
      "https://i.postimg.cc/tC8PTPzY/Niña_modela_ropa_(6).jpg"
    ],
    category: "Casual",
    gender: "Niño",
    type: "Pantalón",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Beige"],
    inStock: true,
  },
  {
    id: 19,
    name: "Calza Biker Minnie Mouse",
    description: "Calza ciclista de algodón y lycra con estampado en una pierna.",
    price: 15000.00,
    image: "https://i.postimg.cc/GmYDs2MY/Niña_modelando_ropa_(11).jpg",
    images: [
      "https://i.postimg.cc/GmYDs2MY/Niña_modelando_ropa_(11).jpg"
    ],
    category: "Deportivo",
    gender: "Niña",
    type: "Pantalón",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Gris"],
    inStock: true,
  },
  {
    id: 20,
    name: "Top y Calza Minnie Mouse",
    description: "Top y calza de lycra para un look moderno.",
    price: 27600.00,
    image: "https://i.postimg.cc/htxm7jCd/Niña_modelando_ropa_(12).jpg",
    images: [
      "https://i.postimg.cc/htxm7jCd/Niña_modelando_ropa_(12).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Conjunto",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Turquesa"],
    inStock: true,
  },
  {
    id: 21,
    name: "Top y Calza Mickey Mouse",
    description: "Top y calza de lycra para un look moderno.",
    price: 27600.00,
    image: "https://i.postimg.cc/DwsGbZCb/Niña_modelando_ropa_(13).jpg",
    images: [
      "https://i.postimg.cc/DwsGbZCb/Niña_modelando_ropa_(13).jpg"
    ],
    category: "Casual",
    gender: "Niño",
    type: "Conjunto",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Multicolor"],
    inStock: true,
  },
  {
    id: 22,
    name: "Top Minnie Mouse",
    description: "Top sublimado de microfibra a rayas.",
    price: 18000.00,
    image: "https://i.postimg.cc/9QT9qMxw/Niña_modelando_ropa_(14).jpg",
    images: [
      "https://i.postimg.cc/9QT9qMxw/Niña_modelando_ropa_(14).jpg"
    ],
    category: "Deportivo",
    gender: "Niña",
    type: "Remeras",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Multicolor"],
    inStock: true,
  },
  {
    id: 23,
    name: "Calza y top Minnie Mouse",
    description: "Top y calza sublimado de microfibra.",
    price: 27800.00,
    image: "https://i.postimg.cc/VkMtb67S/Niña_modelando_ropa_(15).jpg",
    images: [
      "https://i.postimg.cc/VkMtb67S/Niña_modelando_ropa_(15).jpg"
    ],
    category: "Deportivo",
    gender: "Niña",
    type: "Conjunto",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Violeta"],
    inStock: true,
  },
  {
    id: 24,
    name: "Remera Mickey Mouse",
    description: "Remera manga corta superpuestas con aplique de strass.",
    price: 18000.00,
    image: "https://i.postimg.cc/y89RSdfW/Niña_modelando_ropa_(16).jpg",
    images: [
      "https://i.postimg.cc/y89RSdfW/Niña_modelando_ropa_(16).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Remeras",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro"],
    inStock: true,
  },
  {
    id: 25,
    name: "Remera Minnie Mouse",
    description: "Remera manga corta con aplique en frente con brillos.",
    price: 18000.00,
    image: "https://i.postimg.cc/Hk5M7xSn/Niña_modelando_ropa_(17).jpg",
    images: [
      "https://i.postimg.cc/Hk5M7xSn/Niña_modelando_ropa_(17).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Remeras",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Gris"],
    inStock: true,
  },
  {
    id: 26,
    name: "Remera Disney",
    description: "Remera estampada con glitter y manga superpuesta.",
    price: 18000.00,
    image: "https://i.postimg.cc/52vzF0PN/Niña_modelando_ropa_(18).jpg",
    images: [
      "https://i.postimg.cc/52vzF0PN/Niña_modelando_ropa_(18).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Remeras",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Rosa"],
    inStock: true,
  },
  {
    id: 27,
    name: "Remera Stitch Oversize",
    description: "Remera mangas cortas oversize, cuello redondo y estampas del personaje en la parte de adelante.",
    price: 21000.00,
    image: "https://i.postimg.cc/QM3Tg3PJ/Niña_modelando_ropa_(2).jpg",
    images: [
      "https://i.postimg.cc/QM3Tg3PJ/Niña_modelando_ropa_(2).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Remeras",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Rosa"],
    inStock: true,
  },
  {
    id: 28,
    name: "Remera Pupera Minnie Mouse",
    description: "Remera de algodón, cuello redondo, mangas cortas anchas y estampa en la parte delantera.",
    price: 13800.00,
    image: "https://i.postimg.cc/GpCyPCNJ/Niña_modelando_ropa_(3).jpg",
    images: [
      "https://i.postimg.cc/GpCyPCNJ/Niña_modelando_ropa_(3).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Remeras",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Multicolor"],
    inStock: true,
  },
  {
    id: 29,
    name: "Musculosa Minnie Mouse",
    description: "Musculosa de algodón ancha con flecos en su parte inferior y estampa con brillos en el frente.",
    price: 18000.00,
    image: "https://i.postimg.cc/yNHZhH5h/Niña_modelando_ropa_(6).jpg",
    images: [
      "https://i.postimg.cc/yNHZhH5h/Niña_modelando_ropa_(6).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Remeras",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Rosa"],
    inStock: true,
  },
  {
    id: 30,
    name: "Musculosa Mickey & Minnie",
    description: "Musculosa algodón, estampada, cuello redondo, volados a los laterales.",
    price: 18000.00,
    image: "https://i.postimg.cc/qvnKCRmm/Niña_modelando_ropa_(7).jpg",
    images: [
      "https://i.postimg.cc/qvnKCRmm/Niña_modelando_ropa_(7).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Remeras",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Rosa"],
    inStock: true,
  },
  {
    id: 31,
    name: "Remera Stitch MC",
    description: "Remera de algodón, manga corta, cuello redondo y estampa grande en su frente.",
    price: 21000.00,
    image: "https://i.postimg.cc/4xtchd8B/Niña_modelando_ropa_(8).jpg",
    images: [
      "https://i.postimg.cc/4xtchd8B/Niña_modelando_ropa_(8).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Remeras",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Blanco"],
    inStock: true,
  },
  {
    id: 32,
    name: "Remera Minnie Mouse MC",
    description: "Remera estampada con glitter y cuello redondo.",
    price: 18000.00,
    image: "https://i.postimg.cc/pL8jnT0k/Niña_modelando_ropa_(9).jpg",
    images: [
      "https://i.postimg.cc/pL8jnT0k/Niña_modelando_ropa_(9).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Remeras",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Verde"],
    inStock: true,
  },
  {
    id: 33,
    name: "Chaleco Minnie Mouse",
    description: "Chaleco impermeable y abrigado.",
    price: 100000.00,
    image: "https://i.postimg.cc/RhNTTVjm/Niña_modela_ropa_(15).jpg",
    images: [
      "https://i.postimg.cc/RhNTTVjm/Niña_modela_ropa_(15).jpg"
    ],
    category: "Casual",
    gender: "Niña",
    type: "Campera",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Azul"],
    inStock: true,
  },
  {
    id: 34,
    name: "Chaleco Avengers",
    description: "Chaleco impermeable y abrigado.",
    price: 100000.00,
    image: "https://i.postimg.cc/Fz7xxs24/Niña_modela_ropa_(16).jpg",
    images: [
      "https://i.postimg.cc/Fz7xxs24/Niña_modela_ropa_(16).jpg"
    ],
    category: "Casual",
    gender: "Niño",
    type: "Campera",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro"],
    inStock: true,
  },
];
