import React from "react";
import EmailDialog from "../components/EmailDialog";

const EmailSuccess = () => {
  return (
    <EmailDialog
      icon="✔️"
      title="Your Email has been Validated Successfully"
      message="You can safely close this tab"
    />
  );
};

export default EmailSuccess;
