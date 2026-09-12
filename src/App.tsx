import React, { useEffect, useState } from 'react';
import './App.css';
import CalendarTable from './components/CalendarTable';
import { getDate } from './utils';

function App() {

  const [time, setTime] = useState<Date>(new Date());
  const date = getDate(time);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date();
      setTime(currentTime);
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <CalendarTable
        currentDate={date}
        currentTime={time}
      />
    </div>
  );
}

export default App;
