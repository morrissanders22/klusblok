import { Mail, MapPin } from "lucide-react";

export const metadata = { title: "Contact — Klusblok" };

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <p className="kb-eyebrow">Contact</p>
        <h1 className="kb-heading text-3xl sm:text-4xl mt-2">Neem contact op</h1>
        <p className="text-[#5c6878] mt-2">
          Heb je vragen, suggesties of een probleem met een geplaatste klus?
          Stuur ons een e-mail en we reageren zo snel mogelijk.
        </p>
      </header>
      <div className="kb-panel space-y-4">
        <a
          href="mailto:info@klusblok.nl"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f7f9fc] transition-colors"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#f6b42c", color: "#1a2535" }}
          >
            <Mail size={18} />
          </div>
          <div>
            <p className="text-xs text-[#5c6878] uppercase tracking-wider">
              E-mail
            </p>
            <p className="font-bold text-[#1a2535]">info@klusblok.nl</p>
          </div>
        </a>
        <div className="flex items-center gap-3 p-3 rounded-lg">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#dbeafe", color: "#1e40af" }}
          >
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-xs text-[#5c6878] uppercase tracking-wider">
              Werkgebied
            </p>
            <p className="font-bold text-[#1a2535]">Heel Nederland</p>
          </div>
        </div>
      </div>
    </div>
  );
}
