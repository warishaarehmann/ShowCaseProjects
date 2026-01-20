import { useMemo, useState } from "react";
import { products as PRODUCTS } from "./data/products";

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("none");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedId, setAddedId] = useState(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(PRODUCTS.map((p) => p.category)));
    return ["All", ...unique];
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...PRODUCTS];

    if (category !== "All") {
      list = list.filter((p) => p.category === category);
    }

    if (query.trim()) {
      list = list.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);

    return list;
  }, [query, category, sort]);

  function addToCart(product) {
    setCart((prev) => {
      const found = prev.find((x) => x.id === product.id);
      if (found) {
        return prev.map((x) =>
          x.id === product.id ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 250);

    setIsCartOpen(true);
  }

  function incQty(id) {
    setCart((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x))
    );
  }

  function decQty(id) {
    setCart((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
        .filter((x) => x.qty > 0)
    );
  }

  const totalItems = cart.reduce((sum, x) => sum + x.qty, 0);
  const totalPrice = cart.reduce((sum, x) => sum + x.qty * x.price, 0);

  return (
    <div className="min-h-screen bg-pink-50 text-gray-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">
            <span className="text-pink-500">Glow</span>Shop
          </h1>

          <div className="hidden gap-3 md:flex">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-64 rounded-xl border px-3 py-2 text-sm outline-none focus:border-pink-400"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-pink-400"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-pink-400"
            >
              <option value="none">Sort</option>
              <option value="low">Price: Low → High</option>
              <option value="high">Price: High → Low</option>
            </select>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90"
          >
            Cart
            {totalItems > 0 && (
              <span className={`absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-black text-xs text-white
  ${addedId ? "animate-pop" : ""}`}>
                {totalItems}
              </span>

            )}
          </button>
        </div>

        {/* Mobile Filters */}
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pb-4 md:hidden">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-pink-400"
          />

          <div className="flex gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-1/2 rounded-xl border px-3 py-2 text-sm outline-none focus:border-pink-400"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-1/2 rounded-xl border px-3 py-2 text-sm outline-none focus:border-pink-400"
            >
              <option value="none">Sort</option>
              <option value="low">Low → High</option>
              <option value="high">High → Low</option>
            </select>
          </div>
        </div>
      </header>

      {/* Products */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Trending Products</h2>
            <p className="text-sm text-gray-600">
              Clean UI e-commerce frontend using React + Tailwind
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredProducts.length}</span>{" "}
            items
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img src={p.img} alt={p.title} className="h-44 w-full object-cover" />

              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-600">
                    {p.category}
                  </span>
                  <span className="text-xs text-gray-500">⭐ {p.rating}</span>
                </div>

                <h3 className="text-lg font-bold">{p.title}</h3>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-base font-semibold">₹{p.price}</p>

                  <button
                    onClick={() => addToCart(p)}
                    className={`rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90
    transition active:scale-95
    ${addedId === p.id ? "animate-pop" : ""}`}
                  >
                    Add
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 animate-fadeIn"
            onClick={() => setIsCartOpen(false)}
          ></div>


          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-5 shadow-xl
                animate-[slideIn_0.25s_ease-out]">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Your Cart</h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-xl border px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-sm text-gray-600">Your cart is empty 😭</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl border p-3"
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-600">₹{item.price}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decQty(item.id)}
                        className="h-8 w-8 rounded-lg border text-sm"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => incQty(item.id)}
                        className="h-8 w-8 rounded-lg border text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-bold">₹{totalPrice}</p>
              </div>

              <button
                className="mt-4 w-full rounded-2xl bg-pink-500 py-3 text-sm font-semibold text-white shadow hover:opacity-90"
              >
                Checkout (UI Only)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
