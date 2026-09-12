import { act, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

class TestPointerEvent extends MouseEvent {
  pointerId: number;
  isPrimary: boolean;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
    this.isPrimary = init.isPrimary ?? true;
  }
}

beforeAll(() => {
  Object.defineProperty(window, 'PointerEvent', { value: TestPointerEvent });
  Object.defineProperty(global, 'ResizeObserver', { value: class { observe() { } unobserve() { } disconnect() { } } });
  let nextId = 0;
  Object.defineProperty(window, 'crypto', { value: { randomUUID: () => String(++nextId) } });
  HTMLElement.prototype.setPointerCapture = jest.fn();
  HTMLElement.prototype.hasPointerCapture = jest.fn(() => false);
  HTMLElement.prototype.releasePointerCapture = jest.fn();
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
    const isColumn = this.classList.contains('calendar-day-layer');
    const top = isColumn ? 80 - (this.closest('.calendar-table-container')?.scrollTop ?? 0) : 0;
    const height = isColumn ? 1440 : this.tagName === 'THEAD' ? 80 : 600;
    return { top, left: 55, right: 255, bottom: top + height, width: 200, height, x: 55, y: top, toJSON() { } };
  });
});

afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });

const pointer = (clientY: number) => ({ clientY, pointerId: 1, isPrimary: true, button: 0, buttons: 1 });
const draw = (column: Element, start = 100, end = 160) => {
  fireEvent.pointerDown(column, pointer(start));
  fireEvent.pointerMove(window, pointer(end));
  act(() => { jest.advanceTimersByTime(32); });
  fireEvent.pointerUp(window, { ...pointer(end), buttons: 0 });
};
const create = (column: Element, title = 'Task A') => {
  draw(column);
  fireEvent.change(screen.getByLabelText('Tên task'), { target: { value: title } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
};

test('click-release does not keep drawing; create, view, edit and delete work', () => {
  const { container } = render(<App />);
  const column = container.querySelector('.calendar-day-layer')!;
  fireEvent.pointerDown(column, pointer(100));
  fireEvent.pointerUp(window, { ...pointer(100), buttons: 0 });
  fireEvent.pointerMove(window, { ...pointer(180), buttons: 0 });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(container.querySelector('[data-draft]')).toBeNull();
  create(column);
  const card = container.querySelector('.calendar-task')!;
  expect(card).toHaveTextContent('Task A');
  fireEvent.click(card);
  expect(screen.getByRole('dialog', { name: 'Chi tiết task' })).toBeInTheDocument();
  fireEvent.pointerDown(document.body, pointer(0));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.contextMenu(card, { clientX: 200, clientY: 150 });
  fireEvent.click(screen.getByRole('button', { name: 'Sửa (Edit)' }));
  fireEvent.change(screen.getByLabelText('Tên task'), { target: { value: 'Edited' } });
  fireEvent.change(screen.getByLabelText('Bắt đầu'), { target: { value: '02:00' } });
  fireEvent.change(screen.getByLabelText('Kết thúc'), { target: { value: '03:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
  expect(card).toHaveStyle({ top: '120px', height: '60px' });
  expect(card).toHaveTextContent('Edited');
  fireEvent.contextMenu(card);
  fireEvent.click(screen.getByRole('button', { name: 'Xóa (Delete)' }));
  expect(container.querySelector('.calendar-task')).toBeNull();
});

test('only selected tasks move, resize independently, and cancel restores the original range', () => {
  const { container } = render(<App />);
  const column = container.querySelector('.calendar-day-layer')!;
  create(column);
  const card = container.querySelector('.calendar-task')!;
  draw(card, 120, 180);
  expect(card).toHaveStyle({ top: '20px', height: '60px' });
  fireEvent.click(card);
  draw(card, 120, 180);
  expect(card).toHaveStyle({ top: '80px', height: '60px' });
  const end = card.querySelector('.calendar-resize-handle--end')!;
  draw(end, 200, 230);
  expect(card).toHaveStyle({ top: '80px', height: '90px' });
  fireEvent.pointerDown(card, pointer(200));
  fireEvent.pointerMove(window, pointer(260));
  act(() => { jest.advanceTimersByTime(32); });
  fireEvent.pointerCancel(window, pointer(260));
  expect(card).toHaveStyle({ top: '80px', height: '90px' });
});

test('overlaps display side by side with borders and without warning text', () => {
  const { container } = render(<App />);
  const column = container.querySelector('.calendar-day-layer')!;
  create(column, 'First');
  create(column, 'Second');
  const cards = container.querySelectorAll('.calendar-task');
  expect(cards).toHaveLength(2);
  expect(cards[0]).toHaveClass('calendar-task--conflict');
  expect(cards[1]).toHaveClass('calendar-task--conflict');
  expect((cards[0] as HTMLElement).style.left).not.toBe((cards[1] as HTMLElement).style.left);
  expect(screen.queryByText(/Trùng lịch/)).not.toBeInTheDocument();
});

test('holding near the edge scrolls and updates time; release stops it', () => {
  const { container } = render(<App />);
  const column = container.querySelector('.calendar-day-layer')!;
  const scroller = container.querySelector('.calendar-table-container')!;
  fireEvent.pointerDown(column, pointer(500));
  fireEvent.pointerMove(window, pointer(590));
  act(() => { jest.advanceTimersByTime(300); });
  expect(scroller.scrollTop).toBeGreaterThan(0);
  const before = scroller.scrollTop;
  fireEvent.pointerUp(window, { ...pointer(590), buttons: 0 });
  act(() => { jest.advanceTimersByTime(300); });
  expect(scroller.scrollTop).toBe(before);
  expect(screen.getByRole('dialog', { name: 'Tạo task' })).toBeInTheDocument();
});
