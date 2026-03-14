/**
 * AdminPage — Refactored orchestrator. Manages shared state and delegates
 * per-tab rendering to lazy-loaded tab components.
 */
import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useAuthStore, useDataStore, useAdminStore } from '@/store';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { Comment } from '@/db/database';
import { useTranslation } from '@/i18n';
import type { AdminTab, ContentView, AdminModal, ConfirmDelete, AnyItem } from './types/admin.types';

// ── Lazy tab imports ──────────────────────────────────────────────────────────
const OverviewTab   = React.lazy(() => import('./tabs/OverviewTab').then(m => ({ default: m.OverviewTab })));
const SectionsTab   = React.lazy(() => import('./tabs/SectionsTab').then(m => ({ default: m.SectionsTab })));
const LessonsTab    = React.lazy(() => import('./tabs/LessonsTab').then(m => ({ default: m.LessonsTab })));
const QuestionsTab  = React.lazy(() => import('./tabs/QuestionsTab').then(m => ({ default: m.QuestionsTab })));
const SignsTab      = React.lazy(() => import('./tabs/SignsTab').then(m => ({ default: m.SignsTab })));
const DictionaryTab = React.lazy(() => import('./tabs/DictionaryTab').then(m => ({ default: m.DictionaryTab })));
const UsersTab      = React.lazy(() => import('./tabs/UsersTab').then(m => ({ default: m.UsersTab })));
const PostsTab      = React.lazy(() => import('./tabs/PostsTab').then(m => ({ default: m.PostsTab })));
const CommentsTab   = React.lazy(() => import('./tabs/CommentsTab').then(m => ({ default: m.CommentsTab })));
const ReportsTab    = React.lazy(() => import('./tabs/ReportsTab').then(m => ({ default: m.ReportsTab })));
const LogsTab       = React.lazy(() => import('./tabs/LogsTab').then(m => ({ default: m.LogsTab })));
const AnalyticsTab  = React.lazy(() => import('./tabs/AnalyticsTab').then(m => ({ default: m.AnalyticsTab })));
const LanguagesTab  = React.lazy(() => import('./tabs/LanguagesTab').then(m => ({ default: m.LanguagesTab })));
const MediaTab      = React.lazy(() => import('./tabs/MediaTab').then(m => ({ default: m.MediaTab })));

// ── Fallback spinner ──────────────────────────────────────────────────────────
function TabFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────────
type TabConfig = { id: AdminTab; icon: string; labelKey: string; permKey?: string };
const ALL_TAB_CONFIGS: TabConfig[] = [
  { id: 'overview',    icon: 'dashboard',    labelKey: 'admin.tab_overview',    permKey: 'overview'    },
  { id: 'sections',   icon: 'folder',       labelKey: 'admin.tab_sections',    permKey: 'sections'    },
  { id: 'lessons',    icon: 'school',       labelKey: 'admin.tab_lessons',     permKey: 'lessons'     },
  { id: 'questions',  icon: 'quiz',         labelKey: 'admin.tab_questions',   permKey: 'questions'   },
  { id: 'signs',      icon: 'traffic',      labelKey: 'admin.tab_signs',       permKey: 'signs'       },
  { id: 'dictionary', icon: 'menu_book',    labelKey: 'admin.tab_dictionary',  permKey: 'dictionary'  },
  { id: 'users',      icon: 'group',        labelKey: 'admin.tab_users',       permKey: 'users'       },
  { id: 'posts',      icon: 'forum',        labelKey: 'admin.tab_posts',       permKey: 'posts'       },
  { id: 'comments',   icon: 'chat_bubble',  labelKey: 'admin.tab_comments',    permKey: 'comments'    },
  { id: 'reports',    icon: 'flag',         labelKey: 'admin.tab_reports',     permKey: 'reports'     },
  { id: 'logs',       icon: 'history',      labelKey: 'admin.tab_logs',        permKey: 'logs'        },
  { id: 'analytics',  icon: 'analytics',    labelKey: 'admin.tab_analytics',   permKey: 'analytics'   },
  { id: 'languages',  icon: 'translate',    labelKey: 'admin.tab_languages'                           },
  { id: 'media',      icon: 'perm_media',   labelKey: 'admin.tab_media'                               },
];

export function AdminPage() {
  const auth  = useAuthStore();
  const data  = useDataStore();
  const admin = useAdminStore();

  // Convenience alias — posts live in useDataStore
  const posts = data.posts;
  const { t } = useTranslation();

  // ── Tab state ───────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<AdminTab>('overview');

  // ── Shared CRUD state (used by content tabs + modal) ───────────────────────
  const [modal, setModal]         = useState<AdminModal | null>(null);
  const [form, setForm]           = useState<Record<string, unknown>>({});
  const [confirmDel, setConfirmDel] = useState<ConfirmDelete | null>(null);
  const [search, setSearch]       = useState('');
  const [contentView, setContentView] = useState<ContentView>('active');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const savedRangeRef = useRef<Range | null>(null);

  // ── Filter state ────────────────────────────────────────────────────────────
  const [filterSectionId, setFilterSectionId]       = useState('');
  const [filterSignCategory, setFilterSignCategory] = useState('');
  const [filterDictSectionId, setFilterDictSectionId] = useState('');

  // ── Media picker state ──────────────────────────────────────────────────────
  const [mediaPicker, setMediaPicker]               = useState<{ field: string; squareSize?: number } | null>(null);
  const [mediaPickerSearch, setMediaPickerSearch]   = useState('');
  const [mediaPickerFilter, setMediaPickerFilter]   = useState<'all' | 'sections' | 'lessons' | 'signs' | 'questions'>('all');

  // ── Comments state (loaded on demand) ──────────────────────────────────────
  const [allComments, setAllComments] = useState<(Comment & { postContent?: string })[]>([]);

  // ── Auth / permissions ──────────────────────────────────────────────────────
  const userPerms: string[] = (auth.user as Record<string, unknown>)?.permissions as string[] || [];
  const isFullAdmin = auth.user?.role === 'admin';
  const visibleTabs = ALL_TAB_CONFIGS.filter(cfg => {
    if (isFullAdmin) return true;
    if (!cfg.permKey) return true;
    return userPerms.includes(cfg.permKey);
  });

  // ── Initial data load ───────────────────────────────────────────────────────
  useEffect(() => {
    admin.loadAdminStats();
    admin.loadAdminContent();
    admin.loadAdminUsers();
    admin.loadAdminReports();
    admin.loadAdminLogs();
    admin.loadDeletedPosts();
    admin.loadDeletedComments();
    admin.loadDeletedUsers();
    data.loadPosts();
    data.loadSections();
    data.loadLessons();
    data.loadQuestions();
    data.loadSigns();
    data.loadSignSections();
    data.loadDictSections();
    data.loadDictEntries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reset shared state on tab change ───────────────────────────────────────
  useEffect(() => {
    if (tab === 'logs') admin.loadAdminLogs();
    setSelectedIds(new Set());
    setContentView('active');
    setFilterSectionId('');
    setFilterSignCategory('');
    setFilterDictSectionId('');
    setSearch('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ── Load comments when needed ───────────────────────────────────────────────
  useEffect(() => {
    if (tab === 'comments' || tab === 'reports') loadAllComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, posts]);

  // ── Redirect manager away from overview if no perm ─────────────────────────
  useEffect(() => {
    if (!isFullAdmin && tab === 'overview' && !userPerms.includes('overview')) {
      const first = ALL_TAB_CONFIGS.find(cfg => !cfg.permKey || userPerms.includes(cfg.permKey || ''));
      if (first) setTab(first.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const loadAllComments = async () => {
    const comments: (Comment & { postContent?: string })[] = [];
    for (const post of posts) {
      const pc = await data.getComments(post.id);
      for (const c of pc) comments.push({ ...c, postContent: post.content.substring(0, 60) });
    }
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setAllComments(comments);
  };

  const handleExport = async (storeName: string) => {
    const d = await admin.exportData(storeName);
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${storeName}.json`; a.click();
  };

  const handleImport = (storeName: string) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const parsed = JSON.parse(text);
      const count = await admin.importData(storeName, parsed);
      alert(t('admin.import_success') + ' ' + count + ' ' + t('admin.records'));
      data.loadSections(); data.loadLessons(); data.loadQuestions();
      data.loadSigns(); data.loadDictSections(); data.loadDictEntries();
    };
    input.click();
  };

  const resizeImageToSquare = (dataUrl: string, size: number): Promise<string> =>
    new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const scale = Math.max(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = dataUrl;
    });

  const handleImageUpload = (field: string, squareSize?: number) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const raw = reader.result as string;
        const result = squareSize ? await resizeImageToSquare(raw, squareSize) : raw;
        setForm(prev => ({ ...prev, [field]: result }));
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleImageUploadDirect = (squareSize?: number): Promise<string | null> =>
    new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = async () => {
          const raw = reader.result as string;
          resolve(squareSize ? await resizeImageToSquare(raw, squareSize) : raw);
        };
        reader.readAsDataURL(file);
      };
      input.oncancel = () => resolve(null);
      input.click();
    });

  const collectAllMedia = () => {
    type MI = { src: string; label: string; source: 'sections' | 'lessons' | 'signs' | 'questions'; id: string };
    const items: MI[] = [];
    for (const s of admin.allSections) if (s.image) items.push({ src: s.image, label: s.nameAr || s.nameIt, source: 'sections', id: s.id });
    for (const l of admin.allLessons)  if (l.image) items.push({ src: l.image, label: l.titleAr || l.titleIt, source: 'lessons', id: l.id });
    for (const sg of admin.allSigns)   if (sg.image) items.push({ src: sg.image, label: sg.nameAr || sg.nameIt, source: 'signs', id: sg.id });
    for (const q of admin.allQuestions) if (q.image) items.push({ src: q.image, label: (q.questionAr || q.questionIt || '').substring(0, 40), source: 'questions', id: q.id });
    const seen = new Set<string>();
    return items.filter(i => { if (seen.has(i.src)) return false; seen.add(i.src); return true; });
  };

  // ── Form save ────────────────────────────────────────────────────────────────
  const saveItem = async () => {
    if (!modal) return;
    const { type, data: d } = modal;
    const isEdit = !!d?.id;
    let ok = false;
    switch (type) {
      case 'section':     ok = isEdit ? await admin.updateSection(d!.id as string, form as never)    : await admin.createSection(form as never); break;
      case 'lesson':      ok = isEdit ? await admin.updateLesson(d!.id as string, form as never)     : await admin.createLesson(form as never); break;
      case 'question':    ok = isEdit ? await admin.updateQuestion(d!.id as string, form as never)   : await admin.createQuestion(form as never); break;
      case 'sign':        ok = isEdit ? await admin.updateSign(d!.id as string, form as never)       : await admin.createSign(form as never); break;
      case 'signSection': ok = isEdit ? await admin.updateSignSection(d!.id as string, form as never): await admin.createSignSection(form as never); break;
      case 'dictSection': ok = isEdit ? await admin.updateDictSection(d!.id as string, form as never): await admin.createDictSection(form as never); break;
      case 'dictEntry':   ok = isEdit ? await admin.updateDictEntry(d!.id as string, form as never)  : await admin.createDictEntry(form as never); break;
    }
    if (ok) setModal(null);
  };

  // ── Delete handler ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDel) return;
    const { type, id } = confirmDel;
    switch (type) {
      case 'section':              await admin.deleteSection(id); break;
      case 'section-permanent':    await admin.permanentDeleteSection(id); break;
      case 'lesson':               await admin.deleteLesson(id); break;
      case 'lesson-permanent':     await admin.permanentDeleteLesson(id); break;
      case 'question':             await admin.deleteQuestion(id); break;
      case 'question-permanent':   await admin.permanentDeleteQuestion(id); break;
      case 'sign':                 await admin.deleteSign(id); break;
      case 'sign-permanent':       await admin.permanentDeleteSign(id); break;
      case 'signSection':          await admin.deleteSignSection(id); break;
      case 'signSection-permanent':await admin.permanentDeleteSignSection(id); break;
      case 'dictSection':          await admin.deleteDictSection(id); break;
      case 'dictSection-permanent':await admin.permanentDeleteDictSection(id); break;
      case 'dictEntry':            await admin.deleteDictEntry(id); break;
      case 'dictEntry-permanent':  await admin.permanentDeleteDictEntry(id); break;
      case 'user':                 await admin.deleteUser(id); break;
      case 'user-permanent':       await admin.permanentDeleteUser(id); break;
      case 'post':                 await admin.adminDeletePost(id); break;
      case 'post-permanent':       await admin.permanentDeletePost(id); break;
      case 'comment':              await admin.adminDeleteComment(id); await loadAllComments(); break;
      case 'comment-permanent':    await admin.permanentDeleteComment(id); break;
    }
    setConfirmDel(null);
  };

  // ── renderInput ──────────────────────────────────────────────────────────────
  const renderInput = (label: string, field: string, type = 'text') => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-surface-700 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea className="w-full border border-surface-200 rounded-xl p-3 text-sm resize-none" rows={3}
          value={(form[field] as string) || ''}
          onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))} />
      ) : type === 'boolean' ? (
        <select className="w-full border border-surface-200 rounded-xl p-3 text-sm"
          value={String(form[field] || false)}
          onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value === 'true' }))}>
          <option value="true">{t('admin.answer_true_label')}</option>
          <option value="false">{t('admin.answer_false_label')}</option>
        </select>
      ) : type === 'select-difficulty' ? (
        <select className="w-full border border-surface-200 rounded-xl p-3 text-sm"
          value={(form[field] as string) || 'easy'}
          onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}>
          <option value="easy">{t('admin.diff_easy')}</option>
          <option value="medium">{t('admin.diff_medium')}</option>
          <option value="hard">{t('admin.diff_hard')}</option>
        </select>
      ) : type === 'select-section' ? (
        <select className="w-full border border-surface-200 rounded-xl p-3 text-sm"
          value={(form[field] as string) || ''}
          onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}>
          <option value="">{t('admin.select_section')}</option>
          {data.sections.map(s => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
        </select>
      ) : type === 'select-lesson' ? (
        <select className="w-full border border-surface-200 rounded-xl p-3 text-sm"
          value={(form[field] as string) || ''}
          onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}>
          <option value="">{t('admin.select_lesson')}</option>
          {data.lessons.map(l => <option key={l.id} value={l.id}>{l.titleAr}</option>)}
        </select>
      ) : type === 'select-dict-section' ? (
        <select className="w-full border border-surface-200 rounded-xl p-3 text-sm"
          value={(form[field] as string) || ''}
          onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}>
          <option value="">{t('admin.select_section')}</option>
          {data.dictSections.map(s => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
        </select>
      ) : type === 'select-sign-section' ? (
        <select className="w-full border border-surface-200 rounded-xl p-3 text-sm"
          value={(form[field] as string) || ''}
          onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}>
          <option value="">{t('admin.no_section')}</option>
          {data.signSections.filter(s => !s.status || s.status === 'active').map(s => (
            <option key={s.id} value={s.id}>{s.nameAr}</option>
          ))}
        </select>
      ) : type === 'richtext' ? (
        <div className="border border-surface-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-1 p-1.5 bg-surface-50 border-b border-surface-200 flex-wrap">
            {[
              { cmd: 'bold', icon: 'B', title: 'عريض', style: 'font-bold' },
              { cmd: 'italic', icon: 'I', title: 'مائل', style: 'italic' },
              { cmd: 'underline', icon: 'U', title: 'تحت خط', style: 'underline' },
              { cmd: 'strikeThrough', icon: 'S̶', title: 'فوق خط', style: '' },
            ].map(b => (
              <button key={b.cmd} type="button" title={b.title}
                onMouseDown={e => { e.preventDefault(); document.execCommand(b.cmd); }}
                className={`px-2 py-0.5 text-xs rounded border border-surface-200 hover:bg-white ${b.style}`}>
                {b.icon}
              </button>
            ))}
            <div className="w-px h-4 bg-surface-200 mx-0.5" />
            {['H2','H3','H4'].map((h, i) => (
              <button key={h} type="button" title={h}
                onMouseDown={e => { e.preventDefault(); document.execCommand('formatBlock', false, ['h2','h3','h4'][i]); }}
                className="px-2 py-0.5 text-xs rounded border border-surface-200 hover:bg-white font-bold">
                {h}
              </button>
            ))}
            <button type="button" title="نص عادي"
              onMouseDown={e => { e.preventDefault(); document.execCommand('formatBlock', false, 'p'); }}
              className="px-2 py-0.5 text-xs rounded border border-surface-200 hover:bg-white">P</button>
            <div className="w-px h-4 bg-surface-200 mx-0.5" />
            <select title="حجم الخط"
              className="text-xs border border-surface-200 rounded px-1 py-0.5 bg-white cursor-pointer"
              onMouseDown={e => e.stopPropagation()}
              onChange={e => {
                e.preventDefault();
                const sel = window.getSelection();
                if (savedRangeRef.current && sel) { sel.removeAllRanges(); sel.addRange(savedRangeRef.current); }
                document.execCommand('fontSize', false, e.target.value);
                e.target.value = '';
              }}>
              <option value="">{t('admin.font_size')}</option>
              <option value="1">{t('admin.font_very_small')}</option>
              <option value="2">{t('admin.font_small')}</option>
              <option value="3">{t('admin.font_normal')}</option>
              <option value="4">{t('admin.font_large')}</option>
              <option value="5">{t('admin.font_very_large')}</option>
              <option value="6">{t('admin.font_huge')}</option>
              <option value="7">{t('admin.font_very_huge')}</option>
            </select>
            <label title="لون النص" className="flex items-center gap-1 cursor-pointer">
              <span className="text-xs border border-surface-200 rounded px-1.5 py-0.5 bg-white">A</span>
              <input type="color" className="w-5 h-5 p-0 border-0 rounded cursor-pointer"
                onMouseDown={() => {
                  const sel = window.getSelection();
                  if (sel && sel.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
                }}
                onChange={e => {
                  const sel = window.getSelection();
                  if (savedRangeRef.current && sel) { sel.removeAllRanges(); sel.addRange(savedRangeRef.current); }
                  document.execCommand('foreColor', false, e.target.value);
                }} />
            </label>
            <div className="w-px h-4 bg-surface-200 mx-0.5" />
            <button type="button" title="مسح التنسيق"
              onMouseDown={e => { e.preventDefault(); document.execCommand('removeFormat'); }}
              className="px-2 py-0.5 text-xs rounded border border-surface-200 hover:bg-white text-surface-400">✕</button>
          </div>
          <div
            className="w-full p-3 text-sm min-h-[100px] focus:outline-none"
            contentEditable suppressContentEditableWarning
            dir={field.includes('It') ? 'ltr' : 'rtl'}
            dangerouslySetInnerHTML={{ __html: (form[field] as string) || '' }}
            onInput={e => setForm(prev => ({ ...prev, [field]: (e.target as HTMLDivElement).innerHTML }))}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.execCommand('insertLineBreak'); } }}
          />
        </div>
      ) : type === 'number' ? (
        <input type="number" className="w-full border border-surface-200 rounded-xl p-3 text-sm"
          value={(form[field] as number) || 0}
          onChange={e => setForm(prev => ({ ...prev, [field]: parseInt(e.target.value) || 0 }))} />
      ) : type === 'image' || type === 'image-square' ? (
        <div>
          <div className="flex gap-2 flex-wrap">
            <button
              className="px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm hover:bg-primary-100 flex items-center gap-1.5 text-primary-700 font-medium transition-colors"
              onClick={() => { setMediaPickerSearch(''); setMediaPickerFilter('all'); setMediaPicker({ field, squareSize: type === 'image-square' ? 1024 : undefined }); }}>
              <Icon name="photo_library" size={16} /> {t('admin.from_library')}
            </button>
            <button
              className="px-3 py-2 bg-surface-100 rounded-lg text-sm hover:bg-surface-200 flex items-center gap-1.5 transition-colors"
              onClick={() => handleImageUpload(field, type === 'image-square' ? 1024 : undefined)}>
              <Icon name="upload" size={16} /> {t('admin.upload_image')}
            </button>
          </div>
          <div className="mt-2 flex gap-2 items-center">
            <input type="url"
              className="flex-1 border border-surface-200 rounded-lg px-3 py-1.5 text-sm"
              placeholder={t('admin.image_url_placeholder')}
              value={(form[field] as string)?.startsWith('http') ? (form[field] as string) : ''}
              onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
            />
          </div>
          {form[field] ? (
            <div className="mt-2 flex items-start gap-2">
              <img src={form[field] as string} alt=""
                className={cn('rounded-lg object-cover', type === 'image-square' ? 'w-24 h-24' : 'w-20 h-20')} />
              <button type="button" title="حذف الصورة"
                onClick={() => setForm(prev => ({ ...prev, [field]: '' }))}
                className="p-1.5 text-danger-500 hover:bg-danger-50 rounded-lg border border-danger-200 transition-colors">
                <Icon name="delete" size={16} />
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <input type={type} className="w-full border border-surface-200 rounded-xl p-3 text-sm"
          value={(form[field] as string) || ''}
          onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))} />
      )}
    </div>
  );

  // ── No permissions guard ──────────────────────────────────────────────────────
  if (!isFullAdmin && userPerms.length === 0) {
    return (
      <div className="max-w-sm mx-auto text-center py-20">
        <div className="bg-white rounded-2xl p-8 border border-surface-100 shadow-sm">
          <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="lock" size={32} className="text-surface-400" />
          </div>
          <h2 className="text-lg font-bold text-surface-800 mb-2">{t('admin.no_perms_title')}</h2>
          <p className="text-sm text-surface-500 leading-relaxed">{t('admin.no_perms_desc')}</p>
        </div>
      </div>
    );
  }

  // ── Common bulk handlers for content tabs ─────────────────────────────────────
  const clearSelected = () => setSelectedIds(new Set());

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 mb-1">{t('admin.page_title')}</h1>
        <p className="text-sm text-surface-400">{t('admin.page_subtitle')}</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
        {visibleTabs.map(cfg => (
          <button key={cfg.id}
            className={cn('shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
              tab === cfg.id ? 'bg-primary-500 text-white' : 'bg-white text-surface-600 border border-surface-200 hover:border-primary-200')}
            onClick={() => setTab(cfg.id)}>
            <Icon name={cfg.icon} size={16} />
            {t(cfg.labelKey)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Suspense fallback={<TabFallback />}>
        {tab === 'overview' && admin.adminStats && (
          <OverviewTab
            adminStats={admin.adminStats}
            adminUsers={admin.adminUsers as AnyItem[]}
            adminReports={admin.adminReports as AnyItem[]}
            adminLogs={admin.adminLogs as AnyItem[]}
            allDictSections={admin.allDictSections as AnyItem[]}
            allDictEntries={admin.allDictEntries as AnyItem[]}
            isFullAdmin={isFullAdmin}
            userPerms={userPerms}
            allTabsConfig={ALL_TAB_CONFIGS}
            onNavigateTab={setTab}
          />
        )}

        {tab === 'sections' && (
          <SectionsTab
            allSections={admin.allSections as AnyItem[]}
            contentView={contentView} setContentView={setContentView}
            search={search} setSearch={setSearch}
            selectedIds={selectedIds} setSelectedIds={setSelectedIds}
            onAdd={() => {
              setForm({ nameAr: '', nameIt: '', descriptionAr: '', descriptionIt: '', icon: 'school', color: '#3b82f6', image: '', order: admin.allSections.length + 1 });
              setModal({ type: 'section' });
            }}
            onEdit={(item) => { setForm(item); setModal({ type: 'section', data: item }); }}
            onDelete={(id) => setConfirmDel({ type: 'section', id })}
            onPermanentDelete={(id) => setConfirmDel({ type: 'section-permanent', id })}
            onArchive={(id, archive) => admin.archiveSection(id, archive)}
            onRestore={(id) => admin.restoreSection(id)}
            onBulkDelete={async (ids) => { for (const id of ids) await admin.deleteSection(id); clearSelected(); }}
            onBulkPermanentDelete={async (ids) => { for (const id of ids) await admin.permanentDeleteSection(id); clearSelected(); }}
            onBulkArchive={async (ids) => { for (const id of ids) await admin.archiveSection(id, true); clearSelected(); }}
            onBulkRestore={async (ids) => { for (const id of ids) await admin.restoreSection(id); clearSelected(); }}
            onExport={() => handleExport('sections')}
            onImport={() => handleImport('sections')}
          />
        )}

        {tab === 'lessons' && (
          <LessonsTab
            allLessons={admin.allLessons as AnyItem[]}
            allSections={admin.allSections as AnyItem[]}
            contentView={contentView} setContentView={setContentView}
            search={search} setSearch={setSearch}
            selectedIds={selectedIds} setSelectedIds={setSelectedIds}
            filterSectionId={filterSectionId} setFilterSectionId={setFilterSectionId}
            onAdd={() => {
              setForm({ sectionId: filterSectionId || '', titleAr: '', titleIt: '', contentAr: '', contentIt: '', image: '', order: admin.allLessons.length + 1 });
              setModal({ type: 'lesson' });
            }}
            onEdit={(item) => { setForm(item); setModal({ type: 'lesson', data: item }); }}
            onDelete={(id) => setConfirmDel({ type: 'lesson', id })}
            onPermanentDelete={(id) => setConfirmDel({ type: 'lesson-permanent', id })}
            onArchive={(id, archive) => admin.archiveLesson(id, archive)}
            onRestore={(id) => admin.restoreLesson(id)}
            onBulkDelete={async (ids) => { for (const id of ids) await admin.deleteLesson(id); clearSelected(); }}
            onBulkPermanentDelete={async (ids) => { for (const id of ids) await admin.permanentDeleteLesson(id); clearSelected(); }}
            onBulkArchive={async (ids) => { for (const id of ids) await admin.archiveLesson(id, true); clearSelected(); }}
            onBulkRestore={async (ids) => { for (const id of ids) await admin.restoreLesson(id); clearSelected(); }}
            onExport={() => handleExport('lessons')}
            onImport={() => handleImport('lessons')}
          />
        )}

        {tab === 'questions' && (
          <QuestionsTab
            allQuestions={admin.allQuestions as AnyItem[]}
            allSections={admin.allSections as AnyItem[]}
            allLessons={admin.allLessons as AnyItem[]}
            contentView={contentView} setContentView={setContentView}
            search={search} setSearch={setSearch}
            selectedIds={selectedIds} setSelectedIds={setSelectedIds}
            filterSectionId={filterSectionId} setFilterSectionId={setFilterSectionId}
            onAdd={() => {
              setForm({ lessonId: '', sectionId: filterSectionId || '', questionAr: '', questionIt: '', isTrue: true, explanationAr: '', explanationIt: '', difficulty: 'easy', image: '', order: admin.allQuestions.length + 1 });
              setModal({ type: 'question' });
            }}
            onEdit={(item) => { setForm(item); setModal({ type: 'question', data: item }); }}
            onDelete={(id) => setConfirmDel({ type: 'question', id })}
            onPermanentDelete={(id) => setConfirmDel({ type: 'question-permanent', id })}
            onArchive={(id, archive) => admin.archiveQuestion(id, archive)}
            onRestore={(id) => admin.restoreQuestion(id)}
            onBulkDelete={async (ids) => { await admin.bulkDeleteQuestions(ids); clearSelected(); return true; }}
            onBulkPermanentDelete={async (ids) => { await admin.bulkPermanentDeleteQuestions(ids); clearSelected(); return true; }}
            onBulkArchive={async (ids, archive) => { await admin.bulkArchiveQuestions(ids, archive); clearSelected(); return true; }}
            onBulkRestore={async (ids) => { await admin.bulkRestoreQuestions(ids); clearSelected(); return true; }}
            onExport={() => handleExport('questions')}
            onImport={() => handleImport('questions')}
          />
        )}

        {tab === 'signs' && (
          <SignsTab
            allSigns={admin.allSigns as AnyItem[]}
            allSignSections={admin.allSignSections as AnyItem[]}
            contentView={contentView} setContentView={setContentView}
            search={search} setSearch={setSearch}
            selectedIds={selectedIds} setSelectedIds={setSelectedIds}
            filterSignCategory={filterSignCategory} setFilterSignCategory={setFilterSignCategory}
            // Sign CRUD
            onAddSign={() => {
              setForm({ nameAr: '', nameIt: '', descriptionAr: '', descriptionIt: '', sectionId: filterSignCategory || '', category: 'pericolo', image: '', order: admin.allSigns.length + 1 });
              setModal({ type: 'sign' });
            }}
            onEditSign={(item) => { setForm(item); setModal({ type: 'sign', data: item }); }}
            onDeleteSign={(id) => setConfirmDel({ type: 'sign', id })}
            onPermanentDeleteSign={(id) => setConfirmDel({ type: 'sign-permanent', id })}
            onArchiveSign={(id, archive) => admin.archiveSign(id, archive)}
            onRestoreSign={(id) => admin.restoreSign(id)}
            onBulkDeleteSign={async (ids) => { for (const id of ids) await admin.deleteSign(id); clearSelected(); }}
            onBulkPermanentDeleteSign={async (ids) => { for (const id of ids) await admin.permanentDeleteSign(id); clearSelected(); }}
            onBulkArchiveSign={async (ids) => { for (const id of ids) await admin.archiveSign(id, true); clearSelected(); }}
            onBulkRestoreSign={async (ids) => { for (const id of ids) await admin.restoreSign(id); clearSelected(); }}
            onExportSigns={() => handleExport('signs')}
            onImportSigns={() => handleImport('signs')}
            // SignSection CRUD
            onAddSignSection={() => {
              setForm({ nameAr: '', nameIt: '', icon: 'traffic', order: admin.allSignSections.length + 1 });
              setModal({ type: 'signSection' });
            }}
            onEditSignSection={(item) => { setForm(item); setModal({ type: 'signSection', data: item }); }}
            onDeleteSignSection={(id) => setConfirmDel({ type: 'signSection', id })}
            onPermanentDeleteSignSection={(id) => setConfirmDel({ type: 'signSection-permanent', id })}
            onArchiveSignSection={(id, archive) => admin.archiveSignSection(id, archive)}
            onRestoreSignSection={(id) => admin.restoreSignSection(id)}
            onBulkDeleteSignSection={async (ids) => { for (const id of ids) await admin.deleteSignSection(id); clearSelected(); }}
            onBulkPermanentDeleteSignSection={async (ids) => { for (const id of ids) await admin.permanentDeleteSignSection(id); clearSelected(); }}
            onBulkArchiveSignSection={async (ids) => { for (const id of ids) await admin.archiveSignSection(id, true); clearSelected(); }}
            onBulkRestoreSignSection={async (ids) => { for (const id of ids) await admin.restoreSignSection(id); clearSelected(); }}
          />
        )}

        {tab === 'dictionary' && (
          <DictionaryTab
            allDictSections={admin.allDictSections as AnyItem[]}
            allDictEntries={admin.allDictEntries as AnyItem[]}
            contentView={contentView} setContentView={setContentView}
            search={search} setSearch={setSearch}
            selectedIds={selectedIds} setSelectedIds={setSelectedIds}
            filterDictSectionId={filterDictSectionId} setFilterDictSectionId={setFilterDictSectionId}
            // DictSection CRUD
            onAddDictSection={() => {
              setForm({ nameAr: '', nameIt: '', icon: 'menu_book', order: admin.allDictSections.length + 1 });
              setModal({ type: 'dictSection' });
            }}
            onEditDictSection={(item) => { setForm(item); setModal({ type: 'dictSection', data: item }); }}
            onDeleteDictSection={(id) => setConfirmDel({ type: 'dictSection', id })}
            onPermanentDeleteDictSection={(id) => setConfirmDel({ type: 'dictSection-permanent', id })}
            onArchiveDictSection={(id, archive) => admin.archiveDictSection(id, archive)}
            onRestoreDictSection={(id) => admin.restoreDictSection(id)}
            onBulkDeleteDictSection={async (ids) => { for (const id of ids) await admin.deleteDictSection(id); clearSelected(); }}
            onBulkPermanentDeleteDictSection={async (ids) => { for (const id of ids) await admin.permanentDeleteDictSection(id); clearSelected(); }}
            onBulkArchiveDictSection={async (ids) => { for (const id of ids) await admin.archiveDictSection(id, true); clearSelected(); }}
            onBulkRestoreDictSection={async (ids) => { for (const id of ids) await admin.restoreDictSection(id); clearSelected(); }}
            onExportDictSections={() => handleExport('dictionarySections')}
            onImportDictSections={() => handleImport('dictionarySections')}
            // DictEntry CRUD
            onAddDictEntry={() => {
              setForm({ sectionId: '', termIt: '', termAr: '', definitionIt: '', definitionAr: '', order: admin.allDictEntries.length + 1 });
              setModal({ type: 'dictEntry' });
            }}
            onEditDictEntry={(item) => { setForm(item); setModal({ type: 'dictEntry', data: item }); }}
            onDeleteDictEntry={(id) => setConfirmDel({ type: 'dictEntry', id })}
            onPermanentDeleteDictEntry={(id) => setConfirmDel({ type: 'dictEntry-permanent', id })}
            onArchiveDictEntry={(id, archive) => admin.archiveDictEntry(id, archive)}
            onRestoreDictEntry={(id) => admin.restoreDictEntry(id)}
            onBulkDeleteDictEntry={async (ids) => { for (const id of ids) await admin.deleteDictEntry(id); clearSelected(); }}
            onBulkPermanentDeleteDictEntry={async (ids) => { for (const id of ids) await admin.permanentDeleteDictEntry(id); clearSelected(); }}
            onBulkArchiveDictEntry={async (ids) => { for (const id of ids) await admin.archiveDictEntry(id, true); clearSelected(); }}
            onBulkRestoreDictEntry={async (ids) => { for (const id of ids) await admin.restoreDictEntry(id); clearSelected(); }}
            onExportDictEntries={() => handleExport('dictionaryEntries')}
            onImportDictEntries={() => handleImport('dictionaryEntries')}
          />
        )}

        {tab === 'users' && (
          <UsersTab
            adminUsers={admin.adminUsers as AnyItem[]}
            deletedUsers={admin.deletedUsers as AnyItem[]}
            search={search} setSearch={setSearch}
            banUser={(id, banned) => admin.banUser(id, banned)}
            deleteUser={(id) => admin.deleteUser(id)}
            restoreUser={(id) => admin.restoreUser(id)}
            permanentDeleteUser={(id) => admin.permanentDeleteUser(id)}
            setCommunityRestrictions={(id, r) => admin.setCommunityRestrictions(id, r)}
            loadAdminUsers={() => admin.loadAdminUsers()}
            setConfirmDel={setConfirmDel}
          />
        )}

        {tab === 'posts' && (
          <PostsTab
            posts={posts as AnyItem[]}
            deletedPosts={admin.deletedPosts as AnyItem[]}
            search={search} setSearch={setSearch}
            adminDeletePost={(id) => admin.adminDeletePost(id)}
            restorePost={(id) => admin.restorePost(id)}
            setConfirmDel={setConfirmDel}
          />
        )}

        {tab === 'comments' && (
          <CommentsTab
            allComments={allComments}
            deletedComments={admin.deletedComments as AnyItem[]}
            search={search} setSearch={setSearch}
            restoreComment={(id) => admin.restoreComment(id)}
            setConfirmDel={setConfirmDel}
          />
        )}

        {tab === 'reports' && (
          <ReportsTab
            adminReports={admin.adminReports as AnyItem[]}
            adminUsers={admin.adminUsers as AnyItem[]}
            posts={posts as AnyItem[]}
            allComments={allComments}
            search={search} setSearch={setSearch}
            updateReport={(id, status) => admin.updateReport(id, status)}
          />
        )}

        {tab === 'logs' && (
          <LogsTab
            adminLogs={admin.adminLogs as AnyItem[]}
            adminUsers={admin.adminUsers as AnyItem[]}
            search={search} setSearch={setSearch}
            deleteAdminLogsByDateRange={(from, to) => admin.deleteAdminLogsByDateRange(from, to)}
          />
        )}

        {tab === 'analytics' && (
          <AnalyticsTab
            adminUsers={admin.adminUsers as AnyItem[]}
            adminStats={admin.adminStats}
            posts={posts as AnyItem[]}
          />
        )}

        {tab === 'languages' && <LanguagesTab />}

        {tab === 'media' && (
          <MediaTab
            allSections={admin.allSections as AnyItem[]}
            allLessons={admin.allLessons as AnyItem[]}
            allSigns={admin.allSigns as AnyItem[]}
            allQuestions={admin.allQuestions as AnyItem[]}
            updateSection={(id, d) => admin.updateSection(id, d as never)}
            updateLesson={(id, d) => admin.updateLesson(id, d as never)}
            updateSign={(id, d) => admin.updateSign(id, d as never)}
            updateQuestion={(id, d) => admin.updateQuestion(id, d as never)}
          />
        )}
      </Suspense>

      {/* ── CRUD Modal ─────────────────────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg my-8 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-surface-900 mb-4">{modal.data?.id ? 'تعديل' : 'إضافة'}</h3>
            {modal.type === 'section' && (<>
              {renderInput('الاسم بالإيطالية / Nome (IT)', 'nameIt')}
              {renderInput('الاسم بالعربية / Nome (AR)', 'nameAr')}
              {renderInput('الوصف بالإيطالية / Descrizione (IT)', 'descriptionIt', 'textarea')}
              {renderInput('الوصف بالعربية / Descrizione (AR)', 'descriptionAr', 'textarea')}
              {renderInput('الأيقونة', 'icon')}
              {renderInput('اللون', 'color', 'color')}
              {renderInput('صورة', 'image', 'image')}
              {renderInput('الترتيب', 'order', 'number')}
            </>)}
            {modal.type === 'lesson' && (<>
              {renderInput('القسم', 'sectionId', 'select-section')}
              {renderInput('العنوان بالإيطالية / Titolo (IT)', 'titleIt')}
              {renderInput('العنوان بالعربية / Titolo (AR)', 'titleAr')}
              {renderInput('المحتوى بالإيطالية / Contenuto (IT)', 'contentIt', 'richtext')}
              {renderInput('المحتوى بالعربية / Contenuto (AR)', 'contentAr', 'richtext')}
              {renderInput('صورة', 'image', 'image')}
              {renderInput('الترتيب', 'order', 'number')}
            </>)}
            {modal.type === 'question' && (<>
              {renderInput('القسم', 'sectionId', 'select-section')}
              {renderInput('الدرس', 'lessonId', 'select-lesson')}
              {renderInput('السؤال بالإيطالية / Domanda (IT)', 'questionIt', 'textarea')}
              {renderInput('السؤال بالعربية / Domanda (AR)', 'questionAr', 'textarea')}
              {renderInput('الإجابة الصحيحة', 'isTrue', 'boolean')}
              {renderInput('الشرح بالإيطالية / Spiegazione (IT)', 'explanationIt', 'textarea')}
              {renderInput('الشرح بالعربية / Spiegazione (AR)', 'explanationAr', 'textarea')}
              {renderInput('الصعوبة', 'difficulty', 'select-difficulty')}
              {renderInput('صورة', 'image', 'image')}
              {renderInput('الترتيب', 'order', 'number')}
            </>)}
            {modal.type === 'sign' && (<>
              {renderInput('الاسم بالإيطالية', 'nameIt')}
              {renderInput('الاسم بالعربية', 'nameAr')}
              {renderInput('الوصف بالإيطالية', 'descriptionIt', 'textarea')}
              {renderInput('الوصف بالعربية', 'descriptionAr', 'textarea')}
              {renderInput('القسم', 'sectionId', 'select-sign-section')}
              {renderInput('التصنيف', 'category')}
              {renderInput('صورة', 'image', 'image-square')}
              {renderInput('الترتيب', 'order', 'number')}
            </>)}
            {modal.type === 'signSection' && (<>
              {renderInput('الاسم بالإيطالية', 'nameIt')}
              {renderInput('الاسم بالعربية', 'nameAr')}
              {renderInput('الأيقونة', 'icon')}
              {renderInput('الترتيب', 'order', 'number')}
            </>)}
            {modal.type === 'dictSection' && (<>
              {renderInput('الاسم بالإيطالية', 'nameIt')}
              {renderInput('الاسم بالعربية', 'nameAr')}
              {renderInput('الأيقونة', 'icon')}
              {renderInput('الترتيب', 'order', 'number')}
            </>)}
            {modal.type === 'dictEntry' && (<>
              {renderInput('القسم', 'sectionId', 'select-dict-section')}
              {renderInput('المصطلح بالإيطالية', 'termIt')}
              {renderInput('المصطلح بالعربية', 'termAr')}
              {renderInput('التعريف بالإيطالية', 'definitionIt', 'textarea')}
              {renderInput('التعريف بالعربية', 'definitionAr', 'textarea')}
              {renderInput('الترتيب', 'order', 'number')}
            </>)}
            <div className="flex gap-3 mt-6">
              <Button fullWidth variant="ghost" onClick={() => setModal(null)}>إلغاء</Button>
              <Button fullWidth onClick={saveItem}>حفظ</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Dialog ──────────────────────────────────────────────── */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setConfirmDel(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <Icon name="warning" size={40} className="text-danger-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 text-center mb-2">
              {confirmDel.type.includes('permanent') ? 'حذف نهائي' : 'نقل إلى المحذوفات'}
            </h3>
            <p className="text-sm text-surface-500 text-center mb-6">
              {confirmDel.type.includes('permanent')
                ? 'سيُحذف هذا العنصر نهائياً ولا يمكن استعادته.'
                : 'سيُنقل إلى قسم المحذوفات ويمكن استعادته خلال 30 يوماً.'}
            </p>
            <div className="flex gap-3">
              <Button fullWidth variant="ghost" onClick={() => setConfirmDel(null)}>إلغاء</Button>
              <Button fullWidth variant="danger" onClick={handleDelete}>
                {confirmDel.type.includes('permanent') ? 'حذف نهائي' : 'حذف'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Media Picker Modal ─────────────────────────────────────────────────── */}
      {mediaPicker && (() => {
        const sourceLabels: Record<string, string> = { sections: 'الأقسام', lessons: 'الدروس', signs: 'الإشارات', questions: 'الأسئلة' };
        const allMedia = collectAllMedia();
        const filtered = allMedia.filter(m => {
          const matchesFilter = mediaPickerFilter === 'all' || m.source === mediaPickerFilter;
          const matchesSearch = !mediaPickerSearch || m.label.toLowerCase().includes(mediaPickerSearch.toLowerCase());
          return matchesFilter && matchesSearch;
        });
        const counts: Record<string, number> = { all: allMedia.length, sections: 0, lessons: 0, signs: 0, questions: 0 };
        for (const m of allMedia) counts[m.source] = (counts[m.source] || 0) + 1;

        return (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setMediaPicker(null)}>
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="p-5 border-b border-surface-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="perm_media" size={20} className="text-primary-500" filled />
                    <h3 className="text-lg font-bold text-surface-900">اختر صورة</h3>
                    <span className="text-xs text-surface-400 bg-surface-100 px-2 py-0.5 rounded-full">{allMedia.length} صورة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:bg-primary-600 transition-colors"
                      onClick={async () => {
                        const result = await handleImageUploadDirect(mediaPicker.squareSize);
                        if (result) { setForm(prev => ({ ...prev, [mediaPicker.field]: result })); setMediaPicker(null); }
                      }}>
                      <Icon name="add_photo_alternate" size={16} /> رفع صورة جديدة
                    </button>
                    <button className="p-2 rounded-xl hover:bg-surface-100 transition-colors"
                      onClick={() => setMediaPicker(null)}>
                      <Icon name="close" size={20} className="text-surface-500" />
                    </button>
                  </div>
                </div>
                <input
                  className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm mb-3"
                  placeholder="بحث..."
                  value={mediaPickerSearch}
                  onChange={e => setMediaPickerSearch(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-1.5 flex-wrap">
                  {(['all', 'sections', 'lessons', 'signs', 'questions'] as const).map(f => (
                    <button key={f}
                      className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors',
                        mediaPickerFilter === f ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-surface-600 border-surface-200 hover:border-primary-300')}
                      onClick={() => setMediaPickerFilter(f)}>
                      {f === 'all' ? 'الكل' : sourceLabels[f]} ({counts[f] || 0})
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Icon name="image_not_supported" size={48} className="text-surface-200 mb-3" />
                    <p className="text-surface-400 text-sm">لا توجد صور متاحة</p>
                    <p className="text-surface-300 text-xs mt-1">يمكنك رفع صورة جديدة من الزر أعلاه</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {filtered.map((m, idx) => (
                      <button key={idx}
                        className="group relative rounded-xl border-2 border-transparent hover:border-primary-400 overflow-hidden transition-all focus:outline-none focus:border-primary-500"
                        onClick={() => { setForm(prev => ({ ...prev, [mediaPicker.field]: m.src })); setMediaPicker(null); }}>
                        <div className="aspect-square bg-surface-50 overflow-hidden">
                          <img src={m.src} alt={m.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                        </div>
                        <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/10 transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-primary-500 text-white rounded-full p-1.5 shadow-lg">
                              <Icon name="check" size={14} />
                            </div>
                          </div>
                        </div>
                        <div className="p-1.5 bg-white">
                          <p className="text-[10px] text-surface-600 truncate">{m.label || '—'}</p>
                          <span className={cn('text-[9px] font-semibold',
                            m.source === 'sections' ? 'text-blue-500' :
                            m.source === 'lessons' ? 'text-green-500' :
                            m.source === 'signs' ? 'text-amber-500' : 'text-purple-500')}>
                            {sourceLabels[m.source]}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
