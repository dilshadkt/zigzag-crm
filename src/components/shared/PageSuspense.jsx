import { Suspense } from "react";
import { useLocation } from "react-router-dom";

const Block = ({ className }) => (
  <div
    className={`bg-slate-200 animate-shimmer bg-[linear-gradient(110deg,#e2e8f0,45%,#f1f5f9,55%,#e2e8f0)] bg-[length:200%_100%] rounded ${className}`}
  />
);

const PageFallback = () => (
  <div className="w-full h-full space-y-5">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Block className="h-7 w-52" />
        <Block className="h-4 w-36" />
      </div>
      <Block className="h-10 w-28 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3"
        >
          <Block className="h-9 w-9 rounded-xl" />
          <Block className="h-4 w-24" />
          <Block className="h-7 w-16" />
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Block className="h-10 w-10 rounded-xl" />
          <Block className="h-4 flex-1" />
          <Block className="h-4 w-24" />
          <Block className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * React Router runs navigations inside startTransition, so an already-mounted
 * Suspense boundary keeps the previous page on screen while the next lazy route
 * chunk downloads. Keying the boundary by pathname makes it a fresh boundary on
 * every navigation, so the fallback shows immediately instead.
 */
const PageSuspense = ({ children, fallback = <PageFallback /> }) => {
  const { pathname } = useLocation();

  return (
    <Suspense key={pathname} fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default PageSuspense;
