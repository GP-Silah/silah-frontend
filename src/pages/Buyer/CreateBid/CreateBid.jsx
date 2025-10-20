import React, { useState } from 'react';
import './CreateBid.css';

export default function CreateBid() {
  const [bid, setBid] = useState({
    name: '',
    activity: '',
    submission: '',
    response: '',
  });

  const handleChange = (e) => {
    setBid({ ...bid, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Bid published successfully!');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="create-bid-container">
        <div className="bid-card">
          <h2 className="bid-title">Create a New Bid</h2>

          <form className="bid-form" onSubmit={handleSubmit}>
            {/* Bid Name */}
            <div className="bid-field">
              <label>Bid Name</label>
              <input
                type="text"
                name="name"
                placeholder="Supply and Installation of Smart Street Lighting Systems"
                value={bid.name}
                onChange={handleChange}
              />
            </div>

            {/* Main Activity */}
            <div className="bid-field">
              <label>Main Activity</label>
              <input
                type="text"
                name="activity"
                placeholder="Electrical Works & Lighting - Installation and Maintenance of Electrical Systems"
                value={bid.activity}
                onChange={handleChange}
              />
            </div>

            {/* Submission Deadline */}
            <div className="bid-field">
              <label>Submission Deadline</label>
              <div className="date-input">
                <i className="fa-regular fa-calendar"></i>
                <input
                  type="date"
                  name="submission"
                  value={bid.submission}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Response Deadline */}
            <div className="bid-field">
              <label>Response Deadline for Offers</label>
              <select
                name="response"
                value={bid.response}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="1 week">
                  1 week after the submission deadline
                </option>
                <option value="2 weeks">
                  2 weeks after the submission deadline
                </option>
                <option value="1 month">
                  1 month after the submission deadline
                </option>
              </select>
            </div>

            {/* Publish Button */}
            <button type="submit" className="publish-btn">
              Publish Bid
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
