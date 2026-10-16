import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { publicApi } from "./api/accountsApi";
import DocumentView from "./components/DocumentView";
import { errorMessage, fmtDate } from "./utils/format";
import { pdfName } from "./utils/pdf";
import { resolveTemplate } from "./utils/templates";
import { PdfButtons } from "./components/DocumentActions";

/**
 * Public page opened from the link in an invoice / proposal email. It is
 * reachable without signing in, so it never calls the signed-in API client.
 */
const SharedDocument = () => {
  const { type, token } = useParams();
  const ref = useRef(null);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [declining, setDeclining] = useState(false);
  const [done, setDone] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["shared-document", type, token],
    queryFn: () => publicApi.view(type, token),
    retry: false,
    enabled: ["invoice", "proposal"].includes(type),
  });

  const respond = useMutation({
    mutationFn: (action) => publicApi.respond(token, { action, name, comment }),
    onSuccess: (res) => {
      setDone(res.status);
      refetch();
    },
  });

  const doc = data?.document;
  const open = doc && ["sent", "viewed"].includes(doc.status) && !doc.isExpired;
  const failure = error?.response?.data?.message || (error ? "This link is not valid or has expired." : null);

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6">
      <div className="max-w-[860px] mx-auto">
        {isLoading && <p className="text-center text-slate-500 py-24">Loading…</p>}
        {(failure || !["invoice", "proposal"].includes(type)) && !isLoading && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-lg font-bold text-slate-800">We could not open this document</p>
            <p className="text-sm text-slate-500 mt-1">{failure || "This link is not valid."} Please ask the sender for a new link.</p>
          </div>
        )}

        {doc && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-sm font-semibold text-slate-700">
                {type === "invoice" ? "Invoice" : "Proposal"} {doc.number} from {data.business.tradeName || data.business.legalName}
              </p>
              <div className="flex gap-2">
                <PdfButtons getElement={() => ref.current} filename={pdfName(type === "invoice" ? "Invoice" : "Proposal", doc.number)} title={`${type} ${doc.number}`} />
              </div>
            </div>

            <div className="shadow-sm rounded-lg overflow-hidden bg-white">
              <DocumentView ref={ref} type={type} doc={doc} business={data.business} template={resolveTemplate(data.templateId, data.customTemplates)} />
            </div>

            {type === "proposal" && (
              <div className="mt-5 bg-white rounded-2xl shadow-sm p-5">
                {done === "accepted" || doc.status === "accepted" || doc.status === "converted" ? (
                  <p className="flex items-center gap-2 text-emerald-600 font-semibold"><FiCheckCircle /> Accepted{doc.respondedAt ? ` on ${fmtDate(doc.respondedAt)}` : ""}. Thank you, we will be in touch shortly.</p>
                ) : done === "declined" || doc.status === "declined" ? (
                  <p className="flex items-center gap-2 text-slate-600 font-semibold"><FiXCircle /> You declined this proposal. Thank you for letting us know.</p>
                ) : doc.isExpired || doc.status === "expired" ? (
                  <p className="text-amber-700 font-semibold">This proposal expired on {fmtDate(doc.validUntil)}. Please contact us for an updated one.</p>
                ) : open ? (
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800">Your decision</h3>
                    <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#3F8CFF]" placeholder="Your full name (required to accept)" value={name} onChange={(e) => setName(e.target.value)} />
                    <textarea className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#3F8CFF]" rows={declining ? 3 : 2} placeholder={declining ? "Tell us why (optional)" : "Any comment (optional)"} value={comment} onChange={(e) => setComment(e.target.value)} />
                    {respond.isError && <p className="text-sm text-red-600">{errorMessage(respond.error?.response?.data || respond.error)}</p>}
                    <div className="flex flex-wrap gap-2">
                      <button disabled={respond.isPending || !name.trim()} onClick={() => respond.mutate("accept")} className="h-10 px-5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50">
                        {respond.isPending ? "Please wait…" : "Accept proposal"}
                      </button>
                      {!declining ? (
                        <button onClick={() => setDeclining(true)} className="h-10 px-5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Decline</button>
                      ) : (
                        <button disabled={respond.isPending} onClick={() => respond.mutate("decline")} className="h-10 px-5 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Confirm decline</button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">Typing your name and accepting records your approval of this proposal on {fmtDate(new Date())}.</p>
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SharedDocument;
