'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { sanityClient } from '@/lib/sanity';
import Link from 'next/link';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconX,
  IconCheck,
  IconRefresh,
  IconEye,
  IconStar,
  IconStarFilled,
  IconPackage,
  IconAlertCircle,
  IconChevronDown,
} from '@tabler/icons-react';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  salesPrice: number;
  quantity: number;
  soldOut: boolean;
  codAvailable: boolean;
  featured: boolean;
  sizes: string[];
  colors: string[];
  features: string[];
  images: Array<{ url: string; alt?: string }>;
  category?: { _id: string; name: string };
  _createdAt?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

// ── Toast system ─────────────────────────────────────────────────────────────
function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 10, minWidth: 280,
            background: t.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${t.type === 'success' ? '#10b981' : '#ef4444'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            animation: 'slideIn 0.2s ease',
          }}
        >
          {t.type === 'success'
            ? <IconCheck size={16} color="#059669" />
            : <IconAlertCircle size={16} color="#dc2626" />}
          <span style={{ flex: 1, fontSize: 13, color: t.type === 'success' ? '#065f46' : '#991b1b', fontWeight: 500 }}>{t.message}</span>
          <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
            <IconX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const remove = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 360, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <IconTrash size={20} color="#dc2626" />
        </div>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#374151', textAlign: 'center', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '9px 0', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#374151' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, color, background: bg, letterSpacing: '0.02em' }}>
      {label}
    </span>
  );
}

// ── Tag input ─────────────────────────────────────────────────────────────────
function TagInput({ label, placeholder, tags, onAdd, onRemove }: {
  label: string; placeholder: string; tags: string[];
  onAdd: (v: string) => void; onRemove: (i: number) => void;
}) {
  const [val, setVal] = useState('');
  const add = () => { if (val.trim()) { onAdd(val.trim()); setVal(''); } };
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          style={inputStyle}
        />
        <button type="button" onClick={add} style={secondaryBtnStyle}>Add</button>
      </div>
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {tags.map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#f3f4f6', borderRadius: 20, fontSize: 12, fontWeight: 500, color: '#374151' }}>
              {t}
              <button type="button" onClick={() => onRemove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af', display: 'flex', lineHeight: 1 }}>
                <IconX size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  flex: 1, width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8,
  fontSize: 13, outline: 'none', color: '#111827', background: '#fff', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '0.02em' };
const secondaryBtnStyle: React.CSSProperties = { padding: '9px 16px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#374151', whiteSpace: 'nowrap', flexShrink: 0 };

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const { toasts, add: toast, remove: removeToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const previewUrlsRef = useRef<string[]>([]);

  const emptyForm = {
    name: '', description: '', price: '', salesPrice: '',
    category: '', quantity: '0', codAvailable: true, featured: false,
    sizes: [] as string[], colors: [] as string[], features: [] as string[],
    images: [] as File[], imagePreviews: [] as string[], existingImages: [] as any[],
  };
  const [formData, setFormData] = useState({ ...emptyForm });

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => { previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url)); };
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await sanityClient.fetch(`
        *[_type == "product"] | order(_createdAt desc) {
          _id, _createdAt, name, description, price, salesPrice,
          quantity, soldOut, codAvailable, featured, sizes, colors, features,
          "images": images[]{ "url": asset->url, alt },
          "category": category->{ _id, name }
        }
      `);
      setProducts(data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching products:', error);
      setFetchError('Failed to load products. Check Sanity connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await sanityClient.fetch(`*[_type == "category"] | order(name asc) { _id, name }`);
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    const interval = setInterval(fetchProducts, 60000);
    return () => clearInterval(interval);
  }, [fetchProducts, fetchCategories]);

  const resetForm = useCallback(() => {
    // Revoke all preview URLs
    previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
    setFormData({ ...emptyForm });
    setEditingProduct(null);
    setShowModal(false);
  }, []);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      salesPrice: product.salesPrice?.toString() || '',
      category: product.category?._id || '',
      quantity: product.quantity?.toString() ?? '0',
      codAvailable: product.codAvailable !== false,
      featured: product.featured || false,
      sizes: product.sizes || [],
      colors: product.colors || [],
      features: product.features || [],
      images: [],
      imagePreviews: [],
      existingImages: product.images || [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      // Upload new images
      const uploadedImages: any[] = [];
      for (const file of formData.images) {
        try {
          const asset = await sanityClient.assets.upload('image', file, { filename: file.name });
          uploadedImages.push({
            _type: 'image',
            _key: asset._id,
            asset: { _type: 'reference', _ref: asset._id },
            alt: formData.name,
          });
        } catch (err) {
          console.error('Image upload failed:', err);
          toast(`Failed to upload image: ${file.name}`, 'error');
        }
      }

      const allImages = [
        ...formData.existingImages.map((img: any) => ({
          _type: 'image',
          _key: img._key || img.url,
          asset: img.asset || { _type: 'reference', _ref: img._ref },
          alt: img.alt || formData.name,
        })),
        ...uploadedImages,
      ];

      const stockQuantity = Math.max(0, parseInt(formData.quantity) || 0);
      // Auto-derive soldOut from quantity
      const soldOut = stockQuantity === 0;

      const productData = {
        _type: 'product',
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        salesPrice: parseFloat(formData.salesPrice) || 0,
        quantity: stockQuantity,
        soldOut,
        codAvailable: formData.codAvailable,
        featured: formData.featured,
        sizes: formData.sizes,
        colors: formData.colors,
        features: formData.features,
        images: allImages,
        ...(formData.category && { category: { _type: 'reference', _ref: formData.category } }),
      };

      if (editingProduct) {
        await sanityClient.patch(editingProduct._id).set(productData).commit();
        toast('Product updated successfully!');
      } else {
        await sanityClient.create(productData);
        toast('Product created successfully!');
      }

      await fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast(`Failed to save product: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDelete(null);
    try {
      await sanityClient.delete(id);
      await fetchProducts();
      toast('Product deleted.');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast('Failed to delete product.', 'error');
    }
  };

  const handleToggleSoldOut = async (product: Product) => {
    if (toggling) return;
    setToggling(product._id + '-sold');
    try {
      const newSoldOut = !product.soldOut;
      await sanityClient.patch(product._id).set({
        soldOut: newSoldOut,
        // If marking back in stock and qty is 0, bump to 1
        ...(newSoldOut === false && product.quantity === 0 ? { quantity: 1 } : {}),
      }).commit();
      await fetchProducts();
      toast(newSoldOut ? 'Marked as sold out.' : 'Marked as in stock.');
    } catch (error) {
      toast('Failed to update stock status.', 'error');
    } finally {
      setToggling(null);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    if (toggling) return;
    setToggling(product._id + '-feat');
    try {
      await sanityClient.patch(product._id).set({ featured: !product.featured }).commit();
      await fetchProducts();
      toast(product.featured ? 'Removed from featured.' : 'Added to featured.');
    } catch (error) {
      toast('Failed to update featured status.', 'error');
    } finally {
      setToggling(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map(f => {
      const url = URL.createObjectURL(f);
      previewUrlsRef.current.push(url);
      return url;
    });
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
      imagePreviews: [...prev.imagePreviews, ...previews],
    }));
    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(formData.imagePreviews[index]);
    previewUrlsRef.current = previewUrlsRef.current.filter(u => u !== formData.imagePreviews[index]);
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
    }));
  };

  const filteredProducts = products.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    const matchesCategory = !filterCategory || p.category?._id === filterCategory;
    const qty = p.quantity || 0;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'inStock' && !p.soldOut && qty > 0) ||
      (filterStatus === 'soldOut' && (p.soldOut || qty === 0)) ||
      (filterStatus === 'featured' && p.featured);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const counts = {
    all: products.length,
    inStock: products.filter(p => !p.soldOut && (p.quantity || 0) > 0).length,
    soldOut: products.filter(p => p.soldOut || (p.quantity || 0) === 0).length,
    featured: products.filter(p => p.featured).length,
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'inStock', label: 'In stock' },
    { key: 'soldOut', label: 'Sold out' },
    { key: 'featured', label: 'Featured' },
  ];

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#111827' }}>
      <ToastContainer toasts={toasts} remove={removeToast} />
      {confirmDelete && (
        <ConfirmDialog
          message="Delete this product? This cannot be undone."
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Products</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>Updated {lastUpdate.toLocaleTimeString()}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchProducts}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, cursor: loading ? 'default' : 'pointer', color: '#374151' }}
          >
            <IconRefresh size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button
            onClick={() => { setEditingProduct(null); setFormData({ ...emptyForm }); setShowModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: 'none', borderRadius: 8, background: '#111827', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            <IconPlus size={16} />
            Add product
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setFilterStatus(t.key)}
                style={{
                  padding: '6px 12px', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                  fontWeight: filterStatus === t.key ? 600 : 400,
                  background: filterStatus === t.key ? '#f3f4f6' : 'transparent',
                  color: filterStatus === t.key ? '#111827' : '#6b7280',
                }}
              >
                {t.label} <span style={{ fontSize: 11, color: filterStatus === t.key ? '#374151' : '#9ca3af' }}>{counts[t.key as keyof typeof counts]}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* Category filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                style={{ padding: '7px 32px 7px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, appearance: 'none', background: '#fff', color: '#374151', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">All categories</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <IconChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }} />
            </div>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <IconSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search products…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, width: 220, outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Grid or states */}
        {fetchError ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <IconAlertCircle size={32} color="#ef4444" style={{ marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: 14, color: '#dc2626', fontWeight: 500 }}>{fetchError}</p>
            <button onClick={fetchProducts} style={{ marginTop: 12, padding: '8px 20px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Retry</button>
          </div>
        ) : loading && products.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading products…</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            <IconPackage size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
            <p style={{ margin: 0 }}>No products found</p>
          </div>
        ) : (
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {filteredProducts.map(product => {
              const inStock = !product.soldOut && (product.quantity || 0) > 0;
              const qty = product.quantity || 0;
              return (
                <div
                  key={product._id}
                  style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', aspectRatio: '1', background: '#f9fafb', overflow: 'hidden' }}>
                    {product.images?.[0]?.url ? (
                      <Image src={product.images[0].url} alt={product.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' }}>
                        <IconPackage size={40} />
                      </div>
                    )}
                    {/* Overlay badges */}
                    <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {product.soldOut && <Badge label="Sold out" color="#991b1b" bg="#fee2e2" />}
                      {product.featured && <Badge label="Featured" color="#92400e" bg="#fef3c7" />}
                      {!product.codAvailable && <Badge label="No COD" color="#374151" bg="#f3f4f6" />}
                    </div>
                    {/* Image count */}
                    {(product.images?.length || 0) > 1 && (
                      <span style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 20 }}>
                        +{(product.images?.length || 1) - 1}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '12px 14px' }}>
                    <h3 style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                    <p style={{ margin: '0 0 8px', fontSize: 12, color: '#9ca3af' }}>{product.category?.name || 'Uncategorized'}</p>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <p style={{ margin: '0 0 1px', fontSize: 16, fontWeight: 700, color: '#111827' }}>₹{product.salesPrice?.toLocaleString()}</p>
                        {product.price > product.salesPrice && (
                          <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>₹{product.price?.toLocaleString()}</p>
                        )}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: qty > 0 ? '#059669' : '#dc2626' }}>
                        {qty > 0 ? `${qty} left` : 'Out of stock'}
                      </span>
                    </div>

                    {/* Sizes */}
                    {product.sizes?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                        {product.sizes.slice(0, 5).map((s: string) => (
                          <span key={s} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', background: '#f3f4f6', borderRadius: 4, color: '#374151' }}>{s}</span>
                        ))}
                        {product.sizes.length > 5 && <span style={{ fontSize: 10, color: '#9ca3af' }}>+{product.sizes.length - 5}</span>}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link
                        href={`/product/${product._id}`}
                        target="_blank"
                        style={{ flex: 1, padding: '7px 0', border: '1px solid #e5e7eb', borderRadius: 7, background: '#fff', color: '#374151', fontSize: 12, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                      >
                        <IconEye size={13} /> View
                      </Link>
                      <button
                        onClick={() => handleEdit(product)}
                        style={{ flex: 1, padding: '7px 0', border: 'none', borderRadius: 7, background: '#111827', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                      >
                        <IconEdit size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        disabled={toggling === product._id + '-feat'}
                        title={product.featured ? 'Unfeature' : 'Feature'}
                        style={{ padding: '7px 9px', border: `1px solid ${product.featured ? '#f59e0b' : '#e5e7eb'}`, borderRadius: 7, background: product.featured ? '#fef3c7' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: product.featured ? '#d97706' : '#9ca3af' }}
                      >
                        {product.featured ? <IconStarFilled size={13} /> : <IconStar size={13} />}
                      </button>
                      <button
                        onClick={() => handleToggleSoldOut(product)}
                        disabled={toggling === product._id + '-sold'}
                        title={product.soldOut ? 'Mark in stock' : 'Mark sold out'}
                        style={{ padding: '7px 9px', border: `1px solid ${inStock ? '#e5e7eb' : '#10b981'}`, borderRadius: 7, background: inStock ? '#fff' : '#d1fae5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: inStock ? '#9ca3af' : '#059669' }}
                      >
                        <IconRefresh size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(product._id)}
                        title="Delete"
                        style={{ padding: '7px 9px', border: '1px solid #fecaca', borderRadius: 7, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Product Modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 680, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', marginBottom: 24 }}>
            {/* Modal header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderRadius: '12px 12px 0 0' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>
                {editingProduct ? `Edit: ${editingProduct.name}` : 'Add new product'}
              </h2>
              <button onClick={resetForm} style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', borderRadius: 6 }}>
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>Product name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Classic Cotton T-Shirt"
                  style={{ ...inputStyle, flex: 'none' }}
                />
              </div>

              {/* Price row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={labelStyle}>MRP (₹) *</label>
                  <input type="number" required min="0" step="0.01" value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    style={{ ...inputStyle, flex: 'none' }} />
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={labelStyle}>Sale price (₹) *</label>
                  <input type="number" required min="0" step="0.01" value={formData.salesPrice}
                    onChange={e => setFormData({ ...formData, salesPrice: e.target.value })}
                    style={{ ...inputStyle, flex: 'none' }} />
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={labelStyle}>Stock qty</label>
                  <input type="number" min="0" value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    style={{ ...inputStyle, flex: 'none' }} />
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af' }}>0 = sold out</p>
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={labelStyle}>Category</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      style={{ ...inputStyle, flex: 'none', appearance: 'none', paddingRight: 28 }}
                    >
                      <option value="">None</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                    <IconChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }} />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the product…"
                  style={{ ...inputStyle, flex: 'none', resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>

              {/* Sizes / Colors / Features */}
              <TagInput
                label="Sizes"
                placeholder="e.g. S, M, L, XL — press Enter"
                tags={formData.sizes}
                onAdd={v => {
                  const u = v.toUpperCase();
                  if (!formData.sizes.includes(u)) setFormData(prev => ({ ...prev, sizes: [...prev.sizes, u] }));
                }}
                onRemove={i => setFormData(prev => ({ ...prev, sizes: prev.sizes.filter((_, idx) => idx !== i) }))}
              />
              <TagInput
                label="Colors"
                placeholder="e.g. Red, Navy Blue — press Enter"
                tags={formData.colors}
                onAdd={v => {
                  if (!formData.colors.includes(v)) setFormData(prev => ({ ...prev, colors: [...prev.colors, v] }));
                }}
                onRemove={i => setFormData(prev => ({ ...prev, colors: prev.colors.filter((_, idx) => idx !== i) }))}
              />
              <TagInput
                label="Key features"
                placeholder="e.g. Waterproof — press Enter"
                tags={formData.features}
                onAdd={v => {
                  if (!formData.features.includes(v)) setFormData(prev => ({ ...prev, features: [...prev.features, v] }));
                }}
                onRemove={i => setFormData(prev => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }))}
              />

              {/* Images */}
              <div>
                <label style={labelStyle}>Product images</label>
                <label
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '20px', border: '2px dashed #d1d5db', borderRadius: 10, cursor: 'pointer',
                    background: '#fafafa', marginBottom: 10,
                  }}
                >
                  <IconPackage size={24} color="#d1d5db" style={{ marginBottom: 6 }} />
                  <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Click to upload images</span>
                  <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>PNG, JPG, WEBP — multiple supported</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
                {(formData.existingImages.length > 0 || formData.imagePreviews.length > 0) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {formData.existingImages.map((img: any, i) => (
                      <div key={`ex-${i}`} style={{ position: 'relative', width: 72, height: 72 }}>
                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(i)}
                          style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                        >
                          <IconX size={10} />
                        </button>
                        {i === 0 && (
                          <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 9, fontWeight: 700, background: '#111827', color: '#fff', padding: '1px 4px', borderRadius: 3 }}>MAIN</span>
                        )}
                      </div>
                    ))}
                    {formData.imagePreviews.map((preview, i) => (
                      <div key={`new-${i}`} style={{ position: 'relative', width: 72, height: 72 }}>
                        <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '2px solid #3b82f6' }} />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                        >
                          <IconX size={10} />
                        </button>
                        <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 9, fontWeight: 700, background: '#3b82f6', color: '#fff', padding: '1px 4px', borderRadius: 3 }}>NEW</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { key: 'codAvailable', label: 'Cash on delivery available' },
                  { key: 'featured', label: 'Feature on homepage' },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#374151', userSelect: 'none' }}>
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      style={{
                        width: 36, height: 20, borderRadius: 20, transition: 'background 0.15s',
                        background: (formData as any)[key] ? '#111827' : '#d1d5db',
                        position: 'relative', cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      <div style={{
                        width: 14, height: 14, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3, transition: 'left 0.15s',
                        left: (formData as any)[key] ? 19 : 3,
                      }} />
                    </div>
                    {label}
                  </label>
                ))}
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ flex: 1, padding: '10px 0', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#374151' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2, padding: '10px 0', border: 'none', borderRadius: 8,
                    background: submitting ? '#9ca3af' : '#111827', color: '#fff',
                    fontSize: 14, fontWeight: 500, cursor: submitting ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {submitting ? (
                    <>
                      <IconRefresh size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      Saving…
                    </>
                  ) : editingProduct ? 'Update product' : 'Create product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}