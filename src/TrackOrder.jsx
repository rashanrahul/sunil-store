
import { useState } from 'react'
import { supabase } from './lib/supabase'
import { useLanguage } from './LanguageContext'
import { Search, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'

export default function TrackOrder() {
  const { language } = useLanguage()
  const si = language === 'si'

  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState(null)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const statusLabels = {
    Pending: si ? 'අපේක්ෂිත' : 'Pending',
    Confirmed: si ? 'තහවුරු කරන ලදී' : 'Confirmed',
    Processing: si ? 'සකසමින් පවතී' : 'Processing',
    'Out for Delivery': si ? 'බෙදාහැරීමට යවා ඇත' : 'Out for Delivery',
    Completed: si ? 'සම්පූර්ණයි' : 'Completed',
    Cancelled: si ? 'අවලංගු කරන ලදී' : 'Cancelled',
  }

  const statusIcons = {
    Pending: Clock,
    Confirmed: CheckCircle,
    Processing: Package,
    'Out for Delivery': Truck,
    Completed: CheckCircle,
    Cancelled: XCircle,
  }

  const searchOrder = async (e) => {
    e.preventDefault()

    const inputValue = orderNumber.trim()

    if (!inputValue) {
      alert(si ? 'ඇණවුම් අංකය හෝ ලුහුබැඳි අංකය ඇතුළත් කරන්න.' : 'Please enter an order or tracking number.')
      return
    }

    if (!phone.trim()) {
      alert(si ? 'දුරකථන අංකය ඇතුළත් කරන්න.' : 'Please enter your phone number.')
      return
    }

    setLoading(true)
    setSearched(false)
    setOrder(null)

    const isTrackingNumber = /[A-Za-z]/.test(inputValue)
    const baseQuery = supabase
      .from('orders')
      .select(`
        *,
        customers!inner (
          phone
        ),
        order_items (
          product_name,
          price,
          quantity,
          subtotal
        )
      `)
      .eq('customers.phone', phone.trim())

    const { data, error } = isTrackingNumber
      ? await baseQuery.ilike('tracking_number', inputValue).maybeSingle()
      : await baseQuery.eq('order_number', Number(inputValue)).maybeSingle()

    if (error) {
      console.error(error)
      alert(si ? 'ඇණවුම සෙවීමේ දෝෂයක් ඇති විය.' : 'Error searching for order.')
    } else {
      setOrder(data)
    }

    setSearched(true)
    setLoading(false)
  }

  const StatusIcon = order ? statusIcons[order.status] || Clock : Clock

  return (
    <div className="mx-auto max-w-3xl px-3 py-6 sm:px-5 sm:py-10">

      <div className="text-center mb-8">
        <Package size={45} className="mx-auto text-green-700 mb-3" />

        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          {si ? 'ඔබගේ ඇණවුම සොයන්න' : 'Track Your Order'}
        </h2>

        <p className="text-gray-500 mt-2">
          {si
            ? 'ඔබට ලැබුණු ඇණවුම් අංකය ඇතුළත් කරන්න.'
            : 'Enter your order number to check its status.'}
        </p>
      </div>

      <form onSubmit={searchOrder} className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        <input
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder={si ? 'දුරකථන අංකය' : 'Customer Phone Number'}
  className="min-h-12 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-green-600"
  required
/>
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder={si ? 'ඇණවුම් අංකය / ලුහුබැඳි අංකය' : 'Order Number / Tracking Number'}
          className="min-h-12 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-green-600"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-white transition-colors hover:bg-green-800 disabled:opacity-50 sm:col-span-2 lg:col-span-1"
        >
          <Search size={18} />
          {loading ? '...' : si ? 'සොයන්න' : 'Search'}
        </button>
      </form>

      {searched && !order && (
        <div className="bg-red-50 text-red-700 p-5 rounded-lg text-center">
          {si
            ? 'මෙම අංකයට අදාළ ඇණවුමක් හමු නොවීය.'
            : 'No order found with this number.'}
        </div>
      )}

      {order && (
        <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">

          <div className="flex justify-between items-center flex-wrap gap-3 border-b pb-4">
            <div>
              <p className="text-gray-500 text-sm">
                {si ? 'ඇණවුම් අංකය' : 'Order Number'}
              </p>
              <h3 className="text-xl font-bold text-green-800 sm:text-2xl">
                #{order.order_number}
              </h3>
              {order.tracking_number && (
                <p className="mt-1 break-all text-sm font-semibold text-green-700">
                  {si ? 'ලුහුබැඳි අංකය' : 'Tracking Number'}: {order.tracking_number}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-lg">
              <StatusIcon size={20} />
              <span className="font-semibold">
                {statusLabels[order.status] || order.status}
              </span>
            </div>
          </div>

          <div className="py-5 border-b">
            <p className="text-sm text-gray-500">
              {si ? 'ඇණවුම් කළ දිනය' : 'Order Date'}
            </p>
            <p className="font-medium mt-1">
              {new Date(order.created_at).toLocaleString(si ? 'si-LK' : 'en-US')}
            </p>
          </div>

          <h4 className="font-bold mt-5 mb-3">
            {si ? 'ඇණවුම් කළ භාණ්ඩ' : 'Ordered Products'}
          </h4>

          <div className="space-y-3">
            {(order.order_items || []).map((item, index) => (
              <div key={index} className="flex justify-between gap-3 border-b pb-3">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-gray-500">
                    {si ? 'ප්‍රමාණය' : 'Quantity'}: {item.quantity}
                  </p>
                </div>

                <p className="font-semibold">
                  Rs. {Number(item.subtotal).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-5 text-lg font-bold">
            <span>{si ? 'මුළු එකතුව' : 'Total Amount'}</span>
            <span className="text-green-800">
              Rs. {Number(order.total_amount).toFixed(2)}
            </span>
          </div>

        </div>
      )}

    </div>
  )
}
