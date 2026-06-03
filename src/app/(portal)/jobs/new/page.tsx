"use client";

import { useActionState, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Camera,
  Briefcase,
  Layers,
} from "lucide-react";

import { createJob, type NewJobState } from "./actions";
import { PhotoUploader } from "./PhotoUploader";
import {
  SERVICES,
  SERVICE_EMOJI,
  COMPLEXITY_LABELS,
  COMPLEXITY_DESCRIPTIONS,
  type Complexity,
} from "@/lib/services";

type Step = 0 | 1 | 2 | 3 | 4;
const STEP_LABELS = ["Type", "Diensten", "Beschrijving", "Foto's", "Contact"];

type JobType = "single" | "project";

export default function NewJobPage() {
  const [step, setStep] = useState<Step>(0);
  const [type, setType] = useState<JobType>("single");
  const [services, setServices] = useState<string[]>([]);
  const [complexity, setComplexity] = useState<Complexity>("standard");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const photoCount = photoUrls.length;

  const [state, action, pending] = useActionState<NewJobState, FormData>(
    createJob,
    undefined,
  );

  const canNext = useMemo(() => {
    if (step === 0) return !!type;
    if (step === 1) return services.length > 0;
    if (step === 2) return title.length >= 3 && description.length >= 20;
    if (step === 3) return photoCount >= 2;
    return true;
  }, [step, type, services.length, title.length, description.length, photoCount]);

  function toggleService(s: string) {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function next() {
    if (canNext && step < 4) setStep((s) => (s + 1) as Step);
  }
  function back() {
    if (step > 0) setStep((s) => (s - 1) as Step);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8">
        <p className="kb-eyebrow flex items-center gap-2">
          <Plus size={12} /> Plaats een klus
        </p>
        <h1 className="kb-heading text-3xl sm:text-4xl mt-2">
          Beschrijf je klus
        </h1>
        <p className="text-[#5c6878] mt-2">
          In een paar stappen plaats je gratis je klus en ontvang je reacties
          van vakmensen.
        </p>
      </header>

      <Stepper step={step} />

      <form action={action} className="mt-6">
        <input type="hidden" name="type" value={type} />
        {services.map((s) => (
          <input key={s} type="hidden" name="services" value={s} />
        ))}
        <input type="hidden" name="complexity" value={complexity} />
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="description" value={description} />
        {photoUrls.map((url) => (
          <input key={url} type="hidden" name="photos" value={url} />
        ))}

        {step === 0 && (
          <Panel
            title="Wat voor klus is dit?"
            subtitle="Kies losse klus voor één taak, of project voor meerdere gecombineerde taken (b.v. complete renovatie)."
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <TypeCard
                active={type === "single"}
                onClick={() => setType("single")}
                Icon={Briefcase}
                title="Losse klus"
                description="Eén specifieke taak, b.v. kraan vervangen, schutting plaatsen, schilderwerk."
              />
              <TypeCard
                active={type === "project"}
                onClick={() => setType("project")}
                Icon={Layers}
                title="Project"
                description="Grotere klus met meerdere taken in één opdracht, b.v. complete badkamerverbouwing."
              />
            </div>
          </Panel>
        )}

        {step === 1 && (
          <Panel
            title={
              type === "project"
                ? "Welke diensten zitten in dit project?"
                : "Welke dienst heb je nodig?"
            }
            subtitle={
              type === "project"
                ? "Selecteer alle diensten die nodig zijn voor het project."
                : "Kies één categorie. Voor meerdere taken kun je beter een project plaatsen."
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SERVICES.map((s) => {
                const isOn = services.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleService(s)}
                    className="relative text-left rounded-xl p-4 transition-all"
                    style={{
                      border: `2px solid ${isOn ? "#3586b6" : "#e2e8f0"}`,
                      backgroundColor: isOn ? "#eff6fc" : "#fff",
                    }}
                  >
                    <div className="text-2xl mb-2">{SERVICE_EMOJI[s] ?? "🔧"}</div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: isOn ? "#1e4f70" : "#1a2535" }}
                    >
                      {s}
                    </p>
                    {isOn && (
                      <span
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "#3586b6", color: "white" }}
                      >
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[#5c6878] mt-4">
              Geselecteerd: {services.length} dienst
              {services.length === 1 ? "" : "en"}
            </p>
          </Panel>
        )}

        {step === 2 && (
          <Panel
            title="Vertel ons over de klus"
            subtitle="Geef een duidelijke titel en beschrijving. Hoe meer detail, hoe gerichter de reacties."
          >
            <div className="space-y-5">
              <div>
                <label className="kb-field-label">Titel</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    type === "project"
                      ? "Bv. Complete renovatie woonkamer"
                      : "Bv. Schutting vervangen achtertuin"
                  }
                  className="kb-input"
                  required
                  minLength={3}
                />
              </div>
              <div>
                <label className="kb-field-label">Beschrijving</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Beschrijf wat er gedaan moet worden, maten, materiaal, planning, etc."
                  className="kb-textarea"
                  required
                  minLength={20}
                />
                <p className="text-xs text-[#5c6878] mt-1.5">
                  {description.length}/20 tekens minimum
                </p>
              </div>
              {type === "single" && (
                <div>
                  <label className="kb-field-label">Grootte van de klus</label>
                  <div className="grid sm:grid-cols-3 gap-3 mt-2">
                    {(["small", "standard", "large"] as Complexity[]).map((c) => {
                      const isOn = complexity === c;
                      return (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setComplexity(c)}
                          className="rounded-lg p-4 text-left transition-all"
                          style={{
                            border: `2px solid ${isOn ? "#3586b6" : "#e2e8f0"}`,
                            backgroundColor: isOn ? "#eff6fc" : "#fff",
                          }}
                        >
                          <p className="font-bold text-sm text-[#1a2535]">
                            {COMPLEXITY_LABELS[c]}
                          </p>
                          <p className="text-xs text-[#5c6878] mt-1.5">
                            {COMPLEXITY_DESCRIPTIONS[c]}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Panel>
        )}

        {step === 3 && (
          <Panel
            title="Foto's toevoegen"
            subtitle="Minimaal 2 foto's zijn verplicht — klussers reageren 3× zo vaak op klussen met goede foto's."
          >
            <PhotoUploader
              minCount={2}
              urls={photoUrls}
              onChange={setPhotoUrls}
            />
            <div
              className="mt-5 rounded-lg p-3 flex items-center gap-2 text-sm"
              style={{
                backgroundColor: photoCount >= 2 ? "#ecfdf5" : "#fffbeb",
                border: `1px dashed ${photoCount >= 2 ? "#a7f3d0" : "#fde68a"}`,
                color: photoCount >= 2 ? "#065f46" : "#92400e",
              }}
            >
              <Camera size={16} />
              {photoCount >= 2
                ? `Top — ${photoCount} foto's geüpload.`
                : `Nog ${2 - photoCount} foto${photoCount === 1 ? "" : "'s"} nodig (minimaal 2).`}
            </div>
          </Panel>
        )}

        {step === 4 && (
          <Panel
            title="Waar is de klus en hoe ben je bereikbaar?"
            subtitle="Adres en telefoonnummer zijn alleen zichtbaar voor de klusser die jouw klus claimt."
          >
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="kb-field-label">Plaats</label>
                  <input
                    name="city"
                    required
                    placeholder="Utrecht"
                    className="kb-input"
                  />
                </div>
                <div>
                  <label className="kb-field-label">Postcode</label>
                  <input
                    name="postalCode"
                    required
                    placeholder="3511 AB"
                    className="kb-input"
                  />
                </div>
              </div>
              <div>
                <label className="kb-field-label">Straat en huisnummer</label>
                <input
                  name="address"
                  required
                  placeholder="Domplein 12"
                  className="kb-input"
                />
              </div>
              <div>
                <label className="kb-field-label">Telefoonnummer</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="06 12345678"
                  className="kb-input"
                />
              </div>

              <Summary
                type={type}
                services={services}
                title={title}
                complexity={complexity}
              />
            </div>
          </Panel>
        )}

        {state?.error && (
          <div
            className="rounded-lg border p-3 text-sm mt-4"
            style={{
              backgroundColor: "#fef2f2",
              borderColor: "#fecaca",
              color: "#991b1b",
            }}
          >
            {state.error}
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-[#5c6878] disabled:opacity-30 hover:bg-neutral-100"
          >
            <ArrowLeft size={14} /> Terug
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              className="btn-yellow"
            >
              Volgende <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending}
              className="btn-yellow"
              style={{ padding: "14px 28px", fontSize: "15px" }}
            >
              {pending ? "Plaatsen…" : "Klus plaatsen"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-5 gap-2">
      {STEP_LABELS.map((label, i) => {
        const isDone = i < step;
        const isCurrent = i === step;
        return (
          <li key={label}>
            <div
              className="h-1 rounded-full mb-2"
              style={{
                backgroundColor: isDone || isCurrent ? "#f7c021" : "#e2e8f0",
              }}
            />
            <div className="flex items-center gap-1.5">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  backgroundColor: isDone
                    ? "#10b981"
                    : isCurrent
                      ? "#1e4f70"
                      : "#e2e8f0",
                  color: isDone || isCurrent ? "white" : "#9aa6b5",
                }}
              >
                {isDone ? <Check size={10} /> : i + 1}
              </span>
              <span
                className={`text-xs font-semibold ${isCurrent ? "text-[#1a2535]" : "text-[#5c6878]"}`}
              >
                {label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="kb-panel">
      <h2 className="kb-heading text-2xl mb-1">{title}</h2>
      <p className="text-sm text-[#5c6878] mb-6">{subtitle}</p>
      {children}
    </div>
  );
}

function TypeCard({
  active,
  onClick,
  Icon,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  Icon: typeof Briefcase;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-xl p-5 transition-all"
      style={{
        border: `2px solid ${active ? "#3586b6" : "#e2e8f0"}`,
        backgroundColor: active ? "#eff6fc" : "#fff",
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
        style={{
          backgroundColor: active ? "#3586b6" : "#f1f5f9",
          color: active ? "white" : "#5c6878",
        }}
      >
        <Icon size={22} />
      </div>
      <p className="font-bold text-[#1a2535] mb-1">{title}</p>
      <p className="text-sm text-[#5c6878]">{description}</p>
    </button>
  );
}

function Summary({
  type,
  services,
  title,
  complexity,
}: {
  type: JobType;
  services: string[];
  title: string;
  complexity: Complexity;
}) {
  return (
    <div
      className="rounded-xl p-4 text-sm"
      style={{ backgroundColor: "#eff6fc", border: "1px solid #bfdbfe" }}
    >
      <p className="text-xs uppercase tracking-wider font-bold text-[#1e40af] mb-2">
        Samenvatting
      </p>
      <dl className="space-y-1.5">
        <div className="flex justify-between gap-3">
          <dt className="text-[#5c6878]">Type</dt>
          <dd className="font-semibold">
            {type === "project" ? "Project (multi-task)" : "Losse klus"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#5c6878]">Diensten</dt>
          <dd className="font-semibold text-right">
            {services.length > 0 ? services.join(", ") : "—"}
          </dd>
        </div>
        {type === "single" && (
          <div className="flex justify-between gap-3">
            <dt className="text-[#5c6878]">Grootte</dt>
            <dd className="font-semibold">{COMPLEXITY_LABELS[complexity]}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-[#5c6878]">Titel</dt>
          <dd className="font-semibold text-right">{title || "—"}</dd>
        </div>
      </dl>
    </div>
  );
}
