import React from 'react';
import EmailDialog from '../../components/EmailDialog';

const ResendVerificationEmail = () => {
  return (
    <EmailDialog
      icon="X"
      title="That token has been Expired"
      message="Reverify Email"
    />
  );
};

export default ResendVerificationEmail;
