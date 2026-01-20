import { useMemo, useState, useEffect } from "react";
import { products as PRODUCTS, categories as CATEGORIES, banners as BANNERS } from "./data/products";

export default function App() {
  const [currentView, setCurrentView] = useState("home"); // home, products
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("none");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);

  // Page loader
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Banner carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Dark mode
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) setDarkMode(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const allCategories = useMemo(() => {
    const unique = Array.from(new Set(PRODUCTS.map((p) => p.category)));
    return ["All", ...unique];
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...PRODUCTS];
    if (selectedCategory !== "All") list = list.filter((p) => p.category === selectedCategory);
    if (query.trim()) list = list.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [query, selectedCategory, sort]);

  const dealsProducts = PRODUCTS.filter(p => p.badge === "Deal" || p.badge === "Bestseller").slice(0, 6);
  const trendingProducts = PRODUCTS.filter(p => p.badge === "Trending" || p.badge === "New").slice(0, 6);

  function addToCart(product) {
    if (!product.inStock) return;
    setCart((prev) => {
      const found = prev.find((x) => x.id === product.id);
      if (found) return prev.map((x) => x.id === product.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { ...product, qty: 1 }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 400);
  }

  function incQty(id) {
    setCart((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  }

  function decQty(id) {
    setCart((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x)).filter((x) => x.qty > 0));
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((x) => x.id !== id));
  }

  function handleCategoryClick(categoryName) {
    setSelectedCategory(categoryName);
    setCurrentView("products");
    window.scrollTo(0, 0);
  }

  function handleShopNow() {
    setSelectedCategory("All");
    setCurrentView("products");
    window.scrollTo(0, 0);
  }

  function goHome() {
    setCurrentView("home");
    setSelectedCategory("All");
    setQuery("");
    window.scrollTo(0, 0);
  }

  function placeOrder() {
    setOrderPlaced(true);
    setTimeout(() => {
      setCart([]);
      setIsCheckoutOpen(false);
      setOrderPlaced(false);
    }, 3000);
  }

  const totalItems = cart.reduce((sum, x) => sum + x.qty, 0);
  const totalPrice = cart.reduce((sum, x) => sum + x.qty * x.price, 0);
  const discount = Math.round(totalPrice * 0.1);
  const finalPrice = totalPrice - discount;

  // Loading Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.7s'}}></div>
            <div className="absolute inset-0 flex items-center justify-center text-3xl">🛒</div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">NexaShop</h2>
          <p className="text-cyan-400 text-sm animate-pulse">Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0a0a0f] text-white' : 'bg-gray-100 text-gray-900'}`}>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white text-center py-2 text-sm font-medium">
        <span className="animate-pulse">🔥</span> GRAND SALE LIVE — Up to 80% Off + Free Delivery on First Order <span className="animate-pulse">🔥</span>
      </div>

      {/* Navbar */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${darkMode ? 'bg-[#131318]/95 border-white/5' : 'bg-white/95 border-gray-200'}`}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={goHome}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">N</div>
              <span className="text-xl font-bold hidden sm:block">
                <span className="text-orange-400">Nexa</span>Shop
              </span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); if(e.target.value) setCurrentView("products"); }}
                  placeholder="Search for products, brands and more..."
                  className={`w-full rounded-xl border-2 pl-12 pr-4 py-3 text-sm outline-none transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-orange-500 focus:bg-white/10' : 'bg-gray-100 border-gray-200 focus:border-orange-500'}`}
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => setDarkMode(!darkMode)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}>
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                <span>🛒</span>
                <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <span className={`absolute -right-2 -top-2 w-6 h-6 rounded-full bg-cyan-500 text-xs font-bold flex items-center justify-center shadow-lg ${addedId ? 'animate-pop' : ''}`}>
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* HOME VIEW */}
      {currentView === "home" && (
        <main className="relative">
          {/* Hero Banner Carousel */}
          <section className="relative h-[400px] md:h-[500px] overflow-hidden">
            {BANNERS.map((banner, idx) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-all duration-700 ${idx === currentBanner ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              >
                <img src={banner.img} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                <div className="absolute inset-0 flex items-center">
                  <div className="mx-auto max-w-7xl px-4 w-full">
                    <div className="max-w-xl">
                      <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">{banner.title}</h1>
                      <p className="text-lg md:text-xl text-gray-200 mb-6">{banner.subtitle}</p>
                      <button onClick={handleShopNow} className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        {banner.cta} →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Banner Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {BANNERS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${idx === currentBanner ? 'bg-orange-500 w-8' : 'bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </section>

          {/* Category Cards */}
          <section className={`py-12 ${darkMode ? 'bg-[#0f0f14]' : 'bg-white'}`}>
            <div className="mx-auto max-w-7xl px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
                <span>🛍️</span> Shop by Category
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`group relative cursor-pointer rounded-2xl overflow-hidden h-48 transition-all hover:scale-[1.02] hover:shadow-2xl ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}
                  >
                    <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-70`}></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                      <span className="text-4xl mb-2">{cat.icon}</span>
                      <h3 className="text-lg font-bold text-center">{cat.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Deals Section */}
          <section className={`py-12 ${darkMode ? 'bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10' : 'bg-gradient-to-r from-orange-50 to-pink-50'}`}>
            <div className="mx-auto max-w-7xl px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <span>⚡</span> Today's Best Deals
                </h2>
                <button onClick={handleShopNow} className="text-orange-500 font-semibold hover:underline">View All →</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {dealsProducts.map((p) => (
                  <ProductCard key={p.id} product={p} darkMode={darkMode} addToCart={addToCart} addedId={addedId} compact />
                ))}
              </div>
            </div>
          </section>

          {/* Shop All Banner */}
          <section className="py-12">
            <div className="mx-auto max-w-7xl px-4">
              <div className={`rounded-3xl overflow-hidden relative ${darkMode ? 'bg-gradient-to-r from-purple-600 to-cyan-600' : 'bg-gradient-to-r from-purple-500 to-cyan-500'}`}>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
                  <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
                </div>
                <div className="relative py-16 px-8 text-center text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Complete Collection</h2>
                  <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                    Discover 30+ premium products across 8 categories. From tech gadgets to fashion essentials.
                  </p>
                  <button onClick={handleShopNow} className="px-10 py-4 rounded-xl bg-white text-purple-600 font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    🛒 Shop All Products
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Trending Section */}
          <section className={`py-12 ${darkMode ? 'bg-[#0f0f14]' : 'bg-white'}`}>
            <div className="mx-auto max-w-7xl px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <span>🔥</span> Trending Now
                </h2>
                <button onClick={handleShopNow} className="text-orange-500 font-semibold hover:underline">View All →</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {trendingProducts.map((p) => (
                  <ProductCard key={p.id} product={p} darkMode={darkMode} addToCart={addToCart} addedId={addedId} compact />
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className={`py-12 border-t ${darkMode ? 'border-white/5' : 'border-gray-200'}`}>
            <div className="mx-auto max-w-7xl px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: "🚚", title: "Free Delivery", desc: "On orders above ₹499" },
                  { icon: "↩️", title: "Easy Returns", desc: "7 days return policy" },
                  { icon: "🔒", title: "Secure Payment", desc: "100% secure checkout" },
                  { icon: "📞", title: "24/7 Support", desc: "Dedicated support team" },
                ].map((f, i) => (
                  <div key={i} className="text-center">
                    <div className="text-4xl mb-3">{f.icon}</div>
                    <h3 className="font-bold mb-1">{f.title}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* PRODUCTS VIEW */}
      {currentView === "products" && (
        <main className="mx-auto max-w-7xl px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <button onClick={goHome} className="text-orange-500 hover:underline">Home</button>
            <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>/</span>
            <span>{selectedCategory === "All" ? "All Products" : selectedCategory}</span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              {allCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === c
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                    : darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={`ml-auto rounded-xl border px-4 py-2 text-sm outline-none ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'}`}
            >
              <option value="none">Sort By</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* Products Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{selectedCategory === "All" ? "All Products" : selectedCategory}</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{filteredProducts.length} products</p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} darkMode={darkMode} addToCart={addToCart} addedId={addedId} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Try different search terms or filters</p>
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className={`border-t mt-12 ${darkMode ? 'bg-[#0a0a0f] border-white/5' : 'bg-gray-900 border-gray-800'}`}>
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {[
              { title: "Shop", items: ["Technology", "Fashion", "Home", "Beauty", "Gaming"] },
              { title: "Support", items: ["Help Center", "Track Order", "Returns", "Contact"] },
              { title: "Company", items: ["About Us", "Careers", "Press", "Blog"] },
              { title: "Legal", items: ["Privacy Policy", "Terms", "Cookies"] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-bold mb-4 text-orange-400">{section.title}</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  {section.items.map((item) => (
                    <li key={item} className="hover:text-white cursor-pointer">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/5 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold">N</div>
              <span className="text-lg font-bold text-white"><span className="text-orange-400">Nexa</span>Shop</span>
            </div>
            <p className="text-sm text-gray-500">© 2026 NexaShop. Built with React + Tailwind CSS</p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className={`absolute right-0 top-0 h-full w-full max-w-md shadow-2xl animate-slideIn ${darkMode ? 'bg-[#12121a]' : 'bg-white'}`}>
            <div className="flex flex-col h-full">
              <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <h3 className="text-xl font-bold">🛒 Cart ({totalItems})</h3>
                <button onClick={() => setIsCartOpen(false)} className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100'}`}>✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛒</div>
                    <p className="font-medium mb-2">Your cart is empty</p>
                    <button onClick={() => { setIsCartOpen(false); handleShopNow(); }} className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold">
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className={`flex gap-4 p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <img src={item.img} alt={item.title} className="w-20 h-20 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</p>
                        <p className="text-orange-500 font-bold">₹{item.price.toLocaleString()}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className={`flex items-center rounded-lg overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                            <button onClick={() => decQty(item.id)} className="w-8 h-8">-</button>
                            <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                            <button onClick={() => incQty(item.id)} className="w-8 h-8">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-400 text-sm">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className={`border-t p-5 ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span>₹{totalPrice.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm text-green-400"><span>Discount (10%)</span><span>-₹{discount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Delivery</span><span className="text-green-400">FREE</span></div>
                    <div className={`flex justify-between font-bold text-lg pt-2 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                      <span>Total</span><span className="text-orange-500">₹{finalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !orderPlaced && setIsCheckoutOpen(false)}></div>
          <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl ${darkMode ? 'bg-[#12121a]' : 'bg-white'}`}>
            {orderPlaced ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 text-5xl">✓</div>
                <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Thank you for shopping with NexaShop</p>
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-pink-500/10">
                  <p className="text-sm text-orange-400">Order #NX{Date.now().toString().slice(-8)}</p>
                </div>
              </div>
            ) : (
              <>
                <div className={`p-6 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <h2 className="text-xl font-bold">📦 Checkout</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Delivery Address</label>
                    <input placeholder="Enter your full address" className={`w-full mt-2 px-4 py-3 rounded-xl border-2 outline-none ${darkMode ? 'bg-white/5 border-white/10 focus:border-orange-500' : 'bg-gray-50 border-gray-200 focus:border-orange-500'}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">City</label>
                      <input placeholder="City" className={`w-full mt-2 px-4 py-3 rounded-xl border-2 outline-none ${darkMode ? 'bg-white/5 border-white/10 focus:border-orange-500' : 'bg-gray-50 border-gray-200 focus:border-orange-500'}`} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">PIN Code</label>
                      <input placeholder="226001" className={`w-full mt-2 px-4 py-3 rounded-xl border-2 outline-none ${darkMode ? 'bg-white/5 border-white/10 focus:border-orange-500' : 'bg-gray-50 border-gray-200 focus:border-orange-500'}`} />
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className="text-sm text-gray-400 mb-1">Payment: Cash on Delivery</p>
                    <div className="flex justify-between font-bold">
                      <span>Total</span><span className="text-orange-500">₹{finalPrice.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">You save ₹{discount.toLocaleString()}!</p>
                  </div>
                </div>
                <div className={`p-6 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <button onClick={placeOrder} className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                    Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ product: p, darkMode, addToCart, addedId, compact }) {
  return (
    <div className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${darkMode ? 'bg-white/5 hover:bg-white/10 border border-white/5' : 'bg-white border border-gray-200'}`}>
      {p.badge && (
        <div className={`absolute top-2 left-2 z-10 px-2 py-1 rounded text-xs font-bold ${
          p.badge === 'Bestseller' ? 'bg-orange-500 text-white' :
          p.badge === 'Deal' ? 'bg-red-500 text-white' :
          p.badge === 'New' ? 'bg-green-500 text-white' :
          p.badge === 'Trending' ? 'bg-purple-500 text-white' :
          'bg-cyan-500 text-white'
        }`}>{p.badge}</div>
      )}
      <div className={`relative ${compact ? 'h-32' : 'h-40'} overflow-hidden`}>
        <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </div>
      <div className={compact ? 'p-3' : 'p-4'}>
        <h3 className={`font-semibold mb-1 line-clamp-2 ${compact ? 'text-xs' : 'text-sm'}`}>{p.title}</h3>
        <div className="flex items-center gap-1 mb-2">
          <span className="px-1.5 py-0.5 rounded bg-green-500 text-white text-xs font-bold">{p.rating}★</span>
          <span className="text-xs text-gray-500">({(p.reviews/1000).toFixed(1)}k)</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-bold text-orange-500 ${compact ? 'text-sm' : 'text-lg'}`}>₹{p.price.toLocaleString()}</span>
          <span className={`line-through text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>₹{p.originalPrice.toLocaleString()}</span>
          <span className="text-xs text-green-400 font-semibold">{Math.round((1 - p.price / p.originalPrice) * 100)}% off</span>
        </div>
        {!compact && (
          <button
            onClick={() => addToCart(p)}
            className={`w-full mt-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              addedId === p.id ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg active:scale-95'
            }`}
          >
            {addedId === p.id ? '✓ Added' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
}
