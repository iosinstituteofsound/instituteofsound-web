export function LoadingTransmission() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <div className="magazine-rule w-24" />
      <p className="text-xs tracking-[0.3em] text-rs-red uppercase font-semibold animate-pulse">
        Loading
      </p>
    </div>
  )
}
