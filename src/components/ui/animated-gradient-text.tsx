import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function AnimatedGradientText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-full bg-white/5 px-4 py-1.5 font-medium backdrop-blur-sm transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[0_0_20px_rgba(0,255,159,0.1)] border border-white/10",
        className,
      )}
    >
      <div
        className={`absolute inset-0 block h-full w-full animate-gradient bg-gradient-to-r from-[#00FF9F]/20 via-[#008080]/20 to-[#00FF9F]/20 bg-[length:var(--bg-size)_100%] p-[1px] [mask-image:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] rounded-full`}
      />
      {children}
    </div>
  );
}