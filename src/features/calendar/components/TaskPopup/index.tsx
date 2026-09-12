import './style.css';
import { Dispatch } from 'react';
import { createPortal } from 'react-dom';
import { CalendarTask, TaskPopup as Popup } from '../../model/types';
import { CalendarAction } from '../../model/state';
import useFloatingPanel from '../../hooks/useFloatingPanel';
import TaskDetails from '../TaskDetails';
import TaskForm from '../TaskForm';

interface Props {
  popup: Popup;
  task: CalendarTask;
  dispatch: Dispatch<CalendarAction>;
}

export default function TaskPopup({ popup, task, dispatch }: Props) {
  const close = () => dispatch({ type: 'closePopup' });
  const ref = useFloatingPanel(popup.anchor, close, popup.point);
  if (popup.mode === 'menu') {
    return createPortal(
      <div ref={ref} className="calendar-context-menu" onContextMenu={(e) => e.preventDefault()}>
        <button autoFocus type="button" onClick={() => dispatch({ type: 'openPopup', popup: { ...popup, mode: 'edit', point: undefined } })}>Sửa (Edit)</button>
        <button type="button" className="calendar-context-delete" onClick={() => dispatch({ type: 'deleteTask', id: task.id })}>Xóa (Delete)</button>
      </div>, document.body);
  }
  const heading = popup.mode === 'view' ? 'Chi tiết task' : popup.mode === 'edit' ? 'Sửa task' : 'Tạo task';
  return createPortal(
    <div ref={ref} className="calendar-modal" role="dialog" aria-label={heading}>
      <header className="calendar-modal-header">
        <h2 className="calendar-modal-heading">{heading}</h2>
        <button type="button" className="calendar-modal-close" aria-label="Đóng" onClick={close}>×</button>
      </header>
      {popup.mode === 'view' ? <TaskDetails task={task} />
        : <TaskForm task={task} editing={popup.mode === 'edit'} onSave={(updated) => dispatch({ type: 'saveTask', task: updated })} />}
    </div>, document.body);
}
