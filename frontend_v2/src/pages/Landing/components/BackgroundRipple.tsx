import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

export function BackgroundRipple() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-start justify-start overflow-hidden">
      <BackgroundRippleEffect rows={12} />
      <div className="mt-60 w-full">
        <h2 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-neutral-800 md:text-4xl lg:text-7xl dark:text-neutral-100">
          Get Me <span className="text-primary">Hired</span>
        </h2>
        <p className="relative z-10 mx-auto mt-4 max-w-xl text-center text-neutral-500">
          Get ready for your next interview with guided practice sessions
          and practical insights to help you improve.
        </p>
      </div>
    </div>
  );
}
