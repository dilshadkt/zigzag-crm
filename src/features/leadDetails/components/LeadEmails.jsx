const LeadEmails = ({ emails }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Emails</h3>
      <div className="space-y-4">
        {emails.map((email) => (
          <div
            key={email.title}
            className="bg-slate-50 rounded-2xl p-4 border border-slate-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {email.title}
                </p>
                <p className="text-xs text-slate-500">Subject: {email.subject}</p>
              </div>
              <p className="text-xs font-medium text-slate-500">{email.date}</p>
            </div>
            <p className="text-xs text-emerald-500 font-semibold mt-2">
              Status: {email.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadEmails;

