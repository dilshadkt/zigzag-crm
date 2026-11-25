import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FiCheckCircle, FiSearch, FiXCircle } from "react-icons/fi";
import { fmtDay } from "./utils";
import useLightTheme from "./useLightTheme";

const baseURL = import.meta.env.DEV ? "http://localhost:5000/api" : import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const fetchCertificate = async (number) => {
  try {
    return (await axios.get(`${baseURL}/public/academy/certificates/${encodeURIComponent(number)}`)).data;
  } catch (error) {
    if (error.response?.status === 404) return { valid: false };
    throw new Error(error.response?.data?.message || "Could not check the certificate right now");
  }
};

/** Public page: anyone can confirm a certificate number is genuine. */
const CertificateVerify = () => {
  useLightTheme();
  const { number = "" } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(number);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["certificate-verify", number],
    queryFn: () => fetchCertificate(number),
    enabled: Boolean(number),
    retry: false,
  });

  useEffect(() => {
    document.title = "Verify certificate";
    setInput(number);
  }, [number]);

  const c = data?.certificate;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EEF4FF] via-white to-[#F5F0FF] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-center text-xl font-bold text-slate-900">Certificate verification</h1>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) navigate(`/verify/certificate/${encodeURIComponent(input.trim())}`);
          }}
        >
          <input
            className="flex-1 h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm font-mono outline-none focus:border-[#3F8CFF]"
            placeholder="Certificate number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Certificate number"
          />
          <button className="h-11 px-4 rounded-xl bg-[#3F8CFF] text-white font-semibold inline-flex items-center gap-2" type="submit">
            <FiSearch /> Check
          </button>
        </form>

        {number && (
          <section className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60 p-6" aria-live="polite">
            {isLoading ? (
              <p className="text-sm text-slate-400 text-center">Checking…</p>
            ) : isError ? (
              <p className="text-sm text-slate-600 text-center">{error.message}</p>
            ) : c ? (
              <div className="text-center">
                <FiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="mt-2 text-lg font-bold text-emerald-700">Genuine certificate</p>
                <dl className="mt-5 text-left divide-y divide-slate-100">
                  {[
                    ["Awarded to", c.studentName],
                    ["Course", c.course],
                    ["Certificate no.", c.number],
                    ["Issued on", fmtDay(c.issuedAt)],
                    ["Issued by", c.academy],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 py-2.5">
                        <dt className="text-sm text-slate-500">{label}</dt>
                        <dd className="text-sm font-semibold text-slate-800 text-right">{value}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            ) : (
              <div className="text-center">
                <FiXCircle className="w-12 h-12 text-red-500 mx-auto" />
                <p className="mt-2 text-lg font-bold text-red-700">Not found</p>
                <p className="text-sm text-slate-500 mt-1">
                  No certificate with number <span className="font-mono">{number}</span> was issued by this academy. Check the number and try again.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default CertificateVerify;
