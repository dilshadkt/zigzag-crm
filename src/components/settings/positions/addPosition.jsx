import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useCreatePosition, useUpdatePosition } from "../../../api/hooks";
import { toast } from "react-hot-toast";
import ModalLayout from "../../shared/modal";
import { FiShield, FiLayout, FiCalendar, FiUsers, FiMessageSquare, FiTarget, FiZap, FiEye, FiCloud, FiCheck, FiMap, FiClock, FiPlus, FiGrid, FiBarChart2, FiFileText } from "react-icons/fi";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Position identity required"),
  allowedRoutes: Yup.array().of(Yup.string()),
});

const AddPosition = ({ isOpen, setShowModal, initialValues, companyId }) => {
  const { mutate: createPosition, isLoading: isCreating } = useCreatePosition(companyId);
  const { mutate: updatePosition, isLoading: isUpdating } = useUpdatePosition(companyId);

  const routeOptions = [
    { value: "projects", label: "Client Hub", icon: <FiLayout />, desc: "Client & project management" },
    { value: "board", label: "Task Board", icon: <FiGrid />, desc: "Visual task & project cards" },
    { value: "calendar", label: "Timeline", icon: <FiCalendar />, desc: "Global scheduling system" },
    { value: "vacations", label: "Time Off", icon: <FiMap />, desc: "Leave & vacation management" },
    { value: "employees", label: "Team Directory", icon: <FiUsers />, desc: "Workforce data management" },
    { value: "messenger", label: "Comms", icon: <FiMessageSquare />, desc: "Internal messaging hub" },
    { value: "leads", label: "Sales Pipeline", icon: <FiTarget />, desc: "Revenue & lead tracking" },
    { value: "lead-dashboard", label: "Lead Dashboard", icon: <FiBarChart2 />, desc: "Sales & performance analytics hub" },
    { value: "leaderboard", label: "Leaderboard", icon: <FiBarChart2 />, desc: "Performance ranking & stats" },
    { value: "hr-dashboard", label: "HR Dashboard", icon: <FiUsers />, desc: "Workforce & attendance analytics" },
    { value: "campaigns", label: "Marketing", icon: <FiZap />, desc: "Outreach & campaign data" },
    { value: "task-on-review", label: "Quality Control", icon: <FiEye />, desc: "Peer review dashboard" },
    { value: "task-on-publish", label: "Production", icon: <FiCloud />, desc: "Ready for deployment" },
    { value: "client-review", label: "Approvals", icon: <FiCheck />, desc: "External feedback cycle" },
    { value: "attendance", label: "Time Tracking", icon: <FiClock />, desc: "Attendance analytics" },
    { value: "workload", label: "Workload", icon: <FiBarChart2 />, desc: "Team capacity & distribution" },
    { value: "events", label: "Company Events", icon: <FiCalendar />, desc: "Corporate events & meets" },
    { value: "sticky-notes", label: "Quick Notes", icon: <FiFileText />, desc: "Personal scratchpad" },
    { value: "timer", label: "Active Timer", icon: <FiClock />, desc: "Task time logging" },
  ];

  const coreRouteOptions = routeOptions.filter(
    (r) => !["lead-dashboard", "leaderboard", "hr-dashboard"].includes(r.value)
  );
  const dashboardRouteOptions = routeOptions.filter(
    (r) => ["lead-dashboard", "leaderboard", "hr-dashboard"].includes(r.value)
  );

  const handleSubmit = (values, { resetForm }) => {
    const positionData = { ...values, companyId };

    if (initialValues) {
      updatePosition(
        { id: initialValues._id, ...positionData },
        {
          onSuccess: () => {
            toast.success("Role config updated");
            setShowModal(false);
          },
          onError: (error) => toast.error(error.response?.data?.message || "Role update failed"),
        }
      );
    } else {
      createPosition(positionData, {
        onSuccess: () => {
          toast.success("New role established");
          resetForm();
          setShowModal(false);
        },
        onError: (error) => toast.error(error.response?.data?.message || "Role deployment failed"),
      });
    }
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      setIsOpen={setShowModal}
      maxWidth="sm:max-w-2xl"
      title={initialValues ? "Adjust Role Policy" : "Define New Organization Role"}
    >
      <Formik
        initialValues={{
          name: initialValues?.name || "",
          allowedRoutes: initialValues?.allowedRoutes || [],
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ errors, touched, values, setFieldValue }) => (
          <Form className="w-full flex flex-col gap-5">
            <div className="space-y-5 px-1">
              {/* Role Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">
                  Role Descriptor Name
                </label>
                <div className="relative group">
                  <Field
                    name="name"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-[13px] font-bold transition-all duration-200 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                    placeholder="e.g. Lead Strategist, Senior Creative"
                  />
                  <FiShield className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-400 transition-colors" />
                </div>
                {errors.name && touched.name && (
                  <span className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.name}</span>
                )}
              </div>

              {/* Scope/Permissions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                    Authorized System Scopes
                  </label>
                  <span className="text-[10px] items-center gap-1 font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md flex border border-blue-100 uppercase">
                    <FiGrid className="w-2.5 h-2.5" /> {values.allowedRoutes.length} Scopes
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {coreRouteOptions.map((route) => {
                    const isActive = values.allowedRoutes.includes(route.value);
                    return (
                      <label
                        key={route.value}
                        className={`flex flex-col p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                          isActive 
                            ? "bg-white border-blue-200 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/10" 
                            : "bg-gray-50/50 border-gray-100 hover:border-gray-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[13px] transition-colors ${
                            isActive ? "bg-blue-500 text-white" : "bg-white border border-gray-100 text-gray-400"
                          }`}>
                            {route.icon}
                          </div>
                          <span className={`text-[12px] font-bold truncate ${isActive ? "text-gray-800" : "text-gray-500"}`}>
                            {route.label}
                          </span>
                          <Field
                            type="checkbox"
                            name="allowedRoutes"
                            value={route.value}
                            className="hidden"
                            checked={isActive}
                            onChange={(e) => {
                              const next = e.target.checked 
                                ? [...values.allowedRoutes, route.value]
                                : values.allowedRoutes.filter(r => r !== route.value);
                              setFieldValue("allowedRoutes", next);
                            }}
                          />
                          {isActive && <FiCheck className="ml-auto w-3.5 h-3.5 text-blue-500" />}
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium leading-[1.3] pl-9">
                          {route.desc}
                        </p>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Dashboard Scope/Permissions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                    Dashboard Scope/Permissions
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {dashboardRouteOptions.map((route) => {
                    const isActive = values.allowedRoutes.includes(route.value);
                    return (
                      <label
                        key={route.value}
                        className={`flex flex-col p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                          isActive 
                            ? "bg-white border-blue-200 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/10" 
                            : "bg-gray-50/50 border-gray-100 hover:border-gray-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[13px] transition-colors ${
                            isActive ? "bg-blue-500 text-white" : "bg-white border border-gray-100 text-gray-400"
                          }`}>
                            {route.icon}
                          </div>
                          <span className={`text-[12px] font-bold truncate ${isActive ? "text-gray-800" : "text-gray-500"}`}>
                            {route.label}
                          </span>
                          <Field
                            type="checkbox"
                            name="allowedRoutes"
                            value={route.value}
                            className="hidden"
                            checked={isActive}
                            onChange={(e) => {
                              const next = e.target.checked 
                                ? [...values.allowedRoutes, route.value]
                                : values.allowedRoutes.filter(r => r !== route.value);
                              setFieldValue("allowedRoutes", next);
                            }}
                          />
                          {isActive && <FiCheck className="ml-auto w-3.5 h-3.5 text-blue-500" />}
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium leading-[1.3] pl-9">
                          {route.desc}
                        </p>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Policy Note */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3 flex gap-3">
                <FiPlus className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-amber-700/80 leading-relaxed uppercase tracking-tight">
                  Note: Base system access (Dashboard, Board & General Settings) is implicitly granted to all organization roles.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-[12px] font-bold text-gray-500 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="px-6 py-2 text-[12px] font-bold text-white bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isCreating || isUpdating 
                  ? "Configuring Role..." 
                  : initialValues ? "Update Security Policy" : "Establish Role Scope"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </ModalLayout>
  );
};

export default AddPosition;
