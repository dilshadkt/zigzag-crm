import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TbLogout } from "react-icons/tb";
import { FiX } from "react-icons/fi";
import SidebarMenuItem from "../../../../components/sidebar/SidebarMenuItem";
import logo from "../../../../assets/icons/logo.svg";
import { PORTAL_MENU } from "./nav";

const MenuList = ({ collapsed, badges, onNavigate }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = pathname.replace(/\/$/, "") || "/";
  return (
    <ul className="flex flex-col gap-y-1 text-[#7D8592]">
      {PORTAL_MENU.map((item) => (
        <SidebarMenuItem
          key={item.path}
          item={item}
          isActive={current === item.path}
          hasChildren={false}
          taskCount={badges[item.path] || null}
          onNavigate={(path) => {
            navigate(path);
            onNavigate?.();
          }}
          pathname={pathname}
          collapsed={collapsed}
        />
      ))}
    </ul>
  );
};

const LogoutButton = ({ collapsed, onLogout }) => (
  <button
    onClick={onLogout}
    title="Logout"
    className={`text-[#7D8592] mt-2 rounded-[10px] flexStart hover:text-[#3F8CFF] text-sm ${
      collapsed ? "w-full h-12 !justify-center" : "px-2 py-[10px] gap-x-3.5"
    }`}
  >
    <TbLogout className="text-lg shrink-0" />
    {!collapsed && <span>Logout</span>}
  </button>
);

/** Desktop sidebar, same shape and behaviour as the staff CRM's. */
export const PortalSidebar = ({ expanded, onToggle, onLogout, badges }) => (
  <aside className={`hidden lg:block relative shrink-0 my-3 ml-3 transition-[width] duration-300 ease-in-out ${expanded ? "w-[240px]" : "w-[88px]"}`}>
    <section className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[24px] gap-y-6 bg-white p-3">
      <div className="flex flex-col min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hover pl-2">
        <button
          onClick={onToggle}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          className={`mb-4 rounded-[10px] flexStart text-[#7D8592] ${
            expanded ? "px-2 py-[10px] gap-x-3" : "w-full h-12 !justify-center"
          } hover:bg-[#ECF3FF] hover:text-[#3F8CFF] transition-colors`}
        >
          <img src={logo} alt="" className="w-8 h-8 shrink-0" />
          {expanded && (
            <span className="text-left leading-tight whitespace-nowrap">
              <span className="block text-sm font-extrabold text-[#0A1629]">Zigzag Academy</span>
              <span className="block text-[11px] text-[#91929E]">Student portal</span>
            </span>
          )}
        </button>
        <MenuList collapsed={!expanded} badges={badges} />
      </div>

      <div className="flex flex-col">
        {expanded && (
          <div className="hidden [@media(min-height:700px)]:block rounded-[24px] bg-[#F4F9FD] px-4 pt-3 pb-4 text-center">
            <img src="/image/support.svg" alt="" className="w-20 mx-auto" />
            <p className="text-sm font-bold text-[#0A1629] mt-1">Need help?</p>
            <p className="text-xs text-[#7D8592] mt-0.5">Ask at the academy office.</p>
          </div>
        )}
        <LogoutButton collapsed={!expanded} onLogout={onLogout} />
      </div>
    </section>
  </aside>
);

/** Slide-in menu for phones and tablets. */
export const PortalDrawer = ({ isOpen, onClose, onLogout, badges }) => {
  if (!isOpen) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <aside role="dialog" aria-modal="true" aria-label="Menu" className="absolute inset-y-0 left-0 w-[270px] max-w-[85%] bg-white rounded-r-[24px] p-4 flex flex-col justify-between shadow-2xl">
        <div className="min-h-0 overflow-y-auto">
          <div className="flex items-center justify-between gap-3 mb-5 pl-2">
            <div className="flex items-center gap-3">
              <img src={logo} alt="" className="w-9 h-9" />
              <div className="leading-tight">
                <p className="text-sm font-extrabold text-[#0A1629]">Zigzag Academy</p>
                <p className="text-[11px] text-[#91929E]">Student portal</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-[#F4F9FD] flexCenter text-[#0A1629]" aria-label="Close menu">
              <FiX />
            </button>
          </div>
          <MenuList collapsed={false} badges={badges} onNavigate={onClose} />
        </div>
        <LogoutButton collapsed={false} onLogout={onLogout} />
      </aside>
    </div>
  );
};
