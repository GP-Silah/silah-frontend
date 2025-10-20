import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function SignupBusinessActivity({ value, onChange }) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/categories/main`,
          {
            params: { lang },
          },
        );

        const options = response.data.map((cat) => ({
          value: cat.id,
          label: cat.name,
        }));
        setCategories(options);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [lang]);

  return (
    <div>
      <Select
        isMulti
        isLoading={loading}
        options={categories}
        value={categories.filter((c) => value.includes(c.value))}
        onChange={(selected) => onChange(selected.map((s) => s.value))}
        placeholder={
          lang === 'ar' ? 'اختر نشاطك التجاري' : 'Select your business activity'
        }
        noOptionsMessage={() =>
          lang === 'ar' ? 'لا توجد خيارات' : 'No options'
        }
      />
    </div>
  );
}
