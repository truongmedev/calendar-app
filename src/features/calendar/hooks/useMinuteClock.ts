import { useEffect, useState } from 'react';

export default function useMinuteClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => { setNow(new Date()); schedule(); }, 60000 - Date.now() % 60000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);
  return now;
}
