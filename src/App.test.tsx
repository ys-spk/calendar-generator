import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { downloadCalendarPdf, renderCalendarSvgs } from './utils/typst/pdf';

vi.mock('./utils/typst/pdf', () => ({
  downloadCalendarPdf: vi.fn(),
  renderCalendarSvgs: vi.fn(),
}));

const buildMockSvgs = (year: number) =>
  Array.from({ length: 5 }, (_, index) => `<svg><text>mock wasm ${year} ${index + 1}</text></svg>`);

describe('App', () => {
  beforeEach(() => {
    // mockImplementation を使うテストが後続に漏れないよう、毎回デフォルト実装から始める
    vi.mocked(downloadCalendarPdf).mockReset().mockResolvedValue(undefined);
    vi.mocked(renderCalendarSvgs)
      .mockReset()
      .mockImplementation((year) => Promise.resolve(buildMockSvgs(year)));
    vi.spyOn(console, 'error').mockImplementation(vi.fn());
  });

  it('主要UIが表示される', async () => {
    render(<App />);

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PDF出力' })).toBeInTheDocument();
    // WASM の非同期レンダリング完了を待って act() 警告を解消する
    await screen.findByTestId('wasm-svg-viewer');
  });

  it('年入力欄をblurするとcommitYearが呼ばれる', async () => {
    const user = userEvent.setup();

    render(<App />);
    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.tab();

    // blur後もUIが壊れていないことを確認
    expect(screen.getByTestId('app-header')).toBeInTheDocument();
  });

  it('年入力欄でEnterキーを押すとhandleYearKeyDownが呼ばれる', async () => {
    const user = userEvent.setup();

    render(<App />);
    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
  });

  it('翌年/前年ボタンで年が更新される', async () => {
    const user = userEvent.setup();
    const baseYear = new Date().getFullYear() + 1;

    render(<App />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(baseYear);

    await user.click(screen.getByRole('button', { name: '翌年' }));
    expect(input).toHaveValue(baseYear + 1);

    await user.click(screen.getByRole('button', { name: '前年' }));
    expect(input).toHaveValue(baseYear);
  });

  it('入力年のWASMを表示する', async () => {
    const user = userEvent.setup();

    render(<App />);
    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '2030');
    await user.tab();

    // debounce後に入力年でレンダリングが実行される
    await waitFor(() => expect(renderCalendarSvgs).toHaveBeenLastCalledWith(2030));
    await screen.findByRole('img', { name: '2030年カレンダー 1ページ目' });
    expect(screen.getAllByTestId('wasm-svg-page')).toHaveLength(5);
  });

  it('年変更のレンダリング中は直前のプレビューを保持してレンダリング中表示を出す', async () => {
    const user = userEvent.setup();
    const baseYear = new Date().getFullYear() + 1;
    let resolveNext: ((svgs: string[]) => void) | undefined;
    vi.mocked(renderCalendarSvgs).mockImplementation((year) => {
      if (year === 2030) {
        return new Promise((resolve) => {
          resolveNext = resolve;
        });
      }
      return Promise.resolve(buildMockSvgs(year));
    });

    render(<App />);
    await screen.findByRole('img', { name: `${baseYear}年カレンダー 1ページ目` });

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '2030');
    await user.tab();

    // 新しい年のレンダリング中も直前の年のSVGが消えない
    await screen.findByRole('status');
    expect(screen.getByRole('status')).toHaveTextContent('レンダリング中...');
    expect(
      screen.getByRole('img', { name: `${baseYear}年カレンダー 1ページ目` })
    ).toBeInTheDocument();

    act(() => {
      resolveNext?.(buildMockSvgs(2030));
    });
    await screen.findByRole('img', { name: '2030年カレンダー 1ページ目' });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('PDF出力に失敗したときエラーを表示する', async () => {
    const user = userEvent.setup();
    vi.mocked(downloadCalendarPdf).mockRejectedValueOnce(new Error('network error'));

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'PDF出力' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'PDF出力に失敗しました: network error'
    );
    expect(screen.getByRole('button', { name: 'PDF出力' })).toBeEnabled();
  });

  it('年を更新するとPDF出力エラー表示をクリアする', async () => {
    const user = userEvent.setup();
    vi.mocked(downloadCalendarPdf).mockRejectedValueOnce(new Error('network error'));

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'PDF出力' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '2028');
    await user.tab();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
