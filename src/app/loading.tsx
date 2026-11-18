import Loader from "@/components/Loader";

export default function Loading() {
  return (
    <div className="sy-sky flex min-h-dvh items-center justify-center">
      <Loader center size={76} phrases={["Opening the garden…"]} />
    </div>
  );
}
