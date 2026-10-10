type Props = {
  code: string;
  title: string;
  message: string;
  children: React.ReactNode;
};

export default function StatusMessage({ code, title, message, children }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center py-16 text-center">
      <p className="text-8xl font-semibold tracking-tighter text-brand sm:text-9xl">
        {code}
      </p>
      <div className="mt-4 h-1 w-16 rounded-full bg-brand" />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 text-muted">{message}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {children}
      </div>
    </div>
  );
}
