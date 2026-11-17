const Bar = ({ className }: { className: string }) => (
  <div className={`bg-muted animate-pulse rounded-md ${className}`} />
);

const Loading = () => (
  <>
    <div className="h-14 border-b" />
    <main
      aria-busy="true"
      aria-label="Loading document"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 pt-6"
    >
      <Bar className="h-9 w-2/3" />
      <Bar className="h-8 w-full" />
      <div className="flex flex-col gap-3 pt-6">
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-11/12" />
        <Bar className="h-4 w-4/5" />
      </div>
    </main>
  </>
);

export default Loading;
