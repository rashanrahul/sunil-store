import { LanguageProvider } from './LanguageContext'
import { useLanguage } from './LanguageContext'
import Checkout from './Checkout'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import TrackOrder from './TrackOrder'
import OrderConfirmation from './OrderConfirmation'
import { useEffect, useState } from 'react'
import {
  ShoppingCart,
  Search,
  Phone,
  Menu,
  X,
  ArrowRight,
  ShoppingBasket,
  Truck,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { supabase } from './lib/supabase'

function App() {
  return (
    <LanguageProvider>
      <StoreApp />
    </LanguageProvider>
  )
}

function StoreApp() {
  const { language, changeLanguage, t } = useLanguage()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [showTrackOrder, setShowTrackOrder] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchStoreData()
  }, [])

  const fetchStoreData = async () => {
    setLoading(true)

    const [categoryResult, productResult] = await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .eq('is_active', true),

      supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(8),
    ])

    if (!categoryResult.error) {
      setCategories(categoryResult.data || [])
    } else {
      console.error(categoryResult.error.message)
    }

    if (!productResult.error) {
      setProducts(productResult.data || [])
    } else {
      console.error(productResult.error.message)
    }

    setLoading(false)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesCategory =
      selectedCategory === 'All' ||
      product.category_id === selectedCategory

    return matchesSearch && matchesCategory
  })

  const formatPrice = (price) =>
    `Rs. ${Number(price).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
    })}`


// Add product to cart
const addToCart = (product) => {
  setCart((currentCart) => {
    const existing = currentCart.find(
      (item) => item.id === product.id
    )

    if (existing) {
      return currentCart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    }

    return [...currentCart, { ...product, quantity: 1 }]
  })
}

// Increase quantity
const increaseQuantity = (id) => {
  setCart((currentCart) =>
    currentCart.map((item) =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  )
}

// Decrease quantity
const decreaseQuantity = (id) => {
  setCart((currentCart) =>
    currentCart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0)
  )
}

// Remove product
const removeFromCart = (id) => {
  setCart((currentCart) =>
    currentCart.filter((item) => item.id !== id)
  )
}

// Cart calculations
const cartCount = cart.reduce(
  (total, item) => total + item.quantity,
  0
)

const cartTotal = cart.reduce(
  (total, item) => total + Number(item.price) * item.quantity,
  0
)

if (completedOrder) {
  return (
    <OrderConfirmation
      order={completedOrder}
      onContinueShopping={() => setCompletedOrder(null)}
    />
  )
}

if (showCheckout) {
  return (
    <Checkout
      cart={cart}
      cartTotal={cartTotal}
      formatPrice={formatPrice}
      onBack={() => setShowCheckout(false)}
      onSuccess={(data) => {
        setCart([])
        setShowCheckout(false)
        setCompletedOrder(data)
      }}
    />
  )
}

if (showTrackOrder) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white p-4">
        <button
          onClick={() => setShowTrackOrder(false)}
          className="font-semibold"
        >
          ← {language === 'si' ? 'මුල් පිටුවට ආපසු' : 'Back to Home'}
        </button>
      </div>

      <TrackOrder />
    </div>
  )
}

if (showAdminLogin && !adminLoggedIn) {
  return (
    <AdminLogin
      onLogin={() => setAdminLoggedIn(true)}
    />
  )
}

if (adminLoggedIn) {
  return (
    <AdminDashboard
      onLogout={async () => {
        await supabase.auth.signOut()
        setAdminLoggedIn(false)
        setShowAdminLogin(false)
      }}
    />
  )
}

  return (
    <div className="min-h-screen bg-white text-gray-800">

      {/* TOP BAR */}
      <div className="bg-green-800 text-white text-center py-2 text-sm">
        {t('welcome')}
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-5 sm:py-4">

          <a href="#" className="flex min-w-0 items-center gap-2">
            <div className="shrink-0 rounded-xl bg-green-700 p-2.5 text-white sm:p-3">
              <ShoppingBasket size={23} className="sm:h-[27px] sm:w-[27px]" />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-bold text-green-800 sm:text-xl">
                Sunil Store
              </h1>
              <p className="mt-1 hidden text-xs text-green-600 sm:block sm:text-sm">
  {language === 'si'
    ? 'ඔබගේ විශ්වාසදායක සිල්ලර වෙළඳසැල'
    : 'Your Trusted Grocery Store'}
</p>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
            <a href="#" className="text-green-700">{t('home')}</a>
            <a href="#categories" className="hover:text-green-700">
              {t('categories')}
            </a>
            <a href="#products" className="hover:text-green-700">
              {t('products')}
            </a>
            <a href="#contact" className="hover:text-green-700">
              {t('contact')}
            </a>

            <button
  onClick={() => setShowTrackOrder(true)}
  className="hover:text-green-700"
>
  {language === 'si' ? 'ඇණවුම සොයන්න' : 'Track Order'}
</button>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">

            <button
  onClick={() => changeLanguage(language === 'en' ? 'si' : 'en')}
  className="min-h-10 rounded-lg border border-green-700 px-2 py-2 text-xs font-semibold text-green-800 sm:px-3 sm:text-sm"
>
  {language === 'en' ? 'සිංහල' : 'English'}
</button>

<button
  onClick={() => setShowCart(!showCart)}
  className="relative rounded-full p-2 hover:bg-green-50"
  aria-label="Shopping cart"
>
  <ShoppingCart size={24} className="text-green-800" />

  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
    {cartCount}
  </span>
</button>


            <a
              href="tel:0775163271"
              className="hidden items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-800 md:flex"
            >
              <Phone size={17} />
              {t('callStore')}
            </a>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-2 hover:bg-green-50 md:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>

            <button
  onClick={() => setShowAdminLogin(true)}
  className="hidden font-semibold text-green-800 hover:text-green-600 md:block"
>
  {t('admin')}
</button>

          </div>
        </div>

        {menuOpen && (
  <div className="flex flex-col gap-1 border-t bg-white p-4 shadow-lg md:hidden">
    <a className="rounded-lg px-3 py-3 hover:bg-green-50" href="#" onClick={() => setMenuOpen(false)}>
      {t('home')}
    </a>

    <a className="rounded-lg px-3 py-3 hover:bg-green-50" href="#categories" onClick={() => setMenuOpen(false)}>
      {t('categories')}
    </a>

    <a className="rounded-lg px-3 py-3 hover:bg-green-50" href="#products" onClick={() => setMenuOpen(false)}>
      {t('products')}
    </a>

    <a className="rounded-lg px-3 py-3 hover:bg-green-50" href="#contact" onClick={() => setMenuOpen(false)}>
      {t('contact')}
    </a>

            <button
  onClick={() => {
    setShowTrackOrder(true)
    setMenuOpen(false)
  }}
  className="w-full rounded-lg px-3 py-3 text-left hover:bg-green-50"
>
  {language === 'si' ? 'ඇණවුම සොයන්න' : 'Track Order'}
</button>
    <a
      href="tel:0775163271"
      className="rounded-lg px-3 py-3 text-left text-green-800 hover:bg-green-50 sm:hidden"
    >
      {t('callStore')} · 0775163271
    </a>
    <button
      onClick={() => {
        setShowAdminLogin(true)
        setMenuOpen(false)
      }}
      className="rounded-lg px-3 py-3 text-left font-semibold text-green-800 hover:bg-green-50"
    >
      {t('admin')}
    </button>
          </div>
        )}
      </header>


{/* SHOPPING CART PANEL */}
{showCart && (
  <div className="fixed inset-0 z-[60] flex justify-end bg-black/50">

  <div className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white p-4 shadow-xl sm:p-6">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">
          {t('cartTitle')}
        </h2>

        <button onClick={() => setShowCart(false)}>
          <X size={26} />
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart size={55} className="mx-auto text-gray-300" />
          <h3 className="font-bold text-xl mt-4">
            {t('emptyCart')}
          </h3>
          <p className="text-gray-500 mt-2">
            {t('addGroceries')}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 border-b pb-5">

                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-green-50 rounded-lg flex items-center justify-center text-3xl">
                    🛍️
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-bold">{item.name}</h3>

                  <p className="text-green-700 font-semibold mt-1">
                    {formatPrice(item.price)}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="border rounded px-3 py-1"
                    >
                      -
                    </button>

                    <span className="font-bold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="border rounded px-3 py-1"
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-auto text-red-500"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t mt-6 pt-5">
            <div className="flex justify-between text-xl font-bold">
              <span>{t('total')}:</span>
              <span className="text-green-700">
                {formatPrice(cartTotal)}
              </span>
            </div>

            <button
  onClick={() => {
    setShowCart(false)
    setShowCheckout(true)
  }}
  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl mt-6 font-bold"
>
  {t('proceedCheckout')}
</button>
          </div>
        </>
      )}
    </div>
  </div>
)}


      {/* HERO SECTION */}
      <section className="bg-green-50">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-5 sm:py-16 md:grid-cols-2 md:gap-10 md:py-24">

          <div>
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-5">
  {language === 'si'
    ? 'ඔබගේ දෛනික සිල්ලර වෙළඳසැල'
    : 'Your Daily Grocery Partner'}
</span>

            <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-6xl">
  {language === 'si' ? (
    <>
      ඔබට අවශ්‍ය සියල්ල
      <span className="text-green-700"> එකම තැනකින්.</span>
    </>
  ) : (
    <>
      Everything You Need,
      <span className="text-green-700"> All in One Store.</span>
    </>
  )}
</h2>

            <p className="mt-5 max-w-xl text-base text-gray-600 sm:mt-6 sm:text-lg">
  {language === 'si'
    ? 'ඔබගේ දෛනික අවශ්‍යතා සඳහා සිල්ලර බඩු, බීම වර්ග සහ ගෘහ උපකරණ පහසුවෙන් Sunil Store වෙතින් මිලදී ගන්න.'
    : 'Shop your daily essentials, groceries, drinks and household products with Sunil Store.'}
</p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 sm:mt-8">
  <button
    onClick={() =>
      document.getElementById('products')?.scrollIntoView({
        behavior: 'smooth',
      })
    }
    className="min-h-12 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-800 sm:px-7"
  >
    {language === 'si' ? 'දැන් මිලදී ගන්න' : 'Shop Now'}
    <ArrowRight size={18} className="inline ml-2" />
  </button>

  <a
    href="#contact"
    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-green-700 px-6 py-3 font-semibold text-green-800 hover:bg-green-100 sm:px-7"
  >
    {language === 'si' ? 'අප අමතන්න' : 'Contact Us'}
  </a>
</div>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-lg sm:p-6">
            <div className="rounded-2xl bg-green-100 p-7 text-center sm:p-10">
              <ShoppingBasket
                size={110}
                className="mx-auto text-green-700"
              />
              <h3 className="text-2xl font-bold text-green-900 mt-5">
                 Sunil Store
              </h3>
              <p className="text-green-800 mt-2">
  {language === 'si'
    ? 'ගුණාත්මක භාණ්ඩ. විශ්වාසදායක සේවාව.'
    : 'Quality Products. Trusted Service.'}
</p>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-7 sm:grid-cols-2 sm:gap-5 sm:px-5 sm:py-10 lg:grid-cols-3">

        <div className="flex items-center gap-4 p-5 rounded-xl bg-gray-50">
          <Truck className="text-green-700" size={32} />
          <div>
            <h3 className="font-bold">{language === 'si' ? 'පහසු ඇණවුම් කිරීම' : 'Easy Ordering'}</h3>
            <p className="text-sm text-gray-500">{language === 'si' ? 'නිවසේ සිටම ඇණවුම් කරන්න' : 'Order from home'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-xl bg-gray-50">
          <ShieldCheck className="text-green-700" size={32} />
          <div>
            <h3 className="font-bold">
  {language === 'si' ? 'විශ්වාසදායක නිෂ්පාදන' : 'Trusted Products'}
</h3>
<p className="text-sm text-gray-500">
  {language === 'si'
    ? 'ඔබට විශ්වාස කළ හැකි ගුණාත්මකභාවය'
    : 'Quality you can trust'}
</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-xl bg-gray-50">
          <Clock className="text-green-700" size={32} />
          <div>
            <h3 className="font-bold">
  {language === 'si' ? 'පහසු සාප්පු සවාරි' : 'Convenient Shopping'}
</h3>
<p className="text-sm text-gray-500">
  {language === 'si'
    ? 'සරල මාර්ගගත ඇණවුම් කිරීම'
    : 'Simple online ordering'}
</p>
          </div>
        </div>

      </section>

      {/* CATEGORIES */}
      <section id="categories" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-5 sm:py-12">

        <div className="text-center mb-10">
          <p className="text-green-700 font-semibold">
  {language === 'en' ? 'SHOP BY CATEGORY' : 'භාණ්ඩ වර්ග අනුව තෝරන්න'}
</p>

<h2 className="text-3xl font-bold mt-2">
  {t('categoriesTitle')}
</h2>

<p className="text-gray-500 mt-2">
  {t('exploreCategories')}
</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {categories.map((category, index) => {
            const emojis = ['🛒', '🥤', '🧹']

            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id)
                  document.getElementById('products')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="rounded-2xl border border-gray-100 p-4 text-left transition hover:border-green-300 hover:shadow-lg sm:p-6"
              >
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-36 object-cover rounded-xl mb-4"
                  />
                ) : (
                  <div className="h-36 bg-green-50 rounded-xl flex items-center justify-center text-6xl mb-4">
                    {emojis[index % emojis.length]}
                  </div>
                )}

                <h3 className="font-bold text-xl">{category.name}</h3>
                <p className="text-gray-500 text-sm mt-2">
                  {category.description}
                </p>
                <span className="text-green-700 font-semibold text-sm mt-4 inline-block">
                  {t('exploreProducts')} →
                </span>
              </button>
            )
          })}
        </div>

      </section>

      {/* PRODUCTS */}
      <section id="products" className="scroll-mt-24 bg-gray-50 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-5">

          <div className="text-center mb-8">
            <p className="text-green-700 font-semibold">
  {t('ourStore')}
</p>

<h2 className="text-3xl font-bold mt-2">
  {t('featuredProducts')}
</h2>
          </div>

          {/* SEARCH */}
          <div className="max-w-xl mx-auto mb-8 flex items-center bg-white border rounded-xl px-4">
            <Search className="text-gray-400" />
            <input
              type="text"
              placeholder={t('searchProducts')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-4 outline-none"
            />
          </div>

          <div className="mb-8 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:gap-3">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium sm:px-5 ${
                selectedCategory === 'All'
                  ? 'bg-green-700 text-white'
                  : 'bg-white border'
              }`}
            >
              {t('allProducts')}
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium sm:px-5 ${
                  selectedCategory === category.id
                    ? 'bg-green-700 text-white'
                    : 'bg-white border'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center py-10">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBasket size={48} className="mx-auto text-gray-300" />
              <h3 className="text-xl font-bold mt-4">
                No Products Available
              </h3>
              <p className="text-gray-500 mt-2">
                Products will appear here when added by the store admin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-lg"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-32 w-full object-cover sm:h-40"
                    />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center bg-green-50 text-5xl sm:h-40">
                      🛍️
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <h3 className="break-words font-bold">{product.name}</h3>
                    <p className="text-green-700 font-bold mt-2">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {product.unit || 'item'}
                    </p>


<button
  onClick={() => addToCart(product)}
  className="mt-auto min-h-11 w-full rounded-lg bg-green-700 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-800 sm:mt-4 sm:text-sm"
>
  <span className="flex items-center justify-center gap-2">
    <ShoppingCart size={16} />
    {t('addToCart')}
  </span>
</button>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="max-w-7xl mx-auto px-5 py-14 text-center">
  <h2 className="text-3xl font-bold">
    {language === 'si' ? 'උදව් අවශ්‍යද?' : 'Need Help?'}
  </h2>

  <p className="text-gray-500 mt-3">
    {language === 'si'
      ? 'ඔබගේ සිල්ලර අවශ්‍යතා සඳහා Sunil Store අමතන්න.'
      : 'Contact Sunil Store for your grocery requirements.'}
  </p>

        <a
          href="tel:0775163271"
          className="inline-flex items-center gap-2 bg-green-700 text-white px-7 py-3 rounded-xl mt-6"
        >
          <Phone size={19} />
          0775163271
        </a>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-900 text-white text-center py-7">
        <h3 className="text-xl font-bold"> Sunil Store</h3>
        <p className="text-xs text-gray-500">
  {language === 'si'
    ? 'ඔබගේ විශ්වාසදායක සිල්ලර වෙළඳසැල'
    : 'Your Trusted Grocery Store'}
</p>
        <p className="text-green-200 text-xs mt-4">
          © {new Date().getFullYear()} Sunil Store. All rights reserved.
        </p>
      </footer>

    </div>
  )
}

export default App
