import React from "react";
import EmailDialog from "../components/EmailDialog";

const VerifyEmail = () => {
  return (
    <EmailDialog
      icon="📧"
      title="Verify Your Email"
      message={
        <>
          Check <span className="font-medium">example@gmail.com</span> inbox for
          our message.
        </>
      }
    />
  );
};

export default VerifyEmail;
