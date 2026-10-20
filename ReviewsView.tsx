import React, { useState } from 'react';
import { CustomerReview } from '../types';
import { Star, MessageSquare, ThumbsUp, ShieldCheck, CheckCircle2, Filter } from 'lucide-react';

interface ReviewsViewProps {
  reviews: CustomerReview[];
  onOpenNewReviewModal: () => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  reviews,
  onOpenNewReviewModal,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Extract unique tags
  const allTags = Array.from(new Set(reviews.flatMap((r) => r.tags)));

  const filteredReviews = reviews.filter((r) => {
    if (selectedTag === 'all') return true;
    return r.tags.includes(selectedTag);
  });

  return (
    <div className="space-y-6">
      {/* Header & Rating Metric Strip */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#222222] p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Verified Customer Feedback</h2>
          <p className="text-xs text-slate-400 mt-1">
            Ratings gathered from verified recipients following PIN-verified parcel deliveries.
          </p>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-[#222222] pt-4 md:pt-0 md:pl-6">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-white tabular-nums tracking-tight">4.95</span>
            <div className="flex items-center justify-center text-amber-400 text-sm mt-0.5">
              {'★★★★★'}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">3,420+ Reviews</span>
          </div>

          <button
            onClick={onOpenNewReviewModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-600/20 transition-colors whitespace-nowrap"
          >
            Leave Delivery Review
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter by:
        </span>
        <button
          onClick={() => setSelectedTag('all')}
          className={`px-3 py-1 rounded-lg border transition-all whitespace-nowrap ${
            selectedTag === 'all'
              ? 'bg-blue-600 text-white border-blue-400'
              : 'bg-[#121212] text-slate-300 border-[#262626] hover:text-white'
          }`}
        >
          All Feedback
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-lg border transition-all whitespace-nowrap ${
              selectedTag === tag
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-[#121212] text-slate-300 border-[#262626] hover:text-white'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 bg-[#111111] rounded-xl border border-[#222222] shadow-md flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">{rev.customerName}</h4>
                  {rev.customerRole && <p className="text-[11px] text-slate-400">{rev.customerRole}</p>}
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold tabular-nums">
                  {'★'.repeat(rev.rating)}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>

            <div className="pt-3 border-t border-[#1e1e1e] space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {rev.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] text-blue-300 bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Delivered by <strong className="text-slate-300">{rev.riderName}</strong></span>
                <span>{rev.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
