import { useState, useContext, useEffect } from "react";

import { AuthContext } from '../../context/AuthContext';

// Hard styling
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .review-root {
    background: #ffffff;
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    padding: 20px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .review-card {
    background: #ffffff;
    border-radius: 18px;
    padding: 36px 40px;
    width: 100%;
    max-width: 720px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    transition: box-shadow 0.2s ease;
  }

  .review-card:hover {
    box-shadow: 0 6px 24px rgba(0,0,0,0.10);
  }

  .review-form-title {
    font-size: 22px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 24px 0;
    letter-spacing: -0.3px;
  }

  .label {
    font-size: 13px;
    font-weight: 500;
    color: #888;
    margin-bottom: 10px;
    display: block;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .stars-row {
    display: flex;
    gap: 6px;
    margin-bottom: 24px;
  }

  .star-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-size: 36px;
    line-height: 1;
    transition: transform 0.15s ease, filter 0.15s ease;
    color: #d4a84b;
  }

  .star-btn:hover {
    transform: scale(1.15);
  }

  .star-btn.empty {
    color: #c8c0b8;
  }

  .star-btn.hovered {
    filter: brightness(1.15);
  }

  .review-textarea {
    width: 100%;
    min-height: 130px;
    border: 1.5px solid #e0dbd3;
    border-radius: 12px;
    padding: 16px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: #333;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    box-sizing: border-box;
    background: #faf9f7;
  }

  .review-textarea::placeholder {
    color: #b0a898;
  }

  .review-textarea:focus {
    border-color: #c0392b;
    box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.08);
    background: #fff;
  }

  .submit-btn {
    margin-top: 22px;
    background: #c0392b;
    color: white;
    border: none;
    border-radius: 30px;
    padding: 13px 32px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
    box-shadow: 0 3px 12px rgba(192, 57, 43, 0.25);
    letter-spacing: 0.2px;
  }

  .submit-btn:hover {
    background: #a93226;
    transform: translateY(-1px);
    box-shadow: 0 5px 16px rgba(192, 57, 43, 0.35);
  }

  .submit-btn:active {
    transform: translateY(0);
  }

  .review-item {
    width: 100%;
    max-width: 720px;
  }

  .review-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .reviewer-name {
    font-weight: 700;
    font-size: 16px;
    color: #1a1a1a;
  }

  .reviewer-date {
    font-size: 13px;
    color: #aaa;
    font-weight: 400;
    margin-left: 8px;
  }

  .review-stars-display {
    display: flex;
    gap: 3px;
  }

  .review-star {
    font-size: 18px;
  }

  .review-star.filled {
    color: #d4a84b;
  }

  .review-star.empty {
    color: #d9d2c8;
  }

  .review-body {
    font-size: 14.5px;
    color: #555;
    line-height: 1.7;
    margin: 0;
  }

  .success-msg {
    font-size: 14px;
    color: #27ae60;
    margin-top: 12px;
    font-weight: 500;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .success-msg.visible {
    opacity: 1;
  }
`;

// Map rating
const StarRating = ({ rating, onRate }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="stars-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`star-btn ${star > (hovered || rating) ? "empty" : ""} ${hovered && star <= hovered ? "hovered" : ""}`}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`Rate ${star} stars`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const ReviewStars = ({ rating }) => (
  <div className="review-stars-display">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={`review-star ${s <= rating ? "filled" : "empty"}`}>★</span>
    ))}
  </div>
);

// Review section
export const ReviewSection = ({ courseCode }) => {
  const backport = 5050;

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(4);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { token, user } = useContext(AuthContext);

  // Fetch reviews from mongodb
  const getReviews = async (courseCode) => {
    console.log("Fetching Reviews...");
    try {
      const res = await fetch(
        `http://localhost:${backport}/api/sfuCourses/reviews?courseCode=${encodeURIComponent(courseCode)}`
      );

      if (!res.ok) throw new Error("Failed to fetch reviews");

      const result = await res.json();
      return result;
    } catch (e) {
      console.log("Error fetching reviews:", e);
      return -1;
    }
  };

  // Post review to mongodb
  const postReview = async (_date) => {
    console.log("Trying to post...");
    try {
      const res = await fetch(`http://localhost:${backport}/api/sfuCourses/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          userId: user.id,
          text: text.trim(),
          rating,
          courseCode,
          date: _date,
        }),
      });

      if (!res.ok) throw new Error("Failed to post review");

      const result = await res.json();
      return result;
    } catch (e) {
      console.log("Error posting review:", e);
      return -1;
    }
  };

  // Fetch reviews on some change
  useEffect(() => {
    const fetchReviews = async () => {
      if (!courseCode) return;

      const result = await getReviews(courseCode);
      if (result === -1) return;

      const formattedReviews = (result.reviews || []).map((review) => ({
        id: review._id,
        name: review.name || review.userName || "Anonymous",
        date: review.date,
        rating: review.rating,
        text: review.text,
      }));

      setReviews(formattedReviews);
    };

    fetchReviews();
  }, [courseCode]);

  // Format submission of review
  const handleSubmit = async () => {
    if (!text.trim() || rating === 0) return;

    const _date = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const newReview = {
      id: Date.now(),
      name: user?.name || "You",
      date: _date,
      rating,
      text: text.trim(),
    };
    try {
      const response = await postReview(_date);

      if (response === -1) return;

      // Clear states
      setReviews((prev) => [newReview, ...prev]);
      setText("");
      setRating(4);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="review-root">
        <div className="review-card">
          <h2 className="review-form-title">Leave a Review</h2>

          <label className="label">Your Rating</label>
          <StarRating rating={rating} onRate={setRating} />

          <label className="label">Your Review</label>
          <textarea
            className="review-textarea"
            placeholder="Share your experience — workload, instructor, assignments, tips for future students..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div>
            <button className="submit-btn" onClick={handleSubmit}>
              Post Review
            </button>
            <p className={`success-msg ${submitted ? "visible" : ""}`}>
              ✓ Review posted successfully!
            </p>
          </div>
        </div>

        {reviews.map((review) => (
          <div key={review.id} className="review-card review-item">
            <div className="review-item-header">
              <div>
                <span className="reviewer-name">Anonymous</span>
                <span className="reviewer-date">{review.date}</span>
              </div>
              <ReviewStars rating={review.rating} />
            </div>
            <p className="review-body">{review.text}</p>
          </div>
        ))}
      </div>
    </>
  );
};