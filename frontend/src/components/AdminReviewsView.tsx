import React, { useState, useEffect } from "react";
import { apiClient } from "../services/apiClient";
import { Student } from "../types";
import { Star } from "lucide-react";


interface AdminReviewsViewProps {
  students: Student[];
}

export function AdminReviewsView({ students }: AdminReviewsViewProps) {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [allReviews, setAllReviews] = useState<any[]>([]);

  // Load all reviews for all students
  useEffect(() => {
    const load = async () => {
      try {
        const collected: any[] = [];
        for (const s of students) {
          const data = await apiClient.reviews.getByStudent(s.id);
          if (Array.isArray(data)) {
            collected.push(...data);
          }
        }
        setAllReviews(collected);
      } catch {
        setAllReviews([]);
      }
    };
    load();
  }, [students]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !reviewComment.trim()) {
      setReviewMsg("Please select a student and write a comment.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiClient.reviews.create({
        type: "student_tutor",
        studentId: selectedStudent,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setAllReviews([response.review || response, ...allReviews]);
      setReviewComment("");
      setReviewRating(5);
      setSelectedStudent("");
      setReviewMsg("Review submitted successfully!");
      setTimeout(() => setReviewMsg(""), 3000);
    } catch (error: any) {
      setReviewMsg(error.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Write Review Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
          Write Review for Student
        </h3>
        <form onSubmit={handleSubmitReview} className="space-y-3">
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs font-semibold outline-none"
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.grade})
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-5 w-5 transition-colors ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-300"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Write your review about the student's performance..."
            rows={3}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs font-medium outline-none resize-none"
          />
          {reviewMsg && (
            <p className={`text-[10px] font-bold ${reviewMsg.includes("success") ? "text-emerald-600" : "text-rose-600"}`}> {reviewMsg} </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>

      {/* All Reviews List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
          All Student Reviews
        </p>
        <div className="space-y-4">
          {allReviews.map((r: any, idx: number) => (
            <div key={r._id || idx} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                {(r.studentName || students.find((s) => s.id === r.studentId)?.name || "S").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">
                    {r.studentName || students.find((s) => s.id === r.studentId)?.name || "Student"}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recent"}
                  </span>
                </div>
                <div className="flex mt-1 gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-350 mt-2 italic font-medium">
                  "{r.comment}"
                </p>
              </div>
            </div>
          ))}
          {allReviews.length === 0 && (
            <p className="text-xs text-slate-500">No reviews available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
