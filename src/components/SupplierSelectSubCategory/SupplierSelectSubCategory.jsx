import React, { useEffect, useState, useMemo } from 'react';
import Select, { components } from 'react-select';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FaStar, FaRegStar } from 'react-icons/fa';

export default function SupplierSelectSubCategory({
  value,
  onChange,
  usedFor,
}) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';

  const [subcategories, setSubcategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch subcategories & favorites
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, favRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/categories/sub`, {
            params: { lang, usedFor },
            withCredentials: true,
          }),
          axios.get(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/suppliers/me/favorite-categories`,
            {
              withCredentials: true,
            },
          ),
        ]);

        setFavorites(favRes.data || []);
        setSubcategories(subRes.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lang, usedFor]);

  // Toggle favorite
  const toggleFavorite = async (categoryId) => {
    try {
      const res = await axios.patch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/suppliers/me/favorite-categories`,
        { categoryId },
        { withCredentials: true },
      );
      setFavorites(res.data.favoriteCategories || []);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Combine favorites on top
  const options = useMemo(() => {
    const favIds = favorites.map((f) => f.id);
    const favOptions = subcategories
      .filter((cat) => favIds.includes(cat.id))
      .map((cat) => ({ value: cat.id, label: cat.name, isFavorite: true }));
    const otherOptions = subcategories
      .filter((cat) => !favIds.includes(cat.id))
      .map((cat) => ({ value: cat.id, label: cat.name, isFavorite: false }));

    return [...favOptions, ...otherOptions];
  }, [subcategories, favorites]);

  // Custom Option component to include star
  const Option = (props) => {
    const { data } = props;
    return (
      <components.Option {...props}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{data.label}</span>
          <span
            onClick={(e) => {
              e.stopPropagation(); // Prevent select change
              toggleFavorite(data.value);
            }}
            style={{ cursor: 'pointer' }}
          >
            {data.isFavorite ? <FaStar color="#FFD700" /> : <FaRegStar />}
          </span>
        </div>
      </components.Option>
    );
  };

  // Current selected option
  const selectedOption = options.find((o) => o.value === value) || null;

  return (
    <Select
      isLoading={loading}
      options={options}
      value={selectedOption}
      onChange={(selected) => onChange(selected.value)}
      placeholder={lang === 'ar' ? 'اختر التصنيف الفرعي' : 'Select subcategory'}
      noOptionsMessage={() => (lang === 'ar' ? 'لا توجد خيارات' : 'No options')}
      components={{ Option }}
      isSearchable
    />
  );
}
