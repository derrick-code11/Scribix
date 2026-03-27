import { Spinner } from "@/components/ui/spinner";

export function FullScreenSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-scribix-bg">
      <Spinner />
    </div>
  );
}
