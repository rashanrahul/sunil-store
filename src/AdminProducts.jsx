
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useLanguage } from './LanguageContext'
import { Plus, Edit, Trash2, X, Package, ArrowLeft } from 'lucide-react'

export default function AdminProducts({ onBack }) {
  const { language, t } = useLanguage()
  const si = language === 'si'

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState(null)

  const emptyForm = {
    category_id: '',
    name: '',
    description: '',
    price: '',
    unit: '',
    stock_quantity: '',
    image_url: '',
    is_active: true,
  }

  const [form, setForm] = useState(emptyForm)

  const loadData = async () => {
    setLoading(true)
    setError('')

    const [productResult, categoryResult] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('is_active', true).order('name'),
    ])

    if (productResult.error || categoryResult.error) {
      setError(
        productResult.error?.message ||
        categoryResult.error?.message ||
        (si ? 'දත්ත ලබා ගැනීමට නොහැක.' : 'Unable to load data.')
      )
    } else {
      setProducts(productResult.data || [])
      setCategories(categoryResult.data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const updateField = (e) => {
    const { name, value, type, checked } = e.target

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const openAddForm = () => {
    setEditingId(null)
    setForm({
      ...emptyForm,
      category_id: categories[0]?.id || '',
    })
    setImageFile(null)
    setError('')
    setShowForm(true)
  }

  const openEditForm = (product) => {
    setEditingId(product.id)
    setForm({
      category_id: product.category_id || '',
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      unit: product.unit || '',
      stock_quantity: product.stock_quantity ?? '',
      image_url: product.image_url || '',
      is_active: product.is_active,
    })
    setImageFile(null)
    setError('')
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.category_id) {
      setError(si ? 'කරුණාකර භාණ්ඩ වර්ගයක් තෝරන්න.' : 'Please select a category.')
      return
    }

    if (Number(form.price) < 0 || Number(form.stock_quantity) < 0) {
      setError(si ? 'මිල සහ තොග ප්‍රමාණය ඍණ විය නොහැක.' : 'Price and stock cannot be negative.')
      return
    }

    setSaving(true)

    let imageUrl = form.image_url

    if (imageFile) {
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '-')
      const filePath = `${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        setError(
          `${si ? 'පින්තූරය උඩුගත කිරීම අසාර්ථකයි' : 'Image upload failed'}: ${uploadError.message}`
        )
        setSaving(false)
        return
      }

      const { data: publicData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      imageUrl = publicData.publicUrl
    }

    const productData = {
      category_id: form.category_id,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      unit: form.unit.trim(),
      stock_quantity: Number(form.stock_quantity),
      image_url: imageUrl || null,
      is_active: form.is_active,
    }

    const result = editingId
      ? await supabase.from('products').update(productData).eq('id', editingId)
      : await supabase.from('products').insert([productData])

    if (result.error) {
      setError(result.error.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setShowForm(false)
    setImageFile(null)
    await loadData()
  }

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(
      si
        ? `ඔබට ${product.name} භාණ්ඩය මකා දැමීමට අවශ්‍යද?`
        : `Are you sure you want to delete ${product.name}?`
    )

    if (!confirmed) return

    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    await loadData()
  }

  const getCategoryName = (id) => {
    return categories.find((category) => category.id === id)?.name || (si ? 'නොදනී' : 'Unknown')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-green-700 mb-3"
            >
              <ArrowLeft size={18} />
              {si ? 'Dashboard වෙත ආපසු' : 'Back to Dashboard'}
            </button>

            <h1 className="text-3xl font-bold text-green-900">
              {si ? 'භාණ්ඩ කළමනාකරණය' : 'Product Management'}
            </h1>

            <p className="text-gray-500 mt-1">
              {si
                ? 'සුනිල් ස්ටෝර්ස් භාණ්ඩ එකතු කිරීම සහ කළමනාකරණය.'
                : 'Add and manage Sunil Store products.'}
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg font-semibold"
          >
            <Plus size={20} />
            {t('addProduct')}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-5">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingId
                  ? (si ? 'භාණ්ඩය සංස්කරණය කරන්න' : 'Edit Product')
                  : (si ? 'නව භාණ්ඩයක් එක් කරන්න' : 'Add New Product')}
              </h2>

              <button onClick={() => setShowForm(false)}>
                <X size={24} />
              </button>
            </div>

            {categories.length === 0 ? (
              <p className="text-orange-700">
                {si
                  ? 'භාණ්ඩ එකතු කිරීමට පෙර සක්‍රීය භාණ්ඩ වර්ගයක් එකතු කරන්න.'
                  : 'Please add an active category before adding products.'}
              </p>
            ) : (
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block font-semibold mb-2">
                    {si ? 'භාණ්ඩයේ නම' : 'Product Name'}
                  </label>
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    className="w-full border rounded-lg p-3"
                    placeholder={si ? 'භාණ්ඩයේ නම ඇතුළත් කරන්න' : 'Enter product name'}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    {si ? 'භාණ්ඩ වර්ගය' : 'Category'}
                  </label>
                  <select
                    required
                    name="category_id"
                    value={form.category_id}
                    onChange={updateField}
                    className="w-full border rounded-lg p-3"
                  >
                    <option value="">
                      {si ? 'භාණ්ඩ වර්ගය තෝරන්න' : 'Select Category'}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    {si ? 'මිල (රු.)' : 'Price (Rs.)'}
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={form.price}
                    onChange={updateField}
                    className="w-full border rounded-lg p-3"
                    placeholder="250"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    {si ? 'ඒකකය' : 'Unit'}
                  </label>
                  <input
                    required
                    name="unit"
                    value={form.unit}
                    onChange={updateField}
                    className="w-full border rounded-lg p-3"
                    placeholder="1 kg / 500 g / 1 bottle"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    {si ? 'තොග ප්‍රමාණය' : 'Stock Quantity'}
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    name="stock_quantity"
                    value={form.stock_quantity}
                    onChange={updateField}
                    className="w-full border rounded-lg p-3"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    {si ? 'භාණ්ඩයේ පින්තූරය' : 'Product Image'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full border rounded-lg p-3"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">
                    {si ? 'විස්තරය' : 'Description'}
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    rows={3}
                    className="w-full border rounded-lg p-3"
                    placeholder={si ? 'භාණ්ඩය පිළිබඳ විස්තරය' : 'Product description'}
                  />
                </div>

                {form.image_url && !imageFile && (
                  <div className="md:col-span-2">
                    <p className="font-semibold mb-2">
                      {si ? 'දැනට ඇති පින්තූරය' : 'Current Image'}
                    </p>
                    <img
                      src={form.image_url}
                      alt="Current product"
                      className="w-28 h-28 object-cover rounded-lg"
                    />
                  </div>
                )}

                <label className="md:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={updateField}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">
                    {si ? 'සක්‍රීය භාණ්ඩයක්' : 'Active Product'}
                  </span>
                </label>

                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold"
                  >
                    {saving
                      ? (si ? 'සුරකිමින්...' : 'Saving...')
                      : editingId
                        ? (si ? 'භාණ්ඩය යාවත්කාලීන කරන්න' : 'Update Product')
                        : (si ? 'භාණ්ඩය සුරකින්න' : 'Save Product')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="border px-6 py-3 rounded-lg"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="text-green-700" />
              {si ? 'සියලුම භාණ්ඩ' : 'All Products'} ({products.length})
            </h2>
          </div>

          {loading ? (
            <p className="p-8 text-center text-gray-500">
              {si ? 'භාණ්ඩ පූරණය වෙමින්...' : 'Loading products...'}
            </p>
          ) : products.length === 0 ? (
            <p className="p-8 text-center text-gray-500">
              {si ? 'භාණ්ඩ හමු නොවීය.' : 'No products found.'}
            </p>
          ) : (
            <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4">{si ? 'භාණ්ඩය' : 'Product'}</th>
                    <th className="p-4">{si ? 'වර්ගය' : 'Category'}</th>
                    <th className="p-4">{si ? 'මිල' : 'Price'}</th>
                    <th className="p-4">{si ? 'තොගය' : 'Stock'}</th>
                    <th className="p-4">{si ? 'තත්ත්වය' : 'Status'}</th>
                    <th className="p-4">{si ? 'ක්‍රියාකාරකම්' : 'Actions'}</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t">
                      <td className="p-4">
                        <div className="flex items-center gap-3 min-w-48">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                              <Package className="text-green-700" />
                            </div>
                          )}

                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.unit}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">{getCategoryName(product.category_id)}</td>
                      <td className="p-4">Rs. {Number(product.price).toFixed(2)}</td>
                      <td className="p-4">{product.stock_quantity}</td>

                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.is_active
                            ? (si ? 'සක්‍රීයයි' : 'Active')
                            : (si ? 'අක්‍රීයයි' : 'Inactive')}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => openEditForm(product)}
                            className="text-blue-600"
                            title={si ? 'සංස්කරණය' : 'Edit'}
                          >
                            <Edit size={19} />
                          </button>

                          <button
                            onClick={() => deleteProduct(product)}
                            className="text-red-600"
                            title={si ? 'මකා දමන්න' : 'Delete'}
                          >
                            <Trash2 size={19} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y md:hidden">
              {products.map((product) => (
                <article key={product.id} className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-green-50">
                        <Package className="text-green-700" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-500">{getCategoryName(product.category_id)} · {product.unit}</p>
                      <p className="mt-1 font-bold text-green-800">Rs. {Number(product.price).toFixed(2)}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.is_active ? (si ? 'සක්‍රීයයි' : 'Active') : (si ? 'අක්‍රීයයි' : 'Inactive')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                    <p className="text-sm text-gray-600">{si ? 'තොගය' : 'Stock'}: {product.stock_quantity}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEditForm(product)}
                        className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-blue-50 px-3 text-sm font-semibold text-blue-700"
                      >
                        <Edit size={16} /> {si ? 'සංස්කරණය' : 'Edit'}
                      </button>
                      <button
                        onClick={() => deleteProduct(product)}
                        className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-red-50 px-3 text-sm font-semibold text-red-700"
                      >
                        <Trash2 size={16} /> {si ? 'මකන්න' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
