/*
 * ファイルの場所: /app/page.tsx
 * 役割: Reactからの警告を解消するため、CSSのスタイル指定を修正します。
 * ★★★ このファイルの内容を全て以下のコードに置き換えてください ★★★
 */
"use client";

import React, { useState, useEffect, FC, ReactNode, useCallback } from 'react';

// --- 型定義 ---
interface Opinion { Id: number; Grade: string; Content: string; SubmittedAt: string; ThemeTitle: string | null; }
interface Theme { id: number; theme_title: string; }
interface OpinionFilters { themeId: number | 'all'; grade: string; keyword: string; sortBy: string; sortOrder: string; }
interface ThemeFilters { keyword: string; sortBy: string; sortOrder: string; }
interface Pagination { currentPage: number; totalPages: number; }

// --- APIエラーヘルパー ---
const handleApiError = async (res: Response, defaultMessage: string) => {
  const errorData = await res.json().catch(() => null);
  alert(errorData?.message || defaultMessage);
};

// --- スタイル定義 ---
const styles: { [key: string]: React.CSSProperties } = {
  container: { fontFamily: 'sans-serif', padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#333' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' },
  headerTitle: { fontSize: '2rem', margin: 0 },
  mainContent: { display: 'flex', gap: '2rem' },
  sideNav: { width: '300px', flexShrink: 0 },
  mainArea: { flex: 1, minWidth: 0 },
  form: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  input: { padding: '0.5rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 auto', minWidth: 0 },
  button: { padding: '0.5rem 1rem', fontSize: '1rem', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexShrink: 0, transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  controlPanel: { padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #eee' },
  filters: { display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  filterInput: { padding: '0.5rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px' },
  csvButton: { backgroundColor: '#16a34a', marginLeft: 'auto' },
  collapsibleHeader: { display: 'flex', alignItems: 'center', width: '100%', padding: '0.75rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' },
  collapsibleContent: { padding: '0 0.5rem 1rem 0.5rem' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
  th: { border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' },
  td: { border: '1px solid #ddd', padding: '8px', verticalAlign: 'top', wordBreak: 'break-all' },
  actionCell: { width: '150px', textAlign: 'center' },
  actionButton: { border: 'none', background: 'none', cursor: 'pointer', padding: '0.25rem', textDecoration: 'underline', fontSize: '0.8rem', margin: '0 0.2rem' },
  deleteButton: { color: '#ef4444' },
  restoreButton: { color: '#22c55e' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' },
  pageButton: { padding: '0.5rem 1rem', border: '1px solid #ccc', background: 'white', borderRadius: '4px', cursor: 'pointer' },
  disabledButton: { cursor: 'not-allowed', opacity: 0.5 },
  themeList: { listStyle: 'none', padding: 0, margin: 0 },
  themeListItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' },
  // ★★★ ここから修正 ★★★
  themeButton: { 
    flexGrow: 1, 
    padding: '0.75rem', 
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#ccc',
    borderRadius: '4px', 
    cursor: 'pointer', 
    textAlign: 'left', 
    backgroundColor: 'white' 
  },
  selectedThemeButton: { 
    backgroundColor: '#dbeafe', 
    borderColor: '#3b82f6', 
    fontWeight: 'bold' 
  },
  // ★★★ ここまで修正 ★★★
  themeActionButton: { padding: '0.5rem', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  analyzingBanner: { padding: '1rem', backgroundColor: '#fef9c3', color: '#713f12', textAlign: 'center', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fde047', fontWeight: 'bold' }
};

// --- サブコンポーネント ---
const CollapsibleSection: FC<{ title: string; children: ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <section>
      <button style={styles.collapsibleHeader} onClick={() => setIsOpen(!isOpen)}>
        <span style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', marginRight: '0.5rem' }}>▶</span>
        {title}
      </button>
      {isOpen && <div style={styles.collapsibleContent}>{children}</div>}
    </section>
  );
};

const OpinionTable: FC<any> = ({ opinions, onSoftDelete, onRestore, onHardDelete }) => (
  <table style={styles.table}>
    <thead><tr><th style={styles.th}>テーマ</th><th style={styles.th}>学年</th><th style={styles.th}>意見内容</th><th style={styles.th}>投稿日時</th><th style={styles.th}>操作</th></tr></thead>
    <tbody>
      {opinions.length > 0 ? opinions.map((op: Opinion) => (
        <tr key={op.Id}>
          <td style={styles.td}>{op.ThemeTitle || 'N/A'}</td><td style={styles.td}>{op.Grade}</td><td style={styles.td}>{op.Content}</td>
          <td style={styles.td}>{new Date(op.SubmittedAt).toLocaleString('ja-JP')}</td>
          <td style={{ ...styles.td, ...styles.actionCell }}>
            {onSoftDelete && <button onClick={() => onSoftDelete(op.Id)} style={{ ...styles.actionButton, ...styles.deleteButton }}>削除</button>}
            {onRestore && <button onClick={() => onRestore(op.Id)} style={{ ...styles.actionButton, ...styles.restoreButton }}>復元</button>}
            {onHardDelete && <button onClick={() => onHardDelete(op.Id)} style={{ ...styles.actionButton, ...styles.deleteButton }}>完全削除</button>}
          </td>
        </tr>
      )) : (<tr><td colSpan={5} style={{ ...styles.td, textAlign: 'center' }}>該当する意見はありません。</td></tr>)}
    </tbody>
  </table>
);

const PaginationControls: FC<{ pagination: Pagination, onPageChange: (page: number) => void }> = ({ pagination, onPageChange }) => (
    pagination.totalPages > 1 ? (
        <div style={styles.pagination}>
            <button onClick={() => onPageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} style={{ ...styles.pageButton, ...(pagination.currentPage === 1 ? styles.disabledButton : {}) }}>前</button>
            <span>{pagination.currentPage} / {pagination.totalPages}</span>
            <button onClick={() => onPageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} style={{ ...styles.pageButton, ...(pagination.currentPage === pagination.totalPages ? styles.disabledButton : {}) }}>次</button>
        </div>
    ) : null
);

const ThemeList: FC<any> = ({ themes, selectedThemeId, onSelectTheme, onSoftDelete, onRestore, onHardDelete, onAnalyze }) => (
  <ul style={styles.themeList}>
    {themes.map((theme: Theme) => (
      <li key={theme.id} style={styles.themeListItem}>
        <button onClick={() => onSelectTheme(theme.id)} style={{...styles.themeButton, ...(selectedThemeId === theme.id ? styles.selectedThemeButton : {})}}>
          {theme.theme_title}
        </button>
        {onAnalyze && <button onClick={() => onAnalyze(theme.id)} title="AIで分析" style={{...styles.themeActionButton, backgroundColor: '#fde68a', color: '#713f12'}}>🧠</button>}
        {onSoftDelete && <button onClick={() => onSoftDelete(theme.id, theme.theme_title)} style={{...styles.themeActionButton, backgroundColor: '#fee2e2', color: '#b91c1c'}}>✕</button>}
        {onRestore && <button onClick={() => onRestore(theme.id)} style={{...styles.themeActionButton, backgroundColor: '#dcfce7', color: '#166534'}}>✓</button>}
        {onHardDelete && <button onClick={() => onHardDelete(theme.id, theme.theme_title)} style={{...styles.themeActionButton, backgroundColor: '#ef4444', color: 'white'}}>🗑️</button>}
      </li>
    ))}
  </ul>
);

// --- メインページコンポーネント ---
export default function StaffPage() {
  const [activeOpinions, setActiveOpinions] = useState<Opinion[]>([]);
  const [deletedOpinions, setDeletedOpinions] = useState<Opinion[]>([]);
  const [activeThemes, setActiveThemes] = useState<Theme[]>([]);
  const [deletedThemes, setDeletedThemes] = useState<Theme[]>([]);
  const [newThemeTitle, setNewThemeTitle] = useState('');
  const [opinionFilters, setOpinionFilters] = useState<OpinionFilters>({ themeId: 'all', grade: 'all', keyword: '', sortBy: 'created_at', sortOrder: 'DESC' });
  const [themeFilters, setThemeFilters] = useState<ThemeFilters>({ keyword: '', sortBy: 'created_at', sortOrder: 'DESC' });
  const [activeThemePagination, setActiveThemePagination] = useState<Pagination>({ currentPage: 1, totalPages: 1 });
  const [deletedThemePagination, setDeletedThemePagination] = useState<Pagination>({ currentPage: 1, totalPages: 1 });
  const [activeOpinionPagination, setActiveOpinionPagination] = useState<Pagination>({ currentPage: 1, totalPages: 1 });
  const [deletedOpinionPagination, setDeletedOpinionPagination] = useState<Pagination>({ currentPage: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisLimit, setAnalysisLimit] = useState<number | 'all'>(10);
  const [error, setError] = useState<string | null>(null);

  const GRADES = ['中1', '中2', '中3', '高1', '高2', '高3'];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchResource = async (path: string) => { const res = await fetch(path); if (!res.ok) throw new Error(`${path} の取得に失敗`); return res.json(); };
      const opinionParams = (status: string, page: number) => new URLSearchParams({ status, page: String(page), ...opinionFilters, themeId: String(opinionFilters.themeId) });
      const themeParams = (status: string, page: number) => new URLSearchParams({ status, page: String(page), ...themeFilters });

      const [activeThemeData, deletedThemeData, activeOpinionData, deletedOpinionData] = await Promise.all([
        fetchResource(`/api/themes?${themeParams('active', activeThemePagination.currentPage)}`),
        fetchResource(`/api/themes?${themeParams('deleted', deletedThemePagination.currentPage)}`),
        fetchResource(`/api/opinions?${opinionParams('active', activeOpinionPagination.currentPage)}`),
        fetchResource(`/api/opinions?${opinionParams('deleted', deletedOpinionPagination.currentPage)}`),
      ]);
      
      setActiveThemes(activeThemeData.themes); setActiveThemePagination(p => ({...p, totalPages: activeThemeData.totalPages}));
      setDeletedThemes(deletedThemeData.themes); setDeletedThemePagination(p => ({...p, totalPages: deletedThemeData.totalPages}));
      setActiveOpinions(activeOpinionData.opinions); setActiveOpinionPagination(p => ({...p, totalPages: activeOpinionData.totalPages}));
      setDeletedOpinions(deletedOpinionData.opinions); setDeletedOpinionPagination(p => ({...p, totalPages: deletedOpinionData.totalPages}));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [opinionFilters, themeFilters, activeThemePagination.currentPage, deletedThemePagination.currentPage, activeOpinionPagination.currentPage, deletedOpinionPagination.currentPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpinionFilterChange = (newFilters: Partial<OpinionFilters>) => {
    setOpinionFilters(prev => ({ ...prev, ...newFilters }));
    setActiveOpinionPagination(p => ({ ...p, currentPage: 1 }));
    setDeletedOpinionPagination(p => ({ ...p, currentPage: 1 }));
  };
  const handleThemeFilterChange = (newFilters: Partial<ThemeFilters>) => {
    setThemeFilters(prev => ({ ...prev, ...newFilters }));
    setActiveThemePagination(p => ({...p, currentPage: 1}));
    setDeletedThemePagination(p => ({...p, currentPage: 1}));
  };

  const handleThemeSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!newThemeTitle.trim()) return; const res = await fetch('/api/themes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme_title: newThemeTitle }) }); if (res.ok) { setNewThemeTitle(''); fetchData(); } else { await handleApiError(res, 'テーマの投稿に失敗'); } };
  const handleThemeAction = async (id: number, action: 'soft-delete' | 'restore' | 'hard-delete', confirmMsg: string) => { if (!window.confirm(confirmMsg)) return; const method = action === 'hard-delete' ? 'DELETE' : 'PATCH'; const body = method === 'PATCH' ? JSON.stringify({ action }) : null; const res = await fetch(`/api/themes/${id}`, { method, headers: { 'Content-Type': 'application/json' }, body }); if (res.ok) fetchData(); else await handleApiError(res, 'テーマの操作に失敗'); };
  const handleOpinionAction = async (id: number, action: 'soft-delete' | 'restore' | 'hard-delete', confirmMsg: string) => { if (!window.confirm(confirmMsg)) return; const method = action === 'hard-delete' ? 'DELETE' : 'PATCH'; const body = method === 'PATCH' ? JSON.stringify({ action }) : null; const res = await fetch(`/api/opinions/${id}`, { method, headers: { 'Content-Type': 'application/json' }, body }); if (res.ok) fetchData(); else await handleApiError(res, '意見の操作に失敗'); };
  
  const handleExportCSV = () => {
    const params = new URLSearchParams({ status: 'active', ...opinionFilters, themeId: String(opinionFilters.themeId) });
    const url = `/api/csv-export?${params.toString()}`;
    window.open(url, '_blank');
  };

  const handleAnalyze = async (themeId: number) => {
    const limitText = analysisLimit === 'all' ? '全ての' : `${analysisLimit}件の`;
    if (!window.confirm(`このテーマの${limitText}未分析の意見をAIで分析しますか？`)) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId, limit: analysisLimit }),
      });
      if (!res.ok) {
        await handleApiError(res, '分析の実行に失敗しました。');
      } else {
        const result = await res.json();
        alert(result.message);
        fetchData();
      }
    } catch (err) {
      alert('分析中に予期せぬエラーが発生しました。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>ココロボ・プロジェクト 管理画面</h1>
        <a href="/ai-report" style={{...styles.button, textDecoration: 'none' }}>🧠 AI分析レポート</a>
      </header>

      {isAnalyzing && <div style={styles.analyzingBanner}>🧠 AI分析中...</div>}

      <div style={styles.mainContent}>
        <aside style={styles.sideNav}>
          <CollapsibleSection title="テーマ管理" defaultOpen={true}>
            <form onSubmit={handleThemeSubmit} style={styles.form}>
              <input type="text" value={newThemeTitle} onChange={(e) => setNewThemeTitle(e.target.value)} placeholder="新しいテーマ" style={styles.input} />
              <button type="submit" style={{...styles.button, writingMode: 'vertical-rl', textOrientation: 'mixed' }}>投稿</button>
            </form>
            <div style={{...styles.filterGroup, marginBottom: '1rem', padding: '0 0.5rem', justifyContent: 'space-between'}}>
                <label htmlFor="analysis-limit">分析件数:</label>
                <select 
                  id="analysis-limit"
                  value={analysisLimit} 
                  onChange={e => setAnalysisLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))} 
                  style={{...styles.filterInput, flex: 1}}
                >
                  <option value={10}>10件ずつ</option>
                  <option value={50}>50件ずつ</option>
                  <option value="all">全て</option>
                </select>
            </div>
            
            <CollapsibleSection title="有効なテーマ" defaultOpen={true}>
              <div style={{...styles.filters, flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem', marginBottom: '1rem', padding: '0 0.5rem' }}>
                <input type="search" placeholder="テーマを検索" value={themeFilters.keyword} onChange={e => handleThemeFilterChange({ keyword: e.target.value })} style={{...styles.filterInput, width: '100%'}} />
                <select value={`${themeFilters.sortBy}-${themeFilters.sortOrder}`} onChange={e => { const [sortBy, sortOrder] = e.target.value.split('-'); handleThemeFilterChange({ sortBy, sortOrder }); }} style={styles.filterInput}>
                    <option value="created_at-DESC">新着順</option><option value="created_at-ASC">古い順</option><option value="theme_title-ASC">名前順 (昇順)</option><option value="theme_title-DESC">名前順 (降順)</option>
                </select>
              </div>
              <ThemeList themes={activeThemes} selectedThemeId={opinionFilters.themeId} onSelectTheme={(id: number) => handleOpinionFilterChange({ themeId: id })} onSoftDelete={(id: number, title: string) => handleThemeAction(id, 'soft-delete', `「${title}」を削除済みに移動しますか？`)} onAnalyze={handleAnalyze} />
              <PaginationControls pagination={activeThemePagination} onPageChange={page => setActiveThemePagination(p => ({...p, currentPage: page}))} />
            </CollapsibleSection>
            
            <button onClick={() => handleOpinionFilterChange({ themeId: 'all' })} style={{ ...styles.themeButton, width: '100%', margin: '1rem 0', ...(opinionFilters.themeId === 'all' ? styles.selectedThemeButton : {}) }}>全ての意見を表示</button>

            <CollapsibleSection title="削除済みのテーマ" defaultOpen={false}>
               <ThemeList themes={deletedThemes} selectedThemeId={opinionFilters.themeId} onSelectTheme={(id: number) => handleOpinionFilterChange({ themeId: id })} onRestore={(id: number) => handleThemeAction(id, 'restore', 'このテーマを復元しますか？')} onHardDelete={(id: number, title: string) => handleThemeAction(id, 'hard-delete', `「${title}」を完全に削除します。よろしいですか？`)} />
               <PaginationControls pagination={deletedThemePagination} onPageChange={page => setDeletedThemePagination(p => ({...p, currentPage: page}))} />
            </CollapsibleSection>
          </CollapsibleSection>
        </aside>

        <main style={styles.mainArea}>
          <div style={styles.controlPanel}>
            <div style={styles.filters}>
              <div style={styles.filterGroup}><label>学年:</label><select value={opinionFilters.grade} onChange={e => handleOpinionFilterChange({ grade: e.target.value })} style={styles.filterInput}><option value="all">全て</option>{GRADES.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
              <div style={styles.filterGroup}><label>並び順:</label><select value={`${opinionFilters.sortBy}-${opinionFilters.sortOrder}`} onChange={e => { const [sortBy, sortOrder] = e.target.value.split('-'); handleOpinionFilterChange({ sortBy, sortOrder }); }} style={styles.filterInput}><option value="created_at-DESC">新着順</option><option value="created_at-ASC">古い順</option><option value="grade-ASC">学年順 (昇順)</option><option value="grade-DESC">学年順 (降順)</option></select></div>
              <div style={styles.filterGroup}><input type="search" placeholder="意見を検索" value={opinionFilters.keyword} onChange={e => handleOpinionFilterChange({ keyword: e.target.value })} style={{...styles.filterInput, width: '200px'}} /></div>
              <button onClick={handleExportCSV} style={{...styles.button, ...styles.csvButton}}>CSV</button>
            </div>
          </div>
          
          {isLoading ? <p>読み込み中...</p> : error ? <p style={{ color: 'red' }}>エラー: {error}</p> : (
            <>
              <CollapsibleSection title="有効な意見一覧" defaultOpen={true}>
                <OpinionTable opinions={activeOpinions} onSoftDelete={(id: number) => handleOpinionAction(id, 'soft-delete', 'この意見を削除済みに移動しますか？')} />
                <PaginationControls pagination={activeOpinionPagination} onPageChange={page => setActiveOpinionPagination(p => ({...p, currentPage: page}))} />
              </CollapsibleSection>
              <CollapsibleSection title="削除済みの意見一覧" defaultOpen={false}>
                <OpinionTable opinions={deletedOpinions} onRestore={(id: number) => handleOpinionAction(id, 'restore', 'この意見を復元しますか？')} onHardDelete={(id: number) => handleOpinionAction(id, 'hard-delete', 'この意見を完全に削除します。よろしいですか？')} />
                <PaginationControls pagination={deletedOpinionPagination} onPageChange={page => setDeletedOpinionPagination(p => ({...p, currentPage: page}))} />
              </CollapsibleSection>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
