import React from 'react';

const EmailDialog = ({ icon, title, message }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-96 text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default EmailDialog;
