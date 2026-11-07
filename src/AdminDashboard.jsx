
import AdminProducts from './AdminProducts'
import AdminCategories from './AdminCategories'
import AdminOrders from './AdminOrders'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useLanguage } from './LanguageContext'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tags,
  LogOut,
  Store,
} from 'lucide-react'

export default function AdminDashboard({ onLogout }) {
  const { language, changeLanguage, t } = useLanguage()
  const si = language === 'si'

  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    customers: 0,
  })

  const [showProducts, setShowProducts] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      const [products, categories, orders, customers] =
        await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('categories').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('customers').select('*', { count: 'exact', head: true }),
        ])

      setStats({
        products: products.count || 0,
        categories: categories.count || 0,
        orders: orders.count || 0,
        customers: customers.count || 0,
      })

      setLoading(false)
    }

    loadStats()
  }, [])

  if (showProducts) {
    return <AdminProducts onBack={() => setShowProducts(false)} />
  }

  if (showCategories) {
    return <AdminCategories onBack={() => setShowCategories(false)} />
  }

  if (showOrders) {
    return <AdminOrders onBack={() => setShowOrders(false)} />
  }

  const cards = [
    {
      title: t('totalProducts'),
      value: stats.products,
      icon: Package,
    },
    {
      title: t('categories'),
      value: stats.categories,
      icon: Tags,
    },
    {
      title: t('totalOrders'),
      value: stats.orders,
      icon: ShoppingBag,
    },
    {
      title: t('customers'),
      value: stats.customers,
      icon: Users,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">

      <aside className="flex flex-wrap items-center justify-between gap-3 bg-green-900 px-4 py-4 text-white sm:gap-4 sm:p-5">

        <div className="flex items-center gap-2 sm:gap-3">
          <Store size={30} />

          <div>
            <h1 className="text-xl font-bold">Sunil Store</h1>
            <p className="text-green-200 text-sm">
              {t('dashboard')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">

          <button
            onClick={() => changeLanguage(language === 'en' ? 'si' : 'en')}
            className="min-h-10 rounded-lg border border-white px-2.5 py-2 text-xs font-semibold hover:bg-green-800 sm:px-3 sm:text-sm"
          >
            {language === 'en' ? 'සිංහල' : 'English'}
          </button>

          <button
            onClick={onLogout}
            className="flex min-h-10 items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm hover:bg-red-700 sm:px-4"
          >
            <LogOut size={18} />
            {t('logout')}
          </button>

        </div>
      </aside>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:p-6 md:p-8">

        <div className="mb-8">

          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-green-800" />

            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
              {si ? 'Dashboard සාරාංශය' : 'Dashboard Overview'}
            </h2>
          </div>

          <p className="text-gray-500 mt-2">
            {si
              ? 'සුනිල් ස්ටෝර්ස් පරිපාලක පුවරුව වෙත සාදරයෙන් පිළිගනිමු.'
              : 'Welcome to Sunil Store Administration.'}
          </p>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {cards.map((card) => {
            const Icon = card.icon

            return (
              <div
                key={card.title}
                className="rounded-xl bg-white p-4 shadow-sm sm:p-6"
              >
                <div className="flex justify-between items-center">

                  <div>
                    <p className="text-gray-500 text-sm">
                      {card.title}
                    </p>

                    <h3 className="text-3xl font-bold text-green-800 mt-2">
                      {loading ? '...' : card.value}
                    </h3>
                  </div>

                  <div className="bg-green-100 p-3 rounded-xl">
                    <Icon size={28} className="text-green-800" />
                  </div>

                </div>
              </div>
            )
          })}

        </div>

        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm sm:mt-8 sm:p-6">

          <h3 className="text-xl font-bold text-gray-800">
            {si ? 'වෙළඳසැල් කළමනාකරණය' : 'Store Management'}
          </h3>

          <p className="text-gray-500 mt-2">
            {si
              ? 'ඔබගේ වෙළඳසැලේ භාණ්ඩ, වර්ග සහ පාරිභෝගික ඇණවුම් කළමනාකරණය කරන්න.'
              : 'Manage your store products, categories and customer orders.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">

            <button
              onClick={() => setShowProducts(true)}
              className="min-h-36 rounded-xl border bg-gray-50 p-4 text-left transition hover:bg-green-50 sm:p-5"
            >
              <Package size={28} className="text-green-700 mb-3" />

              <h4 className="font-bold text-green-800">
                {t('manageProducts')}
              </h4>

              <p className="text-sm text-gray-500 mt-2">
                {si
                  ? 'භාණ්ඩ එකතු කිරීම, සංස්කරණය කිරීම, මකා දැමීම සහ පින්තූර උඩුගත කිරීම.'
                  : 'Add, edit, delete products and upload images.'}
              </p>
            </button>

            <button
              onClick={() => setShowCategories(true)}
              className="min-h-36 rounded-xl border bg-gray-50 p-4 text-left transition hover:bg-green-50 sm:p-5"
            >
              <Tags size={28} className="text-green-700 mb-3" />

              <h4 className="font-bold text-green-800">
                {t('manageCategories')}
              </h4>

              <p className="text-sm text-gray-500 mt-2">
                {si
                  ? 'භාණ්ඩ වර්ග එකතු කිරීම, සංස්කරණය කිරීම සහ මකා දැමීම.'
                  : 'Add, edit and delete product categories.'}
              </p>
            </button>

            <button
  onClick={() => setShowOrders(true)}
  className="min-h-36 rounded-xl border bg-gray-50 p-4 text-left transition hover:bg-green-50 sm:p-5"
>
  <ShoppingBag size={28} className="text-green-700 mb-3" />

  <h4 className="font-bold text-green-800">
    {si ? 'ඇණවුම් කළමනාකරණය' : 'Manage Orders'}
  </h4>

  <p className="text-sm text-gray-500 mt-2">
    {si
      ? 'පාරිභෝගික ඇණවුම් බලන්න සහ තත්ත්වය වෙනස් කරන්න.'
      : 'View customer orders and update order status.'}
  </p>
</button>

          </div>
        </div>

      </main>
    </div>
  )
}
