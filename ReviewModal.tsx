import React, { useState } from 'react';
import { CustomerReview, OrderItem } from '../types';
import confetti from 'canvas-confetti';
import { Star, X, Check, ThumbsUp } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: OrderItem | null;
  onSubmitReview: (review: CustomerReview) => void;
}

const QUICK_TAGS = [
  'Super Fast Delivery',
  'Careful Handling',
  'Polite & Professional',
  'Accurate Live Tracking',
  'Smooth Handover',
  'Clean Vehicle',
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Super Fast Delivery', 'Polite & Professional']);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger celebratory confetti
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#38bdf8', '#10b981', '#ffffff'],
    });

    const newReview: CustomerReview = {
      id: `rev_${Date.now()}`,
      customerName: order?.senderName || 'Alexandria Vance',
      customerRole: 'Verified Customer',
      riderName: order?.rider?.name || 'Marcus Vance',
      rating,
      comment: comment || 'Outstanding delivery service. Prompt pickup and secure transit.',
      tags: selectedTags.length > 0 ? selectedTags : ['Fast Delivery'],
      date: 'Just now',
      deliveryType: order?.packageCategory || 'Express Delivery',
    };

    setIsSubmitted(true);
    setTimeout(() => {
      onSubmitReview(newReview);
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-[#222222] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#121212] border-b border-[#222222] flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">
            Rate Courier Delivery
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#1f1f1f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Rider reference */}
          {order?.rider && (
            <div className="flex items-center gap-3 p-3 bg-[#111111] rounded-xl border border-[#222222]">
              <img
                src={order.rider.avatarUrl}
                alt={order.rider.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-blue-400/40"
              />
              <div>
                <h4 className="text-xs font-bold text-white">{order.rider.name}</h4>
                <p className="text-[11px] text-slate-400">{order.rider.vehicleModel}</p>
              </div>
            </div>
          )}

          {/* Star selector */}
          <div className="text-center space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Overall Experience
            </label>
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl transition-transform hover:scale-125 focus:outline-none"
                >
                  <span className={star <= rating ? 'text-amber-400' : 'text-slate-600'}>
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Praise Tags */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-2">What went great?</label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-[#141414] border-[#242424] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written feedback */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Written Feedback (Optional)</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about courier punctuality, packaging safety..."
              className="w-full px-3 py-2 bg-black border border-[#262626] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitted}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitted ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Feedback Recorded! Thank You</span>
              </>
            ) : (
              <span>Submit Verified Feedback</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
