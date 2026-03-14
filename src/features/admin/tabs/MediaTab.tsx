/**
 * MediaTab — Media library management: grid view, selection, edit, delete.
 */
import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';
import type { AnyItem, MediaItem } from '../types/admin.types';
import { uploadImageDirect } from '../services/adminContent.service';

interface MediaTabProps {
  allSections: AnyItem[];
  allLessons: AnyItem[];
  allSigns: AnyItem[];
  allQuestions: AnyItem[];
  updateSection: (id: string, data: Partial<AnyItem>) => Promise<boolean>;
  updateLesson: (id: string, data: Partial<AnyItem>) => Promise<boolean>;
  updateSign: (id: string, data: Partial<AnyItem>) => Promise<boolean>;
  updateQuestion: (id: string, data: Partial<AnyItem>) => Promise<boolean>;
}

const SOURCE_LABELS: Record<string, string> = {
  sections: 'الأقسام', lessons: 'الدروس', signs: 'الإشارات', questions: 'الأسئلة',
};

export const MediaTab = React.memo(function MediaTab({
  allSections, allLessons, allSigns, allQuestions,
  updateSection, updateLesson, updateSign, updateQuestion,
}: MediaTabProps) {
  const [mediaLibSearch, setMediaLibSearch] = useState('');
  const [mediaLibFilter, setMediaLibFilter] = useState<'all' | 'sections' | 'lessons' | 'signs' | 'questions'>('all');
  const [mediaLibSelectedIds, setMediaLibSelectedIds] = useState<Set<string>>(new Set());
  const [mediaEditModal, setMediaEditModal] = useState<{ source: string; id: string; label: string; src: string } | null>(null);
  const [mediaEditSrc, setMediaEditSrc] = useState('');

  const collectAllMedia = (): MediaItem[] => {
    const items: MediaItem[] = [];
    for (const s of allSections) if (s.image) items.push({ src: s.image, label: s.nameAr || s.nameIt, source: 'sections', id: s.id });
    for (const l of allLessons) if (l.image) items.push({ src: l.image, label: l.titleAr || l.titleIt, source: 'lessons', id: l.id });
    for (const sg of allSigns) if (sg.image) items.push({ src: sg.image, label: sg.nameAr || sg.nameIt, source: 'signs', id: sg.id });
    for (const q of allQuestions) if (q.image) items.push({ src: q.image, label: (q.questionAr || q.questionIt || '').substring(0, 40), source: 'questions', id: q.id });
    const seen = new Set<string>();
    return items.filter(i => { if (seen.has(i.src)) return false; seen.add(i.src); return true; });
  };

  const deleteMediaImage = async (item: MediaItem) => {
    switch (item.source) {
      case 'sections': await updateSection(item.id, { image: '' }); break;
      case 'lessons': await updateLesson(item.id, { image: '' }); break;
      case 'signs': await updateSign(item.id, { image: '' }); break;
      case 'questions': await updateQuestion(item.id, { image: '' }); break;
    }
  };

  const saveMediaImage = async (source: string, id: string, newSrc: string) => {
    switch (source) {
      case 'sections': await updateSection(id, { image: newSrc }); break;
      case 'lessons': await updateLesson(id, { image: newSrc }); break;
      case 'signs': await updateSign(id, { image: newSrc }); break;
      case 'questions': await updateQuestion(id, { image: newSrc }); break;
    }
  };

  const allMedia = collectAllMedia();
  const filtered = allMedia.filter(m => {
    const matchesFilter = mediaLibFilter === 'all' || m.source === mediaLibFilter;
    const matchesSearch = !mediaLibSearch || m.label.toLowerCase().includes(mediaLibSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const counts: Record<string, number> = { all: allMedia.length, sections: 0, lessons: 0, signs: 0, questions: 0 };
  for (const m of allMedia) counts[m.source] = (counts[m.source] || 0) + 1;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-surface-100 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <Icon name="perm_media" size={22} className="text-primary-500" filled />
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-900">مكتبة الصور</h2>
            <p className="text-xs text-surface-400">{allMedia.length} صورة مخزنة من جميع الأقسام</p>
          </div>
          <div className="mr-auto flex gap-2">
            {mediaLibSelectedIds.size > 0 && (
              <button className="px-4 py-2 bg-danger-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-danger-600 transition-colors"
                onClick={async () => {
                  if (!confirm(`هل تريد حذف صور ${mediaLibSelectedIds.size} عنصر؟`)) return;
                  const allM = collectAllMedia();
                  for (const key of mediaLibSelectedIds) {
                    const item = allM.find(x => `${x.source}:${x.id}` === key);
                    if (item) await deleteMediaImage(item);
                  }
                  setMediaLibSelectedIds(new Set());
                }}>
                <Icon name="delete_sweep" size={18} /> حذف المحدد ({mediaLibSelectedIds.size})
              </button>
            )}
            <button className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary-600 transition-colors"
              onClick={async () => {
                const result = await uploadImageDirect();
                if (result) {
                  await navigator.clipboard.writeText(result).catch(() => {});
                  alert('تم رفع الصورة ونسخ بياناتها. يمكنك لصقها في أي حقل صورة أثناء التحرير.');
                }
              }}>
              <Icon name="add_photo_alternate" size={18} /> رفع صورة جديدة
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 flex-wrap">
          <input
            className="flex-1 min-w-48 border border-surface-200 rounded-xl px-3 py-2 text-sm"
            placeholder="بحث في الصور..."
            value={mediaLibSearch}
            onChange={e => setMediaLibSearch(e.target.value)}
          />
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'sections', 'lessons', 'signs', 'questions'] as const).map(f => (
              <button key={f}
                className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors',
                  mediaLibFilter === f ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-surface-600 border-surface-200 hover:border-primary-300')}
                onClick={() => setMediaLibFilter(f)}>
                {f === 'all' ? 'الكل' : SOURCE_LABELS[f]} ({counts[f] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Bulk select */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-surface-600">
              <input type="checkbox"
                checked={filtered.every(m => mediaLibSelectedIds.has(`${m.source}:${m.id}`))}
                onChange={e => {
                  if (e.target.checked) setMediaLibSelectedIds(new Set(filtered.map(m => `${m.source}:${m.id}`)));
                  else setMediaLibSelectedIds(new Set());
                }}
                className="w-4 h-4 rounded" />
              تحديد الكل
            </label>
            {mediaLibSelectedIds.size > 0 && <span className="text-xs text-surface-400">{mediaLibSelectedIds.size} محدد</span>}
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-surface-100 p-16 text-center">
          <Icon name="image_not_supported" size={48} className="text-surface-200 mx-auto mb-3" />
          <p className="text-surface-400 text-sm">لا توجد صور</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((m, idx) => {
            const itemKey = `${m.source}:${m.id}`;
            const isSelected = mediaLibSelectedIds.has(itemKey);
            return (
              <div key={idx} className={cn('bg-white rounded-xl border overflow-hidden group hover:shadow-md transition-all',
                isSelected ? 'border-primary-500 ring-2 ring-primary-300' : 'border-surface-100 hover:border-primary-200')}>
                <div className="aspect-square relative overflow-hidden bg-surface-50">
                  <div className="absolute top-1.5 right-1.5 z-10">
                    <input type="checkbox" checked={isSelected}
                      onChange={e => {
                        const next = new Set(mediaLibSelectedIds);
                        e.target.checked ? next.add(itemKey) : next.delete(itemKey);
                        setMediaLibSelectedIds(next);
                      }}
                      className="w-4 h-4 rounded cursor-pointer"
                      onClick={e => e.stopPropagation()} />
                  </div>
                  <img src={m.src} alt={m.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 gap-1.5">
                    <button className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-primary-50 transition-colors" title="عرض الصورة" onClick={() => window.open(m.src, '_blank')}>
                      <Icon name="open_in_new" size={14} className="text-surface-700" />
                    </button>
                    <button className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-primary-50 transition-colors" title="تعديل الصورة"
                      onClick={() => { setMediaEditModal({ source: m.source, id: m.id, label: m.label, src: m.src }); setMediaEditSrc(m.src); }}>
                      <Icon name="edit" size={14} className="text-primary-600" />
                    </button>
                    <button className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-danger-50 transition-colors" title="حذف الصورة"
                      onClick={async () => {
                        if (!confirm('هل تريد حذف هذه الصورة؟')) return;
                        await deleteMediaImage(m);
                        const next = new Set(mediaLibSelectedIds);
                        next.delete(itemKey);
                        setMediaLibSelectedIds(next);
                      }}>
                      <Icon name="delete" size={14} className="text-danger-600" />
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-surface-700 truncate font-medium" title={m.label}>{m.label || '—'}</p>
                  <span className={cn('inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                    m.source === 'sections' ? 'bg-blue-50 text-blue-600' :
                    m.source === 'lessons' ? 'bg-green-50 text-green-600' :
                    m.source === 'signs' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600')}>
                    {SOURCE_LABELS[m.source]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Edit Modal */}
      {mediaEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setMediaEditModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-surface-900 mb-4">تعديل بيانات الصورة</h3>
            <div className="flex gap-4 mb-4">
              {mediaEditSrc && <img src={mediaEditSrc} alt="" className="w-24 h-24 rounded-xl object-cover border border-surface-200" />}
              <div className="flex-1 space-y-2">
                <p className="text-xs text-surface-500">المصدر: <span className="font-semibold">{mediaEditModal.source}</span></p>
                <p className="text-xs text-surface-500">الاسم الحالي: <span className="font-semibold">{mediaEditModal.label}</span></p>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">رابط الصورة (URL أو base64)</label>
                <textarea
                  className="w-full border border-surface-200 rounded-xl px-3 py-2 text-xs h-20 resize-none"
                  placeholder="أدخل رابط الصورة أو اتركه كما هو..."
                  value={mediaEditSrc}
                  onChange={e => setMediaEditSrc(e.target.value)}
                />
              </div>
              <button className="px-3 py-2 bg-surface-100 rounded-lg text-sm hover:bg-surface-200 flex items-center gap-1.5 transition-colors"
                onClick={async () => { const result = await uploadImageDirect(); if (result) setMediaEditSrc(result); }}>
                <Icon name="upload" size={16} /> رفع صورة جديدة
              </button>
            </div>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded-xl border border-surface-200 text-sm hover:bg-surface-50 transition-colors" onClick={() => setMediaEditModal(null)}>إلغاء</button>
              <button className="px-4 py-2 bg-danger-500 text-white rounded-xl text-sm font-semibold hover:bg-danger-600 transition-colors"
                onClick={async () => {
                  if (!confirm('هل تريد حذف هذه الصورة نهائياً؟')) return;
                  await deleteMediaImage({ src: mediaEditModal.src, label: mediaEditModal.label, source: mediaEditModal.source as never, id: mediaEditModal.id });
                  setMediaEditModal(null);
                }}>
                <Icon name="delete" size={16} /> حذف الصورة
              </button>
              <button className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
                onClick={async () => {
                  await saveMediaImage(mediaEditModal.source, mediaEditModal.id, mediaEditSrc);
                  setMediaEditModal(null);
                }}>
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
