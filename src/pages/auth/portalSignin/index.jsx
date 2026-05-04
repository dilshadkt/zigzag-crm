import React from "react";
import Input from "../../../components/shared/Field/input";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";
import { usePortalSignIn } from "../../../hooks/usePortalSignIn";
import logo from "../../../assets/icons/logo.svg";

const PortalSignIn = () => {
  const { values, errors, touched, handleChange, handleSubmit, isSubmitting } =
    usePortalSignIn();

  return (
    <section className="w-full h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <img src={logo} alt="Logo" className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Client Portal</h2>
          <p className="text-slate-500 text-sm mt-2 text-center">
            Log in to view your projects, campaigns, and leads.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            name="username"
            value={values.username}
            touched={touched}
            onchange={handleChange}
            errors={errors}
            title="Portal Username"
            placeholder="Enter your username"
            className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
          />

          <div className="space-y-1">
            <Input
              name="password"
              value={values.password}
              touched={touched}
              onchange={handleChange}
              errors={errors}
              title="Portal Password"
              type="password"
              placeholder="••••••••"
              className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
            />
            {errors.general && (
              <p className="text-red-500 text-xs font-medium animate-pulse">
                {errors.general}
              </p>
            )}
          </div>

          <div className="pt-4">
            <PrimaryButton
              loading={isSubmitting}
              type="submit"
              title="Secure Access"
              className="w-full h-12 text-sm font-semibold shadow-lg shadow-blue-200 rounded-xl"
            />
          </div>
        </form>

        <div className="mt-10 border-t border-slate-100 pt-6">
          <p className="text-slate-400 text-[11px] text-center leading-relaxed italic">
            This is a secure private gateway. If you have any trouble accessing your dashboard, please contact your account manager directly.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PortalSignIn;
