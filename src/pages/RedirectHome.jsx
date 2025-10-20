import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RedirectHome() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) navigate('/landing');
    else if (user.role === 'buyer') navigate('/buyer/homepage');
    else if (user.role === 'supplier') navigate('/supplier/overview');
    else navigate('/landing');
  }, [navigate, user]);

  return null;
}
