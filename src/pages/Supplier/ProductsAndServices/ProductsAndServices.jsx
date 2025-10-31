import React, { useState } from 'react';
import './ProductsAndServices.css';
import { FaEdit, FaTrashAlt, FaCopy, FaUpload, FaBan } from 'react-icons/fa';

export default function ProductsAndServices() {
  const [filter, setFilter] = useState('all');

  const items = [
    {
      id: 1,
      image: '/images/candle1.png',
      name: 'Amber - 45ml Soy Candle',
      unitPrice: 42,
      stock: 26,
      status: 'Published',
    },
    {
      id: 2,
      image: '/images/candle2.png',
      name: 'Amber - 250ml Soy Candle',
      unitPrice: 42,
      stock: 26,
      status: 'Published',
    },
    {
      id: 3,
      image: '/images/candle3.png',
      name: 'Amber - 45ml Soy Candle',
      unitPrice: 42,
      stock: 0,
      status: 'Unpublished',
    },
    {
      id: 4,
      image: '/images/logo.png',
      name: 'Logo Design',
      unitPrice: 23,
      stock: '-',
      status: 'Published',
    },
  ];

  return (
    <div className="products-page">
      {/* 🔹 FILTER HEADER BAR */}
      <div className="filter-bar">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search Here"
            className="search-input"
          />
        </div>

        <div className="filter-options">
          <label>
            <input
              type="radio"
              name="filter"
              value="all"
              checked={filter === 'all'}
              onChange={(e) => setFilter(e.target.value)}
            />
            All
          </label>
          <label>
            <input
              type="radio"
              name="filter"
              value="products"
              checked={filter === 'products'}
              onChange={(e) => setFilter(e.target.value)}
            />
            Products
          </label>
          <label>
            <input
              type="radio"
              name="filter"
              value="services"
              checked={filter === 'services'}
              onChange={(e) => setFilter(e.target.value)}
            />
            Services
          </label>
        </div>

        <div className="add-buttons">
          <button className="btn-purple">Product +</button>
          <button className="btn-purple">Service +</button>
        </div>
      </div>

      {/* 🔹 ACTION BAR */}
      <div className="action-bar">
        <p>Select item(s) to take an action</p>
        <div className="action-icons">
          <button>
            <FaEdit /> Edit
          </button>
          <button>
            <FaUpload /> Publish
          </button>
          <button>
            <FaBan /> Unpublish
          </button>
          <button>
            <FaCopy /> Duplicate
          </button>
          <button className="delete">
            <FaTrashAlt /> Delete
          </button>
        </div>
      </div>

      {/* TABLE */}
      <table className="items-table">
        <thead>
          <tr>
            <th></th>
            <th>Image</th>
            <th>Item Name</th>
            <th>♡</th>
            <th>Unit Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Predict Demand</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <input type="checkbox" />
              </td>
              <td>
                <img src={item.image} alt={item.name} className="item-img" />
              </td>
              <td>{item.name}</td>
              <td>♡</td>
              <td>{item.unitPrice}</td>
              <td>{item.stock}</td>
              <td>
                <span
                  className={`status-badge ${
                    item.status === 'Published' ? 'published' : 'unpublished'
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="predict">Predict Demand</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
