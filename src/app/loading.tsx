const Bar = ({ className }: { className: string }) => (
  <div className={`bg-muted animate-pulse rounded-md ${className}`} />
);

const Loading = () => (
  <>
    <div className="h-14 border-b" />
    <main
      aria-busy="true"
      aria-label="Loading documents"
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-8"
    >
      <div className="flex items-center justify-between">
        <Bar className="h-8 w-48" />
        <Bar className="h-8 w-56" />
      </div>
      <div className="divide-y rounded-xl border">
        {["a", "b", "c"].map((key) => (
          <div className="flex items-center gap-3 px-4 py-4" key={key}>
            <Bar className="size-4" />
            <Bar className="h-4 flex-1" />
            <Bar className="h-4 w-24" />
          </div>
        ))}
      </div>
    </main>
  </>
);

export default Loading;
