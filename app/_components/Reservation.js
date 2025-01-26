import DateSelector from "@/app/_components/DateSelector";
import ReservationForm from "@/app/_components/ReservationForm";
import { getBookedDatesByCabinId, getSettings } from "@/app/_lib/data-service";

async function Reservation({ cabin }) {
  const [settings, bookedDates] = await Promise.all([
    getSettings(),
    getBookedDatesByCabinId(cabin.id),
  ]);
  return (
    <div>
      <div className="grid grid-cols-2 border-primary-800 min-h-[400px] ">
        <DateSelector
          settings={settings}
          bookedDates={bookedDates}
          cabin={cabin}
        />
        <ReservationForm cabin={cabin} />
      </div>
    </div>
  );
}

export default Reservation;
