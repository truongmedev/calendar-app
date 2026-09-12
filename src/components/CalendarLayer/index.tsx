import React, { useRef, useState } from "react";
import { CalendarDay, CalendarTimeSelection } from "../../types";
import "./style.css";
import { getTimeByPosition } from "../../utils";

interface CanlenderLayerProps {
  days: CalendarDay[];
}

const CanlenderLayer: React.FC<CanlenderLayerProps> = React.memo((props) => {
  const { days } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [selection, setSelection] = useState<CalendarTimeSelection | null>(
    null,
  );

  const getPointerPosition = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return e.clientY - rect.top;
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    day: string,
  ) => {
    setIsDragging(true);
    const timePosition = getPointerPosition(e);
    const timeLabel = getTimeByPosition(timePosition);
    const newSelection: CalendarTimeSelection = {
      day,
      startPosition: timePosition,
      startTime: timeLabel,
    };
    setSelection(newSelection);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !selection) return;
    const timePosition = getPointerPosition(e);
    const startLabel = getTimeByPosition(Math.min(selection.startPosition, timePosition));
    const endLabel = getTimeByPosition(Math.max(selection.startPosition, timePosition));
    setSelection({
      ...selection,
      endPosition: timePosition,
      startTime: startLabel,
      endTime: endLabel,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
  };

  return (
    <div
      className="calendar-layers"
      style={{
        gridTemplateColumns: `repeat(${days.length || 1}, minmax(0, 1fr))`,
      }}
    >
      {days.map((day) => (
        <div
          key={day.date}
          className="calendar-day-layer"
          onPointerDown={(e) => handlePointerDown(e, day.date)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {selection?.day === day.date && selection.endPosition && (
            <div
              className="calendar-time-selection"
              style={{
                top: `${Math.min(selection.startPosition, selection.endPosition)}px`,
                height: `${Math.abs(selection.endPosition - selection.startPosition)}px`,
              }}
            >
              <div className="calendar-selection-time">
                {selection.startTime}
                {" – "}
                {selection.endTime}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

export default CanlenderLayer;
