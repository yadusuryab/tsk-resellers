'use client';

import { useState, useEffect } from 'react';
import { sanityClient } from '@/lib/sanity';
import { 
  IconSearch,
  IconTrash,
  IconCheck,
  IconX,
  IconStar,
  IconStarFilled
} from '@tabler/icons-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const data = await sanityClient.fetch(`
      *[_type == "review"] | order(createdAt desc) {
        _id,
        name,
        phone,
        instaId,
        rating,
        review,
        createdAt,
        "product": product->{
          _id,
          name
        }
      }
    `);
    setReviews(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await sanityClient.delete(id);
        fetchReviews();
      } catch (error) {
        alert('Failed to delete review');
      }
    }
  };

  const handleApprove = async (id: string) => {
    // Add approval logic if needed
    alert('Review approved');
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    
    return matchesSearch && matchesRating;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <IconStarFilled key={star} size={16} className="text-yellow-400" />
          ) : (
            <IconStar key={star} size={16} className="text-gray-300" />
          )
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-1">Manage product reviews</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full"
          />
        </div>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          Loading...
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    {review.instaId && (
                      <p className="text-sm text-gray-500">@{review.instaId}</p>
                    )}
                    {review.phone && (
                      <p className="text-sm text-gray-500">{review.phone}</p>
                    )}
                  </div>
                  {review.product && (
                    <p className="text-sm text-primary mb-2">
                      Product: {review.product.name}
                    </p>
                  )}
                  {renderStars(review.rating)}
                  <p className="mt-3 text-gray-700">{review.review}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(review._id)}
                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                  >
                    <IconCheck size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}