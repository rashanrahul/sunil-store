
import { createContext, useContext, useEffect, useState } from 'react'

const LanguageContext = createContext()

const translations = {
  en: {
    storeName: 'Sunil Store',
    dashboard: 'Admin Dashboard',
    welcome: 'Welcome to Sunil Store',
    manageProducts: 'Manage Products',
    manageCategories: 'Manage Categories',
    manageOrders: 'Manage Orders',
    totalProducts: 'Total Products',
    categories: 'Categories',
    totalOrders: 'Total Orders',
    customers: 'Customers',
    addProduct: 'Add Product',
    addCategory: 'Add Category',
    search: 'Search',
    save: 'Save',
    cancel: 'Cancel',
    logout: 'Logout',
    home: 'Home',
    products: 'Products',
    contact: 'Contact',
    callStore: 'Call Store',
    admin: 'Admin',
    categoriesTitle: 'Our Categories',
exploreCategories: 'Explore our everyday essentials',
exploreProducts: 'Explore Products',
ourStore: 'OUR STORE',
featuredProducts: 'Featured Products',
searchProducts: 'Search grocery products...',
allProducts: 'All Products',
loadingProducts: 'Loading products...',
noProducts: 'No Products Available',
productsWillAppear: 'Products will appear here when added by the store admin.',
addToCart: 'Add to Cart',
cartTitle: 'My Shopping Cart',
emptyCart: 'Your Cart is Empty',
addGroceries: 'Add some grocery products!',
total: 'Total',
proceedCheckout: 'Proceed to Checkout',
checkout: 'Checkout',
customerName: 'Customer Name',
phoneNumber: 'Phone Number',
deliveryAddress: 'Delivery Address',
orderNotes: 'Order Notes',
placeOrder: 'Place Order',
backToCart: 'Back to Cart',
  },

  si: {
    storeName: 'සුනිල් ස්ටෝර්ස්',
    dashboard: 'පරිපාලක පුවරුව',
    welcome: 'සුනිල් ස්ටෝර්ස් වෙත සාදරයෙන් පිළිගනිමු',
    manageProducts: 'භාණ්ඩ කළමනාකරණය',
    manageCategories: 'වර්ග කළමනාකරණය',
    manageOrders: 'ඇණවුම් කළමනාකරණය',
    totalProducts: 'මුළු භාණ්ඩ',
    categories: 'භාණ්ඩ වර්ග',
    totalOrders: 'මුළු ඇණවුම්',
    customers: 'පාරිභෝගිකයින්',
    addProduct: 'භාණ්ඩයක් එක් කරන්න',
    addCategory: 'වර්ගයක් එක් කරන්න',
    search: 'සොයන්න',
    save: 'සුරකින්න',
    cancel: 'අවලංගු කරන්න',
    logout: 'ඉවත් වන්න',
    home: 'මුල් පිටුව',
    products: 'භාණ්ඩ',
    contact: 'අමතන්න',
    callStore: 'වෙළඳසැල අමතන්න',
    admin: 'පරිපාලක',
    categoriesTitle: 'අපගේ භාණ්ඩ වර්ග',
exploreCategories: 'ඔබට අවශ්‍ය දෛනික භාණ්ඩ තෝරාගන්න',
exploreProducts: 'භාණ්ඩ බලන්න',
ourStore: 'අපගේ වෙළඳසැල',
featuredProducts: 'විශේෂිත භාණ්ඩ',
searchProducts: 'භාණ්ඩ සොයන්න...',
allProducts: 'සියලුම භාණ්ඩ',
loadingProducts: 'භාණ්ඩ පූරණය වෙමින් පවතී...',
noProducts: 'භාණ්ඩ නොමැත',
productsWillAppear: 'වෙළඳසැල් පරිපාලක විසින් එකතු කරන භාණ්ඩ මෙහි දිස්වනු ඇත.',
addToCart: 'කරත්තයට එක් කරන්න',
cartTitle: 'මගේ සාප්පු කරත්තය',
emptyCart: 'ඔබගේ කරත්තය හිස්',
addGroceries: 'කරුණාකර භාණ්ඩ කිහිපයක් එක් කරන්න!',
total: 'මුළු එකතුව',
proceedCheckout: 'ඇණවුම තහවුරු කිරීමට යන්න',
checkout: 'ඇණවුම',
customerName: 'පාරිභෝගික නම',
phoneNumber: 'දුරකථන අංකය',
deliveryAddress: 'බෙදාහැරීමේ ලිපිනය',
orderNotes: 'අමතර විස්තර',
placeOrder: 'ඇණවුම ලබා දෙන්න',
backToCart: 'කරත්තයට ආපසු යන්න',

  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem('sunil-store-language') || 'en'
  )

  useEffect(() => {
    localStorage.setItem('sunil-store-language', language)
  }, [language])

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage)
  }

  const t = (key) => translations[language]?.[key] || key

  return (
    <LanguageContext.Provider
      value={{ language, changeLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
