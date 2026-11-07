
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useLanguage } from './LanguageContext'
import { Eye, X, Phone, CheckCircle } from 'lucide-react'

export default function AdminOrders({ onBack }) {
  const { language } = useLanguage()
  const si = language === 'si'

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updating, setUpdating] = useState(false)

  const statusOptions = [
    'Pending',
    'Confirmed',
    'Processing',
    'Out for Delivery',
    'Completed',
    'Cancelled',
  ]

  const translateStatus = (status) => {
    if (!si) return status

    const statuses = {
      Pending: 'අපේක්ෂිත',
      Confirmed: 'තහවුරු කරන ලදී',
      Processing: 'සකසමින් පවතී',
      'Out for Delivery': 'බෙදාහැරීමට යවා ඇත',
      Completed: 'සම්පූර්ණයි',
      Cancelled: 'අවලංගු කරන ලදී',
    }

    return statuses[status] || status
  }

  const fetchOrders = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          full_name,
          phone,
          address
        ),
        order_items (
          product_name,
          price,
          quantity,
          subtotal
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Orders loading error:', error)
      alert(si ? 'ඇණවුම් ලබාගැනීමට නොහැකියි.' : 'Unable to load orders.')
    } else {
      setOrders(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(true)

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      alert(si ? 'තත්ත්වය වෙනස් කිරීමට නොහැකියි.' : 'Unable to update status.')
    } else {
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
      setSelectedOrder((currentOrder) =>
        currentOrder?.id === orderId
          ? { ...currentOrder, status: newStatus }
          : currentOrder
      )
    }

    setUpdating(false)
  }

  const formatDate = (date) =>
    new Date(date).toLocaleString(si ? 'si-LK' : 'en-US')

  return (
    <div className="space-y-6">

     <div className="flex justify-between items-center flex-wrap gap-3">
  <div>
    <button
      onClick={onBack}
      className="flex items-center gap-2 mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold"
    >
      ← {si ? 'Dashboard වෙත නැවත යන්න' : 'Back to Dashboard'}
    </button>

    <h2 className="text-2xl font-bold text-gray-800">
      {si ? 'ඇණවුම් කළමනාකරණය' : 'Manage Orders'}
    </h2>
    <p className="text-gray-500 text-sm">
      {si ? 'පාරිභෝගික ඇණවුම් බලන්න සහ කළමනාකරණය කරන්න' : 'View and manage customer orders'}
    </p>
    </div>
  </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <p className="p-8 text-center text-gray-500">
            {si ? 'පූරණය වෙමින් පවතී...' : 'Loading orders...'}
          </p>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            {si ? 'තවම ඇණවුම් නොමැත.' : 'No orders available.'}
          </p>
        ) : (
          <>
          <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">{si ? 'ඇණවුම් අංකය' : 'Order No.'}</th>
                <th className="p-4 text-left">{si ? 'ලුහුබැඳි අංකය' : 'Tracking'}</th>
                <th className="p-4 text-left">{si ? 'පාරිභෝගිකයා' : 'Customer'}</th>
                <th className="p-4 text-left">{si ? 'දිනය' : 'Date'}</th>
                <th className="p-4 text-left">{si ? 'මුළු මුදල' : 'Total'}</th>
                <th className="p-4 text-left">{si ? 'තත්ත්වය' : 'Status'}</th>
                <th className="p-4 text-left">{si ? 'විස්තර' : 'Details'}</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-semibold">#{order.order_number}</td>
                  <td className="p-4">
                    {order.tracking_number || (si ? 'යොදවා නැත' : 'Not assigned')}
                  </td>
                  <td className="p-4">
                    {order.customers?.full_name || '-'}
                    <p className="text-gray-500">{order.customers?.phone || '-'}</p>
                  </td>
                  <td className="p-4">{formatDate(order.created_at)}</td>
                  <td className="p-4 font-semibold">
                    Rs. {Number(order.total_amount).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      disabled={updating}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="border rounded-lg p-2 bg-white"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {translateStatus(status)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-1 text-green-700 font-semibold"
                    >
                      <Eye size={16} />
                      {si ? 'බලන්න' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="space-y-3 p-3 md:hidden">
            {orders.map((order) => (
              <article key={order.id} className="rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">#{order.order_number}</p>
                    <p className="mt-1 break-all text-xs text-green-800">
                      {order.tracking_number || (si ? 'ලුහුබැඳි අංකය නොමැත' : 'No tracking number')}
                    </p>
                  </div>
                  <p className="shrink-0 font-bold text-green-800">
                    Rs. {Number(order.total_amount).toFixed(2)}
                  </p>
                </div>
                <div className="mt-3 border-t pt-3 text-sm">
                  <p className="font-semibold">{order.customers?.full_name || '-'}</p>
                  <p className="text-gray-500">{order.customers?.phone || '-'}</p>
                  <p className="mt-1 text-xs text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <select
                    value={order.status}
                    disabled={updating}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    aria-label={`${si ? 'තත්ත්වය' : 'Status'} ${order.order_number}`}
                    className="min-h-11 min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-sm"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{translateStatus(status)}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-green-50 px-3 py-2 font-semibold text-green-800"
                  >
                    <Eye size={16} />
                    {si ? 'විස්තර' : 'Details'}
                  </button>
                </div>
              </article>
            ))}
          </div>
          </>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6">

            <div className="flex justify-between items-center mb-5">
              <h3 className="min-w-0 text-lg font-bold sm:text-xl">
                {si ? 'ඇණවුම් විස්තර' : 'Order Details'} #{selectedOrder.order_number}
              </h3>

              <button
                onClick={() => setSelectedOrder(null)}
                aria-label={si ? 'වසන්න' : 'Close'}
                className="shrink-0 rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-2 mb-5 text-sm">
              <p><strong>{si ? 'නම' : 'Name'}:</strong> {selectedOrder.customers?.full_name}</p>
              <p><strong>{si ? 'දුරකථනය' : 'Phone'}:</strong> {selectedOrder.customers?.phone}</p>
              <p><strong>{si ? 'ලිපිනය' : 'Address'}:</strong> {selectedOrder.customers?.address}</p>
              <p><strong>{si ? 'ඇණවුම් අංකය' : 'Order No.'}:</strong> #{selectedOrder.order_number}</p>
              <p><strong>{si ? 'දිනය' : 'Date'}:</strong> {formatDate(selectedOrder.created_at)}</p>
              <p><strong>{si ? 'සටහන්' : 'Notes'}:</strong> {selectedOrder.notes || '-'}</p>
            </div>

            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-800">
                {si ? 'ලුහුබැඳි අංකය' : 'Tracking Number'}
              </p>
              <p className="mt-1 break-all text-lg font-bold tracking-wide text-green-900 sm:text-xl">
                {selectedOrder.tracking_number || (si ? 'යොදවා නැත' : 'Not assigned')}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
              {selectedOrder.customers?.phone && (
                <a
                  href={`tel:${selectedOrder.customers.phone.replace(/[^\d+]/g, '')}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800"
                >
                  <Phone size={18} />
                  {si ? 'පාරිභෝගිකයා අමතන්න' : 'Call Customer'}
                </a>
              )}
              {selectedOrder.status !== 'Confirmed' && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => updateStatus(selectedOrder.id, 'Confirmed')}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  {si ? 'ඇමතුමෙන් පසු තහවුරු කරන්න' : 'Mark Confirmed After Call'}
                </button>
              )}
            </div>

            <h4 className="font-bold mb-3">
              {si ? 'ඇණවුම් කළ භාණ්ඩ' : 'Ordered Products'}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">{si ? 'භාණ්ඩය' : 'Product'}</th>
                    <th className="p-3 text-right">{si ? 'මිල' : 'Price'}</th>
                    <th className="p-3 text-right">{si ? 'ප්‍රමාණය' : 'Quantity'}</th>
                    <th className="p-3 text-right">{si ? 'එකතුව' : 'Subtotal'}</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.order_items || []).map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{item.product_name}</td>
                      <td className="p-3 text-right">Rs. {Number(item.price).toFixed(2)}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">Rs. {Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right mt-5 font-bold text-lg">
              {si ? 'මුළු එකතුව' : 'Total'}: Rs. {Number(selectedOrder.total_amount).toFixed(2)}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-5 bg-gray-200 px-5 py-2 rounded-lg"
            >
              {si ? 'වසන්න' : 'Close'}
            </button>

          </div>
        </div>
      )}

    </div>
  )
}
