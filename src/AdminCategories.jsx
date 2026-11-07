
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useLanguage } from './LanguageContext'
import { Plus, Edit, Trash2, X, Tags, ArrowLeft } from 'lucide-react'

export default function AdminCategories({ onBack }) {
  const { language, t } = useLanguage()
  const si = language === 'si'

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [error, setError] = useState('')

  const emptyForm = {
    name: '',
    description: '',
    image_url: '',
    is_active: true,
  }

  const [form, setForm] = useState(emptyForm)

  const loadCategories = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setCategories(data || [])
      setError('')
    }

    setLoading(false)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const updateField = (e) => {
    const { name, value, checked, type } = e.target

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setImageFile(null)
    setError('')
    setShowForm(true)
  }

  const openEditForm = (category) => {
    setEditingId(category.id)
    setForm({
      name: category.name || '',
      description: category.description || '',
      image_url: category.image_url || '',
      is_active: category.is_active,
    })
    setImageFile(null)
    setError('')
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError(
        si ? 'කරුණාකර භාණ්ඩ වර්ගයේ නම ඇතුළත් කරන්න.' : 'Please enter a category name.'
      )
      return
    }

    setSaving(true)

    let imageUrl = form.image_url

    if (imageFile) {
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '-')
      const filePath = `categories/${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        setError(
          si
            ? `පින්තූරය උඩුගත කිරීම අසාර්ථකයි: ${uploadError.message}`
            : uploadError.message
        )
        setSaving(false)
        return
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      imageUrl = data.publicUrl
    }

    const categoryData = {
      name: form.name.trim(),
      description: form.description.trim(),
      image_url: imageUrl || null,
      is_active: form.is_active,
    }

    const result = editingId
      ? await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingId)
      : await supabase
          .from('categories')
          .insert([categoryData])

    if (result.error) {
      setError(result.error.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setShowForm(false)
    setImageFile(null)
    await loadCategories()
  }

  const deleteCategory = async (category) => {
    const confirmed = window.confirm(
      si
        ? `"${category.name}" භාණ්ඩ වර්ගය මකා දැමීමට අවශ්‍යද?`
        : `Delete category "${category.name}"?`
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id)

    if (error) {
      setError(
        si
          ? 'මෙම වර්ගය මකා දැමිය නොහැක. එයට භාණ්ඩ සම්බන්ධ වී තිබිය හැක. එවැනි අවස්ථාවක එය අක්‍රීය කරන්න.'
          : 'Could not delete this category. It may contain products. Deactivate it instead if products are linked.'
      )
      return
    }

    await loadCategories()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

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
              {si ? 'භාණ්ඩ වර්ග කළමනාකරණය' : 'Category Management'}
            </h1>

            <p className="text-gray-500 mt-1">
              {si
                ? 'සුනිල් ස්ටෝර්ස් භාණ්ඩ වර්ග කළමනාකරණය කරන්න.'
                : 'Manage Sunil Store categories.'}
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg font-semibold"
          >
            <Plus size={20} />
            {si ? 'වර්ගයක් එක් කරන්න' : 'Add Category'}
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
                  ? (si ? 'වර්ගය සංස්කරණය කරන්න' : 'Edit Category')
                  : (si ? 'නව වර්ගයක් එක් කරන්න' : 'Add New Category')}
              </h2>

              <button onClick={() => setShowForm(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">

              <div>
                <label className="block font-semibold mb-2">
                  {si ? 'භාණ්ඩ වර්ගයේ නම' : 'Category Name'}
                </label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  className="w-full border rounded-lg p-3"
                  placeholder={si ? 'උදා: සිල්ලර භාණ්ඩ' : 'Grocery Items'}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  {si ? 'විස්තරය' : 'Description'}
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  rows={3}
                  className="w-full border rounded-lg p-3"
                  placeholder={si ? 'භාණ්ඩ වර්ගය පිළිබඳ විස්තරය' : 'Category description'}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  {si ? 'භාණ්ඩ වර්ගයේ පින්තූරය' : 'Category Image'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(e.target.files?.[0] || null)
                  }
                  className="w-full border rounded-lg p-3"
                />
              </div>

              {form.image_url && !imageFile && (
                <img
                  src={form.image_url}
                  alt={form.name}
                  className="w-28 h-28 object-cover rounded-lg"
                />
              )}

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={updateField}
                  className="w-5 h-5"
                />
                <span className="font-semibold">
                  {si ? 'සක්‍රීය භාණ්ඩ වර්ගයක්' : 'Active Category'}
                </span>
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold"
                >
                  {saving
                    ? (si ? 'සුරකිමින්...' : 'Saving...')
                    : editingId
                      ? (si ? 'වර්ගය යාවත්කාලීන කරන්න' : 'Update Category')
                      : (si ? 'වර්ගය සුරකින්න' : 'Save Category')}
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
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Tags className="text-green-700" />
              {si ? 'සියලුම භාණ්ඩ වර්ග' : 'All Categories'} ({categories.length})
            </h2>
          </div>

          {loading ? (
            <p className="p-8 text-center text-gray-500">
              {si ? 'භාණ්ඩ වර්ග පූරණය වෙමින්...' : 'Loading categories...'}
            </p>
          ) : categories.length === 0 ? (
            <p className="p-8 text-center text-gray-500">
              {si ? 'භාණ්ඩ වර්ග හමු නොවීය.' : 'No categories found.'}
            </p>
          ) : (
            <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4">{si ? 'භාණ්ඩ වර්ගය' : 'Category'}</th>
                    <th className="p-4">{si ? 'විස්තරය' : 'Description'}</th>
                    <th className="p-4">{si ? 'තත්ත්වය' : 'Status'}</th>
                    <th className="p-4">{si ? 'ක්‍රියාකාරකම්' : 'Actions'}</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-t">
                      <td className="p-4">
                        <div className="flex items-center gap-3 min-w-48">
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt={category.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                              <Tags className="text-green-700" />
                            </div>
                          )}
                          <span className="font-semibold">
                            {category.name}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-gray-600">
                        {category.description || '-'}
                      </td>

                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          category.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {category.is_active
                            ? (si ? 'සක්‍රීයයි' : 'Active')
                            : (si ? 'අක්‍රීයයි' : 'Inactive')}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => openEditForm(category)}
                            className="text-blue-600"
                            title={si ? 'සංස්කරණය' : 'Edit'}
                          >
                            <Edit size={19} />
                          </button>

                          <button
                            onClick={() => deleteCategory(category)}
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
              {categories.map((category) => (
                <article key={category.id} className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    {category.image_url ? (
                      <img src={category.image_url} alt={category.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-green-50">
                        <Tags className="text-green-700" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-semibold">{category.name}</p>
                      <p className="mt-1 break-words text-sm text-gray-600">{category.description || '-'}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      category.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {category.is_active ? (si ? 'සක්‍රීයයි' : 'Active') : (si ? 'අක්‍රීයයි' : 'Inactive')}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
                    <button
                      onClick={() => openEditForm(category)}
                      className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-blue-50 px-3 text-sm font-semibold text-blue-700"
                    >
                      <Edit size={16} /> {si ? 'සංස්කරණය' : 'Edit'}
                    </button>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-red-50 px-3 text-sm font-semibold text-red-700"
                    >
                      <Trash2 size={16} /> {si ? 'මකන්න' : 'Delete'}
                    </button>
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
