import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import API from "../services/api";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    const verify = async () => {
      try {
        await API.get(`/auth/verify/${token}`);
        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="card-style max-w-md w-full p-10 text-center">
        {status === "loading" && (
          <>
            <Loader2
              className="mx-auto animate-spin text-medical-primary mb-4"
              size={50}
            />
            <h2 className="text-2xl font-bold">Verifying your email...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="mx-auto text-green-500 mb-4" size={60} />
            <h2 className="text-2xl font-bold">Email Verified!</h2>
            <p className="text-slate-500 mt-2 mb-8">
              Your account is now active. You can login now.
            </p>
            <Link to="/login" className="btn-primary block w-full">
              Go to Login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto text-red-500 mb-4" size={60} />
            <h2 className="text-2xl font-bold">Verification Failed</h2>
            <p className="text-slate-500 mt-2 mb-8">
              The link is invalid or has expired.
            </p>
            <Link to="/register" className="text-medical-primary font-bold">
              Try Registering Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
