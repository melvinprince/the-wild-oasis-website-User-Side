import Spinner from "@/app/_components/Spinner";

export default function loading() {
  return (
    <div className="grid items-center justify-center">
      <Spinner />
      <p className="text-xl text-primary-200">Loading Cabin Data</p>
    </div>
  );
}
