'use client';

import { useState, useEffect } from 'react';
import { sanityClient } from '@/lib/sanity';
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye,
  IconX,
  IconCheck,
  IconPhoto,
  IconVideo
} from '@tabler/icons-react';
import Image from 'next/image';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    mediaType: 'image',
    buttonText: '',
    buttonLink: '',
    textPosition: 'center',
    textColor: 'dark',
    active: true,
    order: 0,
    startDate: '',
    endDate: '',
    image: null as File | null,
    imagePreview: '',
    video: null as File | null,
    videoPoster: null as File | null,
    videoPosterPreview: '',
    existingImage: null as any,
    existingVideo: null as any,
    existingPoster: null as any,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const data = await sanityClient.fetch(`
      *[_type == "banner"] | order(order asc) {
        _id,
        title,
        subtitle,
        mediaType,
        buttonText,
        buttonLink,
        textPosition,
        textColor,
        active,
        order,
        startDate,
        endDate,
        "image": image.asset->url,
        "video": video.asset->url,
        "videoPoster": videoPoster.asset->url
      }
    `);
    setBanners(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageAsset = formData.existingImage;
      let videoAsset = formData.existingVideo;
      let posterAsset = formData.existingPoster;

      if (formData.image) {
        const asset = await sanityClient.assets.upload('image', formData.image);
        imageAsset = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
      }

      if (formData.video) {
        const asset = await sanityClient.assets.upload('file', formData.video);
        videoAsset = { _type: 'file', asset: { _type: 'reference', _ref: asset._id } };
      }

      if (formData.videoPoster) {
        const asset = await sanityClient.assets.upload('image', formData.videoPoster);
        posterAsset = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
      }

      const bannerData: any = {
        _type: 'banner',
        title: formData.title,
        subtitle: formData.subtitle,
        mediaType: formData.mediaType,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
        textPosition: formData.textPosition,
        textColor: formData.textColor,
        active: formData.active,
        order: formData.order,
      };

      if (formData.startDate) bannerData.startDate = formData.startDate;
      if (formData.endDate) bannerData.endDate = formData.endDate;
      
      if (formData.mediaType === 'image' && imageAsset) {
        bannerData.image = imageAsset;
      } else if (formData.mediaType === 'video') {
        if (videoAsset) bannerData.video = videoAsset;
        if (posterAsset) bannerData.videoPoster = posterAsset;
      }

      if (editingBanner) {
        await sanityClient
          .patch(editingBanner._id)
          .set(bannerData)
          .commit();
      } else {
        await sanityClient.create(bannerData);
      }

      resetForm();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        await sanityClient.delete(id);
        fetchBanners();
      } catch (error) {
        alert('Failed to delete banner');
      }
    }
  };

  const handleToggleActive = async (banner: any) => {
    try {
      await sanityClient
        .patch(banner._id)
        .set({ active: !banner.active })
        .commit();
      fetchBanners();
    } catch (error) {
      alert('Failed to update banner');
    }
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      mediaType: banner.mediaType || 'image',
      buttonText: banner.buttonText || '',
      buttonLink: banner.buttonLink || '',
      textPosition: banner.textPosition || 'center',
      textColor: banner.textColor || 'dark',
      active: banner.active !== false,
      order: banner.order || 0,
      startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
      image: null,
      imagePreview: '',
      video: null,
      videoPoster: null,
      videoPosterPreview: '',
      existingImage: banner.image ? { url: banner.image } : null,
      existingVideo: banner.video ? { url: banner.video } : null,
      existingPoster: banner.videoPoster ? { url: banner.videoPoster } : null,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      mediaType: 'image',
      buttonText: '',
      buttonLink: '',
      textPosition: 'center',
      textColor: 'dark',
      active: true,
      order: 0,
      startDate: '',
      endDate: '',
      image: null,
      imagePreview: '',
      video: null,
      videoPoster: null,
      videoPosterPreview: '',
      existingImage: null,
      existingVideo: null,
      existingPoster: null,
    });
    setEditingBanner(null);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-600 mt-1">Manage homepage banners</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <IconPlus size={18} />
          Add Banner
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div key={banner._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {banner.mediaType === 'image' && banner.image ? (
                  <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                ) : banner.videoPoster ? (
                  <Image src={banner.videoPoster} alt={banner.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {banner.mediaType === 'video' ? (
                      <IconVideo size={40} className="text-gray-400" />
                    ) : (
                      <IconPhoto size={40} className="text-gray-400" />
                    )}
                  </div>
                )}
                {banner.active ? (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                <p className="text-sm text-gray-500 truncate">{banner.subtitle}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {banner.mediaType}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {banner.textPosition}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 text-sm ${
                      banner.active 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    <IconCheck size={14} />
                    {banner.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-1 text-sm"
                  >
                    <IconEdit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingBanner ? 'Edit Banner' : 'Add Banner'}
              </h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-lg">
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Media Type
                  </label>
                  <select
                    value={formData.mediaType}
                    onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Position
                  </label>
                  <select
                    value={formData.textPosition}
                    onChange={(e) => setFormData({ ...formData, textPosition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Color
                  </label>
                  <select
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {formData.mediaType === 'image' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banner Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({
                          ...formData,
                          image: file,
                          imagePreview: URL.createObjectURL(file),
                          existingImage: null,
                        });
                      }
                    }}
                    className="w-full"
                  />
                  {(formData.imagePreview || formData.existingImage?.url) && (
                    <img
                      src={formData.imagePreview || formData.existingImage?.url}
                      alt="Preview"
                      className="mt-2 w-full h-40 object-cover rounded-lg"
                    />
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video File
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({
                            ...formData,
                            video: file,
                            existingVideo: null,
                          });
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video Poster (Thumbnail)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({
                            ...formData,
                            videoPoster: file,
                            videoPosterPreview: URL.createObjectURL(file),
                            existingPoster: null,
                          });
                        }
                      }}
                      className="w-full"
                    />
                    {(formData.videoPosterPreview || formData.existingPoster?.url) && (
                      <img
                        src={formData.videoPosterPreview || formData.existingPoster?.url}
                        alt="Poster Preview"
                        className="mt-2 w-full h-40 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </>
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingBanner ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}