const buttonBase =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60";

export const buttonPrimary = `${buttonBase} bg-brand text-white hover:bg-brand-strong`;

export const buttonSecondary = `${buttonBase} border border-line bg-card text-ink hover:bg-surface`;

export const buttonDanger = `${buttonBase} border border-danger/30 bg-card text-danger hover:bg-danger-soft`;

export const input =
  "w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-2 focus:outline-brand/30";

export const label = "mb-1 block text-sm font-medium text-ink";

export const card = "rounded-2xl border border-line bg-card";

export const fieldError = "mt-1 text-sm text-danger";

export const formError =
  "rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger";
