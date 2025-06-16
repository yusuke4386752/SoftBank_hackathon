/*
 * ファイルの場所: /app/ai-report/page.tsx
 * 役割: 分析テーマの初期選択をなくし、ユーザーが明示的に選択するようにUIを改善します。
 * ★★★ このファイルの内容を全て以下のコードに置き換えてください ★★★
 */
"use client";

import React, { useState, useEffect, FC, useCallback, ReactNode, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- 型定義 ---
interface Theme { id: number; theme_title: string; }
interface Opinion { id: number; opinion_text: string; grade: string; created_at: string; }
interface ReportSection { id: string; title: string; }
interface CategoryBreakdown { name: string; value: number; }
interface CategorySummary { category: string; summaries: { summary: string; count: number }[]; }
interface Keyword { keyword: string; count: number; }
interface MinorityOpinion { opinion: string; commentary: string; }
interface ReportData {
  categoryBreakdown: CategoryBreakdown[];
  categorySummaries: CategorySummary[];
  overallKeywords: Keyword[];
  notableMinorityOpinions: MinorityOpinion[];
}
interface ThemeFilters { keyword: string; sortBy: string; sortOrder: string; }


// --- スタイル定義 ---
const styles: { [key:string]: React.CSSProperties } = {
  container: { fontFamily: 'sans-serif', padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#333' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '0.5rem', marginBottom: '1.5rem' },
  title: { fontSize: '2rem', margin: 0 },
  backLink: { fontSize: '1rem', textDecoration: 'none', color: '#0070f3' },
  controlPanel: { padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '1rem' },
  controlRow: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  label: { fontWeight: 'bold', minWidth: '120px' },
  select: { padding: '0.5rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px', flex: 1 },
  input: { padding: '0.5rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px', flex: 1 },
  button: { padding: '0.75rem 1.5rem', fontSize: '1.1rem', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' },
  buttonGroup: { alignSelf: 'flex-end', display: 'flex', gap: '1rem' },
  disabledButton: { backgroundColor: '#ccc', cursor: 'not-allowed' },
  reportContainer: { display: 'flex', gap: '2rem', alignItems: 'flex-start' },
  toc: { width: '250px', flexShrink: 0, position: 'sticky', top: '2rem' },
  tocTitle: { marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' },
  tocList: { listStyle: 'none', padding: 0 },
  tocLink: { textDecoration: 'none', color: '#0070f3', display: 'block', padding: '0.5rem 0' },
  reportContent: { flex: 1, minWidth: 0 },
  statusMessage: { textAlign: 'center', fontSize: '1.2rem', padding: '4rem', backgroundColor: '#f9f9f9', borderRadius: '8px' },
  section: { marginBottom: '3rem', pageBreakInside: 'avoid' },
  sectionTitle: { fontSize: '1.8rem', borderBottom: '2px solid #0070f3', paddingBottom: '0.5rem', marginBottom: '1.5rem' },
  mindMapPlaceholder: { border: '2px dashed #ccc', padding: '1rem', borderRadius: '8px', backgroundColor: '#f9f9f9', marginBottom: '1rem' },
  mindMapLink: { color: '#0070f3', textDecoration: 'underline', cursor: 'pointer' },
  summaryList: { listStyle: 'none', padding: 0 },
  summaryItem: { marginBottom: '0.75rem' },
  minorityOpinionCard: { borderLeft: '4px solid #f59e0b', padding: '1rem', backgroundColor: '#fffbeb', marginBottom: '1rem' },
  modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '1rem', marginBottom: '1rem', flexShrink: 0 },
  modalBody: { flexGrow: 1, overflowY: 'auto' },
  modalFooter: { borderTop: '1px solid #ddd', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 },
  modalCloseButton: { border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' },
  modalTable: { width: '100%', borderCollapse: 'collapse' },
  modalTh: { border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' },
  modalTd: { border: '1px solid #ddd', padding: '8px', verticalAlign: 'top' },
};

// --- サブコンポーネント ---
const Modal: FC<{ isOpen: boolean, onClose: () => void, title: string, children: ReactNode, footer?: ReactNode }> = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;
    return (
        <div style={styles.modalBackdrop} onClick={onClose}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}><h2>{title}</h2><button onClick={onClose} style={styles.modalCloseButton}>&times;</button></div>
                <div style={styles.modalBody}>{children}</div>
                {footer && <div style={styles.modalFooter}>{footer}</div>}
            </div>
        </div>
    );
};

// --- メインページコンポーネント ---
export default function AiReportPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [themeFilters, setThemeFilters] = useState<ThemeFilters>({ keyword: '', sortBy: 'created_at', sortOrder: 'DESC' });
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const [selectedThemeTitle, setSelectedThemeTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; opinions: Opinion[] }>({ title: '', opinions: [] });
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reportContentRef = useRef<HTMLDivElement>(null);

  const tableOfContents: ReportSection[] = [
    { id: 'categorization', title: '1. 意見のカテゴリ分類' }, { id: 'summary', title: '2. カテゴリ別の意見要約' },
    { id: 'keywords', title: '3. 総合キーワードランキング' }, { id: 'minority', title: '4. 注目すべき少数意見' },
  ];
  
  const fetchThemes = useCallback(async () => {
    try {
        const params = new URLSearchParams({ status: 'active', fetchAll: 'true', ...themeFilters });
        const res = await fetch(`/api/themes?${params.toString()}`);
        if (!res.ok) throw new Error('テーマ一覧の取得に失敗しました。');
        const data = await res.json();
        setThemes(data.themes);
    } catch (err: any) { setError(err.message); }
  }, [themeFilters]);

  useEffect(() => {
    const loadScripts = () => {
        const jspdfScript = document.createElement('script');
        jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        jspdfScript.async = true;
        document.body.appendChild(jspdfScript);

        const html2canvasScript = document.createElement('script');
        html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        html2canvasScript.async = true;
        document.body.appendChild(html2canvasScript);
    };
    loadScripts();
    fetchThemes();
  }, [fetchThemes]);

  const handleGenerateReport = async () => {
    if (!selectedThemeId) { alert('分析テーマを選択してください。'); return; }
    setIsGenerating(true); setError(null); setReportData(null);
    try {
        const res = await fetch('/api/generate-fixed-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ themeId: selectedThemeId }) });
        if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.message || 'レポートの生成に失敗しました。'); }
        const data = await res.json();
        setReportData(data);
    } catch (err: any) { setError(err.message); } finally { setIsGenerating(false); }
  };
  
  const handleCategoryClick = async (categoryName: string) => {
    setIsModalLoading(true); setIsModalOpen(true);
    setModalData({ title: `「${categoryName}」の意見一覧`, opinions: [] });
    try {
      const res = await fetch(`/api/opinions-by-category?themeId=${selectedThemeId}&category=${encodeURIComponent(categoryName)}`);
      if (!res.ok) throw new Error('意見データの取得に失敗しました。');
      const result = await res.json();
      setModalData({ title: `「${categoryName}」の意見一覧 (${result.opinions.length}件)`, opinions: result.opinions });
    } catch (err: any) { alert(err.message); } finally { setIsModalLoading(false); }
  };

  const handleExportCategoryCsv = () => {
    const headers = ["ID", "学年", "意見内容", "投稿日時"];
    const rows = modalData.opinions.map(op => [op.id, op.grade, `"${op.opinion_text.replace(/"/g, '""')}"`, new Date(op.created_at).toLocaleString('ja-JP')].join(','));
    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `category_${modalData.title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleExportPdf = async () => {
      if (!reportContentRef.current || !(window as any).jspdf || !(window as any).html2canvas) {
          alert('PDFエクスポート機能の準備ができていません。少し待ってから再度お試しください。');
          return;
      }
      setIsExporting(true);
      try {
          const { jsPDF } = (window as any).jspdf;
          const canvas = await (window as any).html2canvas(reportContentRef.current, { scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [canvas.width, canvas.height] });
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`AI_Report_${selectedThemeTitle}.pdf`);
      } catch (err) {
          console.error("PDF export failed:", err);
          alert('PDFのエクスポートに失敗しました。');
      } finally {
          setIsExporting(false);
      }
  };
  
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalData.title} footer={<button onClick={handleExportCategoryCsv} style={styles.button}>CSVエクスポート</button>}>
        {isModalLoading ? <p>読み込み中...</p> : (
            <table style={styles.modalTable}>
                <thead><tr><th style={styles.modalTh}>学年</th><th style={styles.modalTh}>意見内容</th><th style={styles.modalTh}>投稿日時</th></tr></thead>
                <tbody>{modalData.opinions.map(op => (<tr key={op.id}><td style={styles.modalTd}>{op.grade}</td><td style={styles.modalTd}>{op.opinion_text}</td><td style={styles.modalTd}>{new Date(op.created_at).toLocaleString('ja-JP')}</td></tr>))}</tbody>
            </table>
        )}
      </Modal>

      <div style={styles.container}>
        <header style={styles.header}><h1 style={styles.title}>AI分析レポート</h1><a href="/" style={styles.backLink}>← メイン画面に戻る</a></header>
        <div style={styles.controlPanel}>
          <div style={styles.controlRow}>
            <label style={styles.label}>1. 分析テーマ:</label>
            <input type="search" placeholder="テーマを検索" value={themeFilters.keyword} onChange={e => setThemeFilters(p => ({...p, keyword: e.target.value}))} style={{...styles.input, flex: '0.5 1 auto'}} />
            <select value={`${themeFilters.sortBy}-${themeFilters.sortOrder}`} onChange={e => { const [sortBy, sortOrder] = e.target.value.split('-'); setThemeFilters(p => ({...p, sortBy, sortOrder})); }} style={styles.select}>
                <option value="created_at-DESC">新着順</option><option value="created_at-ASC">古い順</option><option value="theme_title-ASC">名前順</option>
            </select>
            {/* ★★★ 修正点 ★★★ */}
            <select value={selectedThemeId} onChange={(e) => { setSelectedThemeId(e.target.value); setSelectedThemeTitle(themes.find(t => t.id === Number(e.target.value))?.theme_title || '') }} style={{...styles.select, flex: 2}}>
                <option value="" disabled>-- テーマを選択してください --</option>
                {themes.map(theme => <option key={theme.id} value={theme.id}>{theme.theme_title}</option>)}
            </select>
          </div>
          <div style={styles.buttonGroup}>
            {reportData && <button onClick={handleExportPdf} disabled={isExporting} style={{...styles.button, backgroundColor: '#16a34a', ...(isExporting ? styles.disabledButton : {})}}>{isExporting ? 'PDF生成中...' : 'PDFエクスポート'}</button>}
            <button onClick={handleGenerateReport} disabled={isGenerating || !selectedThemeId} style={{...styles.button, ...((isGenerating || !selectedThemeId) ? styles.disabledButton : {})}}>{isGenerating ? 'レポートを生成中...' : 'レポートを生成'}</button>
          </div>
        </div>

        <div style={styles.reportContainer}>
          {reportData && (<aside style={styles.toc}><h3 style={styles.tocTitle}>目次</h3><ul style={styles.tocList}>{tableOfContents.map(section => (<li key={section.id}><a href={`#${section.id}`} style={styles.tocLink}>{section.title}</a></li>))}</ul></aside>)}
          <main style={styles.reportContent} ref={reportContentRef}>
            {!reportData && !isGenerating && !error && <p style={styles.statusMessage}>分析したいテーマを選択し、「レポートを生成」ボタンを押してください。</p>}
            {isGenerating && <p style={styles.statusMessage}>AIがレポートを生成中です。意見の数により数分かかる場合があります...</p>}
            {error && <p style={{...styles.statusMessage, color: 'red'}}>エラー: {error}</p>}
            {reportData && (
              <div>
                <section id="categorization" style={styles.section}>
                  <h2 style={styles.sectionTitle}>1. 意見のカテゴリ分類</h2>
                  <div style={styles.mindMapPlaceholder}>
                      <p>各カテゴリをクリックすると、関連する意見の一覧が表示されます。</p>
                      <ul>{reportData.categoryBreakdown.map(cat => (<li key={cat.name}><span onClick={() => handleCategoryClick(cat.name)} style={styles.mindMapLink}>{cat.name} ({cat.value}件)</span></li>))}</ul>
                  </div>
                  <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={reportData.categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{reportData.categoryBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
                </section>
                <section id="summary" style={styles.section}>
                  <h2 style={styles.sectionTitle}>2. カテゴリ別の意見要約</h2>
                  {reportData.categorySummaries.map(cat => (<div key={cat.category} style={{marginBottom: '1.5rem'}}><h3>{cat.category}</h3><ul style={styles.summaryList}>{cat.summaries.map((s, i) => <li key={i} style={styles.summaryItem}>・{s.summary} (意見数: {s.count})</li>)}</ul></div>))}
                </section>
                <section id="keywords" style={styles.section}>
                  <h2 style={styles.sectionTitle}>3. 総合キーワードランキング</h2>
                   <ResponsiveContainer width="100%" height={400}><BarChart data={reportData.overallKeywords} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="keyword" width={120} tick={{fontSize: 12}} /><Tooltip /><Bar dataKey="count" name="出現回数" fill="#8884d8" /></BarChart></ResponsiveContainer>
                </section>
                <section id="minority" style={styles.section}>
                  <h2 style={styles.sectionTitle}>4. 注目すべき少数意見</h2>
                  {reportData.notableMinorityOpinions.length > 0 ? (reportData.notableMinorityOpinions.map((item, i) => (<div key={i} style={styles.minorityOpinionCard}><p><strong>AIのコメント:</strong> {item.commentary}</p><hr style={{border: 'none', borderTop: '1px solid #fde047'}}/><p><em>{item.opinion}</em></p></div>))) : <p>特に注目すべき少数意見は見つかりませんでした。</p>}
                </section>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
