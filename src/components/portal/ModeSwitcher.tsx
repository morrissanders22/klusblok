import { Home, Hammer } from "lucide-react";

import { setMode } from "@/app/(portal)/_actions/mode";
import type { Capabilities, Mode } from "@/lib/mode";

export function ModeSwitcher({
  mode,
  caps: _caps,
}: {
  mode: Mode;
  caps: Capabilities;
}) {
  // Always render the toggle — switching to klusser without KVK is fine
  // (the user will be prompted to upgrade when they try to claim).
  return (
    <form
      action={async (formData) => {
        "use server";
        const next = formData.get("mode") as Mode;
        await setMode(next);
      }}
      className="grid grid-cols-2 gap-1 p-1 rounded-lg"
      style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
    >
      <ModeButton
        mode="kluszoeker"
        current={mode}
        label="Kluszoeker"
        Icon={Home}
      />
      <ModeButton
        mode="klusser"
        current={mode}
        label="Klusser"
        Icon={Hammer}
      />
    </form>
  );
}

function ModeButton({
  mode,
  current,
  label,
  Icon,
}: {
  mode: Mode;
  current: Mode;
  label: string;
  Icon: typeof Home;
}) {
  const isActive = mode === current;
  return (
    <button
      type="submit"
      name="mode"
      value={mode}
      className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-bold transition-all"
      style={{
        backgroundColor: isActive ? "#f7c021" : "transparent",
        color: isActive ? "#1a2535" : "rgba(255,255,255,0.65)",
      }}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}
