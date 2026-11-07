
import { useState } from 'react'
import { supabase } from './lib/supabase'
import { generateTrackingNumber } from './lib/orderTracking'
import { useLanguage } from './LanguageContext'

export default function Checkout({ cart, cartTotal, formatPrice, onBack, onSuccess }) {
  const { language, t } = useLanguage()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const si = language === 'si'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (cart.length === 0) {
      setError(si ? 'ඔබගේ කරත්තය හිස්.' : 'Your cart is empty.')
      return
    }

    setLoading(true)

    const { data, error: orderError } = await supabase.rpc(
      'place_customer_order',
      {
        p_customer_name: name.trim(),
        p_phone: phone.trim(),
        p_address: address.trim(),
        p_items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      }
    )

    if (orderError) {
      setLoading(false)
      setError(orderError.message)
      return
    }

    const orderNumber = Number(data?.order_number)
    const trackingNumber = generateTrackingNumber(orderNumber || Date.now())

    if (orderNumber) {
      const { error: trackingError } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber,
          status: 'Pending',
        })
        .eq('order_number', orderNumber)

      if (trackingError) {
  console.error('Tracking number save failed:', trackingError)
  setLoading(false)
  setError(
    si
      ? 'ලුහුබැඳි අංකය සුරැකීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.'
      : 'Could not save tracking number. Please contact the store.'
  )
  return
}
    }

    setLoading(false)
    onSuccess({ ...data, tracking_number: trackingNumber })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-white px-3 py-6 sm:px-5 sm:py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-4 shadow-lg shadow-green-900/5 sm:p-6 md:p-8">

        <button onClick={onBack} className="text-green-700 font-semibold mb-6">
          ← {t('backToCart')}
        </button>

        <h1 className="mb-2 text-2xl font-bold text-green-800 sm:text-3xl">
          {t('checkout')}
        </h1>

        <p className="text-gray-500 mb-8">
          {si
            ? 'ඔබගේ ඇණවුම ලබා දීමට විස්තර ඇතුළත් කරන්න.'
            : 'Enter your details to place your order.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block font-semibold mb-2">
              {t('customerName')}
            </label>
            <input
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder={si ? 'ඔබගේ සම්පූර්ණ නම' : 'Enter your full name'}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              {t('phoneNumber')}
            </label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="07XXXXXXXX"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              {t('deliveryAddress')}
            </label>
            <textarea
              required
              minLength={5}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-lg p-3"
              rows={3}
              placeholder={
                si
                  ? 'ඔබගේ සම්පූර්ණ ලිපිනය ඇතුළත් කරන්න'
                  : 'Enter your complete delivery address'
              }
            />
          </div>

          <div className="bg-green-50 rounded-xl p-5">
            <h2 className="font-bold text-lg mb-3">
              {si ? 'ඇණවුමේ විස්තර' : 'Order Summary'}
            </h2>

            {cart.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 py-2 text-sm sm:text-base">
                <span className="min-w-0 break-words">{item.name} × {item.quantity}</span>
                <span className="shrink-0">{formatPrice(Number(item.price) * item.quantity)}</span>
              </div>
            ))}

            <div className="mt-3 flex justify-between gap-3 border-t pt-3 text-lg font-bold sm:text-xl">
              <span>{t('total')}</span>
              <span className="text-green-700">{formatPrice(cartTotal)}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <strong>{si ? 'ගෙවීම:' : 'Payment:'}</strong>{' '}
            {si
              ? 'Online ගෙවීමක් අවශ්‍ය නොවේ. ඔබගේ ඇණවුම තහවුරු කිරීමට අපගේ වෙළඳසැල දුරකථනයෙන් ඔබව සම්බන්ධ කරගනු ඇත.'
              : 'No online payment required. Our store will contact you by phone to confirm your order.'}
          </div>

          {error && (
            <p className="text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || cart.length === 0}
            className="min-h-12 w-full rounded-xl bg-green-700 py-4 font-bold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? (si ? 'ඇණවුම ලබා දෙමින්...' : 'Placing Order...')
              : t('placeOrder')}
          </button>

        </form>
      </div>
    </div>
  )
}
