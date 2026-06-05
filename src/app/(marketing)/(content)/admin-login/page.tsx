import { ShieldCheck } from "lucide-react";

import { AdminLoginForm } from "./AdminLoginForm";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="max-w-md mx-auto">
      <header className="text-center mb-6">
        <div
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4"
          style={{ backgroundColor: "#0f2535", color: "#f7c021" }}
        >
          <ShieldCheck size={26} />
        </div>
        <p className="kb-eyebrow">Beheer</p>
        <h1 className="kb-heading text-3xl mt-2">Admin login</h1>
        <p className="text-[#5c6878] mt-2 text-sm">
          Alleen voor het Klusblok-team. Reguliere klanten loggen in via{" "}
          <a href="/login" className="text-[#3586b6] font-bold hover:underline">
            /login
          </a>
          .
        </p>
      </header>
      <div
        className="kb-panel"
        style={{
          backgroundColor: "#0f2535",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <AdminLoginForm />
      </div>
    </div>
  );
}
