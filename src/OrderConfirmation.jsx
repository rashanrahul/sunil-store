import { CheckCircle, Phone, ShoppingBasket } from 'lucide-react'
import { useLanguage } from './LanguageContext'

export default function OrderConfirmation({ order, onContinueShopping }) {
  const { language } = useLanguage()
  const si = language === 'si'

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-100 px-3 py-6 sm:px-5 sm:py-10">
      <section className="mx-auto w-full max-w-xl rounded-2xl bg-white p-5 text-center shadow-xl shadow-green-900/10 sm:p-8 md:p-10">
        <CheckCircle size={56} className="mx-auto text-green-700" />

        <h1 className="mt-4 text-2xl font-bold text-green-900 sm:text-3xl">
          {si ? 'ඔබගේ ඇණවුම ලැබුණා!' : 'Your Order Is Received!'}
        </h1>
        <p className="mt-3 text-gray-600">
          {si
            ? 'ඇණවුම තහවුරු කිරීමට පහත බොත්තමෙන් වෙළඳසැලට අමතන්න. ඇමතුමේදී ඔබගේ ලුහුබැඳි අංකය කියන්න.'
            : 'Call the store using the button below to confirm your order. Please share your tracking number during the call.'}
        </p>

        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-semibold text-green-800">
            {si ? 'ලුහුබැඳි අංකය' : 'Tracking Number'}
          </p>
          <p className="mt-2 break-all text-xl font-bold tracking-wide text-green-900 sm:text-2xl">
            {order.tracking_number}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            {si ? 'ඇණවුම් අංකය' : 'Order Number'}: #{order.order_number}
          </p>
        </div>

        <a
          href="tel:0775163271"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-4 font-bold text-white transition-colors hover:bg-green-800 sm:px-6"
        >
          <Phone size={20} />
          {si ? 'ඇණවුම තහවුරු කිරීමට වෙළඳසැල අමතන්න' : 'Call Store to Confirm Order'}
        </a>

        <p className="mt-4 text-sm text-gray-500">
          {si
            ? 'ඔබගේ ඇණවුම දැනට තහවුරු කිරීම බලාපොරොත්තුවෙන් පවතී.'
            : 'Your order is currently waiting for confirmation.'}
        </p>

        <button
          type="button"
          onClick={onContinueShopping}
          className="mt-6 inline-flex items-center gap-2 font-semibold text-green-800 hover:text-green-600"
        >
          <ShoppingBasket size={19} />
          {si ? 'සාප්පු සවාරි දිගටම කරගෙන යන්න' : 'Continue Shopping'}
        </button>
      </section>
    </main>
  )
}
