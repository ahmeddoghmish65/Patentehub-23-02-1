import {
  getDB, generateId,
  type Section, type Lesson, type Question, type Sign,
  type DictionarySection, type DictionaryEntry,
} from '../database';
import { isAdmin, getAuthUser, logAdmin, ok, err } from './_shared';
import type { ApiRes } from './_shared';

// ============ DATA IMPORT/EXPORT ============
export async function apiExportData(token: string, storeName: string): Promise<ApiRes<unknown[]>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll(storeName);
  const storeNameMap: Record<string, string> = {
    sections: 'الأقسام', lessons: 'الدروس', questions: 'الأسئلة',
    signs: 'الإشارات', dictionarySections: 'أقسام القاموس',
    dictionaryEntries: 'مصطلحات القاموس', users: 'المستخدمين',
    posts: 'المنشورات', comments: 'التعليقات',
  };
  await logAdmin(token, 'تصدير بيانات', `${storeNameMap[storeName] || storeName}: ${all.length} سجل`);
  return ok(all);
}

export async function apiImportData(token: string, storeName: string, data: unknown[]): Promise<ApiRes<number>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  let count = 0;
  for (const item of data) {
    await db.put(storeName, item);
    count++;
  }
  await logAdmin(token, 'استيراد بيانات', `${storeName}: ${count} سجل`);
  return ok(count);
}

// ============ SEED DATA ============
export async function apiSeedData(token: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();

  const sections: Section[] = [
    { id: 's1', nameAr: 'إشارات الخطر', nameIt: 'Segnali di pericolo', descriptionAr: 'تعرف على إشارات التحذير من الأخطار', descriptionIt: 'Impara i segnali di pericolo', image: '', icon: 'warning', color: '#ef4444', order: 1, createdAt: new Date().toISOString() },
    { id: 's2', nameAr: 'إشارات المنع', nameIt: 'Segnali di divieto', descriptionAr: 'إشارات الحظر والمنع المرورية', descriptionIt: 'Segnali di divieto stradali', image: '', icon: 'block', color: '#dc2626', order: 2, createdAt: new Date().toISOString() },
    { id: 's3', nameAr: 'إشارات الإلزام', nameIt: "Segnali d'obbligo", descriptionAr: 'الإشارات التي تلزمك بفعل معين', descriptionIt: 'Segnali che obbligano a un comportamento', image: '', icon: 'arrow_circle_up', color: '#2563eb', order: 3, createdAt: new Date().toISOString() },
    { id: 's4', nameAr: 'أولوية المرور', nameIt: 'Precedenza', descriptionAr: 'قواعد الأولوية في التقاطعات', descriptionIt: 'Regole di precedenza', image: '', icon: 'swap_vert', color: '#f59e0b', order: 4, createdAt: new Date().toISOString() },
    { id: 's5', nameAr: 'حدود السرعة', nameIt: 'Limiti di velocità', descriptionAr: 'السرعات القصوى على أنواع الطرق', descriptionIt: 'Limiti di velocità sulle strade', image: '', icon: 'speed', color: '#8b5cf6', order: 5, createdAt: new Date().toISOString() },
    { id: 's6', nameAr: 'مسافة الأمان', nameIt: 'Distanza di sicurezza', descriptionAr: 'المسافة الآمنة بين المركبات', descriptionIt: 'Distanza di sicurezza tra veicoli', image: '', icon: 'social_distance', color: '#06b6d4', order: 6, createdAt: new Date().toISOString() },
  ];
  for (const s of sections) await db.put('sections', s);

  const lessons: Lesson[] = [
    { id: 'l1', sectionId: 's1', titleAr: 'مقدمة في إشارات الخطر', titleIt: 'Introduzione ai segnali di pericolo', contentAr: 'إشارات الخطر هي إشارات تحذيرية تنبه السائق إلى وجود خطر محتمل على الطريق. تتميز بشكلها المثلثي مع حافة حمراء وخلفية بيضاء. توضع عادة على بعد 150 متراً من الخطر.', contentIt: 'I segnali di pericolo sono segnali di avvertimento che avvisano il conducente della presenza di un potenziale pericolo sulla strada. Hanno forma triangolare con bordo rosso e sfondo bianco. Sono posti di norma a 150 m dal pericolo.', image: '', order: 1, createdAt: new Date().toISOString() },
    { id: 'l2', sectionId: 's1', titleAr: 'إشارات المنعطفات والطريق الزلق', titleIt: 'Segnali di curve e strada sdrucciolevole', contentAr: 'إشارة المنعطف الخطير تحذر من وجود منعطف حاد. إشارة الطريق الزلق تحذر من أن الطريق قد يكون زلقاً خاصة في الأمطار. يجب تخفيف السرعة عند رؤية هذه الإشارات.', contentIt: 'Il segnale di curva pericolosa avverte di una curva stretta. Il segnale di strada sdrucciolevole avverte che la strada può essere scivolosa specialmente con la pioggia.', image: '', order: 2, createdAt: new Date().toISOString() },
    { id: 'l3', sectionId: 's2', titleAr: 'مقدمة في إشارات المنع', titleIt: 'Introduzione ai segnali di divieto', contentAr: 'إشارات المنع دائرية الشكل بحافة حمراء وخلفية بيضاء. تدل على أفعال ممنوعة على الطريق مثل منع الدخول أو منع التجاوز أو تحديد السرعة القصوى.', contentIt: 'I segnali di divieto sono circolari con bordo rosso e sfondo bianco. Indicano azioni vietate sulla strada come divieto di accesso, sorpasso o limiti di velocità.', image: '', order: 1, createdAt: new Date().toISOString() },
    { id: 'l4', sectionId: 's3', titleAr: 'مقدمة في إشارات الإلزام', titleIt: "Introduzione ai segnali d'obbligo", contentAr: 'إشارات الإلزام دائرية زرقاء مع رموز بيضاء. تلزم السائق بفعل معين مثل الاتجاه الإجباري أو استخدام سلاسل الثلج.', contentIt: "I segnali d'obbligo sono circolari blu con simboli bianchi. Obbligano il conducente a un comportamento specifico.", image: '', order: 1, createdAt: new Date().toISOString() },
    { id: 'l5', sectionId: 's4', titleAr: 'قواعد الأولوية', titleIt: 'Regole di precedenza', contentAr: 'في التقاطعات بدون إشارات، الأولوية للقادم من اليمين. إشارة STOP تلزم بالتوقف التام. المثلث المقلوب يعني إعطاء الأولوية.', contentIt: 'Negli incroci senza segnali, la precedenza è a chi viene da destra. Lo STOP obbliga alla fermata completa.', image: '', order: 1, createdAt: new Date().toISOString() },
    { id: 'l6', sectionId: 's5', titleAr: 'حدود السرعة في إيطاليا', titleIt: 'Limiti di velocità in Italia', contentAr: 'داخل المدينة 50 كم/س، طرق خارجية ثانوية 90 كم/س، طرق خارجية رئيسية 110 كم/س، أوتوسترادا 130 كم/س. في المطر تنخفض الحدود.', contentIt: 'Centro abitato 50 km/h, extraurbane secondarie 90 km/h, extraurbane principali 110 km/h, autostrada 130 km/h.', image: '', order: 1, createdAt: new Date().toISOString() },
  ];
  for (const l of lessons) await db.put('lessons', l);

  const questions: Question[] = [
    { id: 'q1', lessonId: 'l1', sectionId: 's1', questionAr: 'إشارات الخطر لها شكل مثلث بحافة حمراء وخلفية بيضاء', questionIt: 'I segnali di pericolo hanno forma triangolare con bordo rosso e sfondo bianco', isTrue: true, explanationAr: 'صحيح. جميع إشارات الخطر مثلثية الشكل', explanationIt: 'Vero. Tutti i segnali di pericolo sono triangolari', difficulty: 'easy', image: '', order: 1, createdAt: new Date().toISOString() },
    { id: 'q2', lessonId: 'l1', sectionId: 's1', questionAr: 'توضع إشارات الخطر عادة على بعد 50 متراً من الخطر', questionIt: 'I segnali di pericolo sono posti di norma a 50 m dal pericolo', isTrue: false, explanationAr: 'خطأ. توضع على بعد 150 متراً وليس 50', explanationIt: 'Falso. Sono posti a 150 m, non 50', difficulty: 'medium', image: '', order: 2, createdAt: new Date().toISOString() },
    { id: 'q3', lessonId: 'l1', sectionId: 's1', questionAr: 'عند رؤية إشارة خطر يجب زيادة السرعة لتجاوز الخطر بسرعة', questionIt: 'Vedendo un segnale di pericolo bisogna aumentare la velocità per superare il pericolo velocemente', isTrue: false, explanationAr: 'خطأ. يجب تخفيف السرعة وزيادة الانتباه', explanationIt: 'Falso. Bisogna rallentare e aumentare l\'attenzione', difficulty: 'easy', image: '', order: 3, createdAt: new Date().toISOString() },
    { id: 'q4', lessonId: 'l1', sectionId: 's1', questionAr: 'إشارة الأطفال تحذر من احتمال وجود أطفال بالقرب من مدرسة', questionIt: 'Il segnale bambini avverte della possibile presenza di bambini vicino a scuole', isTrue: true, explanationAr: 'صحيح. هذه الإشارة تنبه لوجود أطفال', explanationIt: 'Vero. Questo segnale avverte della presenza di bambini', difficulty: 'easy', image: '', order: 4, createdAt: new Date().toISOString() },
    { id: 'q5', lessonId: 'l2', sectionId: 's1', questionAr: 'إشارة الطريق الزلق تعني أنه يجب زيادة السرعة', questionIt: 'Il segnale strada sdrucciolevole significa che bisogna aumentare la velocità', isTrue: false, explanationAr: 'خطأ. يجب تخفيف السرعة لأن الطريق زلق', explanationIt: 'Falso. Bisogna rallentare perché la strada è scivolosa', difficulty: 'easy', image: '', order: 1, createdAt: new Date().toISOString() },
    { id: 'q6', lessonId: 'l2', sectionId: 's1', questionAr: 'إشارة المنعطف الخطير تحذر من وجود منعطف حاد أمامك', questionIt: 'Il segnale di curva pericolosa avverte di una curva stretta avanti', isTrue: true, explanationAr: 'صحيح. هذه الإشارة تحذر من منعطف خطير', explanationIt: 'Vero. Avverte di una curva pericolosa', difficulty: 'easy', image: '', order: 2, createdAt: new Date().toISOString() },
    { id: 'q7', lessonId: 'l3', sectionId: 's2', questionAr: 'إشارات المنع دائرية بحافة حمراء وخلفية بيضاء', questionIt: 'I segnali di divieto sono circolari con bordo rosso e sfondo bianco', isTrue: true, explanationAr: 'صحيح', explanationIt: 'Vero', difficulty: 'easy', image: '', order: 1, createdAt: new Date().toISOString() },
    { id: 'q8', lessonId: 'l3', sectionId: 's2', questionAr: 'إشارة ممنوع الدخول تسمح بالدخول للدراجات فقط', questionIt: 'Il divieto di accesso permette l\'accesso solo alle biciclette', isTrue: false, explanationAr: 'خطأ. ممنوع الدخول لجميع المركبات', explanationIt: 'Falso. Vieta l\'accesso a tutti i veicoli', difficulty: 'medium', image: '', order: 2, createdAt: new Date().toISOString() },
    { id: 'q9', lessonId: 'l3', sectionId: 's2', questionAr: 'إشارة حد السرعة 50 تعني أنه لا يمكن تجاوز 50 كم/س', questionIt: 'Il limite di velocità 50 significa che non si può superare 50 km/h', isTrue: true, explanationAr: 'صحيح. هذه الإشارة تحدد الحد الأقصى للسرعة', explanationIt: 'Vero. Indica il limite massimo di velocità', difficulty: 'easy', image: '', order: 3, createdAt: new Date().toISOString() },
    { id: 'q10', lessonId: 'l4', sectionId: 's3', questionAr: 'إشارات الإلزام دائرية زرقاء مع رموز بيضاء', questionIt: "I segnali d'obbligo sono circolari blu con simboli bianchi", isTrue: true, explanationAr: 'صحيح', explanationIt: 'Vero', difficulty: 'easy', image: '', order: 1, createdAt: new Date().toISOString() },
    { id: 'q11', lessonId: 'l4', sectionId: 's3', questionAr: 'إشارة الاتجاه الإجباري للأمام تسمح بالانعطاف', questionIt: 'Il segnale direzione obbligatoria dritto permette di svoltare', isTrue: false, explanationAr: 'خطأ. يجب المتابعة للأمام فقط', explanationIt: 'Falso. Si deve proseguire dritto', difficulty: 'easy', image: '', order: 2, createdAt: new Date().toISOString() },
    { id: 'q12', lessonId: 'l5', sectionId: 's4', questionAr: 'في تقاطع بدون إشارات الأولوية للقادم من اليمين', questionIt: 'In un incrocio senza segnali la precedenza è a chi viene da destra', isTrue: true, explanationAr: 'صحيح. القاعدة العامة هي الأولوية لليمين', explanationIt: 'Vero. La regola generale è precedenza a destra', difficulty: 'easy', image: '', order: 1, createdAt: new Date().toISOString() },
    { id: 'q13', lessonId: 'l5', sectionId: 's4', questionAr: 'عند إشارة STOP يمكنك المرور بدون توقف إذا لم تكن هناك مركبات', questionIt: 'Al segnale STOP puoi passare senza fermarti se non ci sono veicoli', isTrue: false, explanationAr: 'خطأ. يجب التوقف تماماً دائماً', explanationIt: 'Falso. Bisogna sempre fermarsi completamente', difficulty: 'medium', image: '', order: 2, createdAt: new Date().toISOString() },
    { id: 'q14', lessonId: 'l6', sectionId: 's5', questionAr: 'الحد الأقصى للسرعة داخل المدينة هو 50 كم/س', questionIt: 'Il limite di velocità nei centri abitati è 50 km/h', isTrue: true, explanationAr: 'صحيح. ما لم تكن هناك إشارة أخرى', explanationIt: 'Vero. Salvo diversa indicazione', difficulty: 'easy', image: '', order: 1, createdAt: new Date().toISOString() },
    { id: 'q15', lessonId: 'l6', sectionId: 's5', questionAr: 'الحد الأقصى على الأوتوسترادا هو 150 كم/س', questionIt: 'Il limite in autostrada è 150 km/h', isTrue: false, explanationAr: 'خطأ. الحد هو 130 كم/س', explanationIt: 'Falso. Il limite è 130 km/h', difficulty: 'easy', image: '', order: 2, createdAt: new Date().toISOString() },
    { id: 'q16', lessonId: 'l6', sectionId: 's5', questionAr: 'في حالة المطر ينخفض حد السرعة على الأوتوسترادا إلى 110 كم/س', questionIt: 'Con pioggia il limite in autostrada scende a 110 km/h', isTrue: true, explanationAr: 'صحيح', explanationIt: 'Vero', difficulty: 'medium', image: '', order: 3, createdAt: new Date().toISOString() },
  ];
  for (const q of questions) await db.put('questions', q);

  const signs: Sign[] = [
    { id: 'sg1', nameAr: 'خطر عام', nameIt: 'Pericolo generico', descriptionAr: 'إشارة تحذير عامة من خطر غير محدد', descriptionIt: 'Segnale di avvertimento generico', category: 'pericolo', image: '', order: 1, createdAt: new Date().toISOString() },
    { id: 'sg2', nameAr: 'منعطف خطير', nameIt: 'Curva pericolosa', descriptionAr: 'تحذير من منعطف حاد', descriptionIt: 'Avverte di curva stretta', category: 'pericolo', image: '', order: 2, createdAt: new Date().toISOString() },
    { id: 'sg3', nameAr: 'ممنوع الدخول', nameIt: 'Divieto di accesso', descriptionAr: 'ممنوع دخول جميع المركبات', descriptionIt: 'Vietato l\'accesso a tutti i veicoli', category: 'divieto', image: '', order: 1, createdAt: new Date().toISOString() },
    { id: 'sg4', nameAr: 'ممنوع التجاوز', nameIt: 'Divieto di sorpasso', descriptionAr: 'ممنوع تجاوز المركبات', descriptionIt: 'Vietato il sorpasso', category: 'divieto', image: '', order: 2, createdAt: new Date().toISOString() },
    { id: 'sg5', nameAr: 'اتجاه إجباري', nameIt: 'Direzione obbligatoria', descriptionAr: 'يجب المتابعة في الاتجاه المشار إليه', descriptionIt: 'Obbligo di seguire la direzione indicata', category: 'obbligo', image: '', order: 1, createdAt: new Date().toISOString() },
  ];
  for (const s of signs) await db.put('signs', s);

  const dictSections: DictionarySection[] = [
    { id: 'ds1', nameAr: 'مصطلحات أساسية', nameIt: 'Termini base', icon: 'menu_book', order: 1, createdAt: new Date().toISOString() },
    { id: 'ds2', nameAr: 'أجزاء السيارة', nameIt: 'Parti del veicolo', icon: 'directions_car', order: 2, createdAt: new Date().toISOString() },
    { id: 'ds3', nameAr: 'أنواع الطرق', nameIt: 'Tipi di strade', icon: 'road', order: 3, createdAt: new Date().toISOString() },
  ];
  for (const ds of dictSections) await db.put('dictionarySections', ds);

  const dictEntries: DictionaryEntry[] = [
    { id: 'de1', sectionId: 'ds1', termIt: 'Patente', termAr: 'رخصة القيادة', definitionIt: 'Documento che abilita alla guida', definitionAr: 'وثيقة تخول حاملها قيادة المركبات', order: 1, createdAt: new Date().toISOString() },
    { id: 'de2', sectionId: 'ds1', termIt: 'Segnale', termAr: 'إشارة', definitionIt: 'Indicazione stradale visiva', definitionAr: 'علامة مرورية بصرية', order: 2, createdAt: new Date().toISOString() },
    { id: 'de3', sectionId: 'ds1', termIt: 'Precedenza', termAr: 'أولوية المرور', definitionIt: 'Diritto di passare prima', definitionAr: 'حق المرور أولاً', order: 3, createdAt: new Date().toISOString() },
    { id: 'de4', sectionId: 'ds1', termIt: 'Sorpasso', termAr: 'التجاوز', definitionIt: 'Superare un altro veicolo', definitionAr: 'تخطي مركبة أخرى', order: 4, createdAt: new Date().toISOString() },
    { id: 'de5', sectionId: 'ds2', termIt: 'Freno', termAr: 'فرامل', definitionIt: 'Dispositivo per rallentare o fermare', definitionAr: 'جهاز لإبطاء أو إيقاف المركبة', order: 1, createdAt: new Date().toISOString() },
    { id: 'de6', sectionId: 'ds2', termIt: 'Volante', termAr: 'مقود', definitionIt: 'Dispositivo per sterzare', definitionAr: 'جهاز لتوجيه المركبة', order: 2, createdAt: new Date().toISOString() },
    { id: 'de7', sectionId: 'ds2', termIt: 'Pneumatico', termAr: 'إطار', definitionIt: 'Rivestimento esterno della ruota', definitionAr: 'الغلاف الخارجي للعجلة', order: 3, createdAt: new Date().toISOString() },
    { id: 'de8', sectionId: 'ds3', termIt: 'Autostrada', termAr: 'طريق سريع', definitionIt: 'Strada riservata alla circolazione veloce', definitionAr: 'طريق مخصص للسير السريع', order: 1, createdAt: new Date().toISOString() },
    { id: 'de9', sectionId: 'ds3', termIt: 'Centro abitato', termAr: 'داخل المدينة', definitionIt: 'Zona urbanizzata con edifici', definitionAr: 'منطقة حضرية بها مباني', order: 2, createdAt: new Date().toISOString() },
    { id: 'de10', sectionId: 'ds3', termIt: 'Rotatoria', termAr: 'دوار', definitionIt: 'Intersezione a circolazione rotatoria', definitionAr: 'تقاطع بحركة دائرية', order: 3, createdAt: new Date().toISOString() },
  ];
  for (const de of dictEntries) await db.put('dictionaryEntries', de);

  await logAdmin(token, 'تهيئة البيانات', 'تم إنشاء البيانات الأولية');
  return ok(null);
}

// ============ REAL PAGE VISIT TRACKING ============
export async function apiRecordPageVisit(userId: string | null, page: string, sessionId: string) {
  const db = await getDB();
  const visit = {
    id: generateId(), userId, page, sessionId,
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    createdAt: new Date().toISOString()
  };
  await db.put('pageVisits', visit);
}

export async function apiGetPageVisitStats() {
  const db = await getDB();
  const all = await db.getAll('pageVisits');
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const last7Days = all.filter((v: { createdAt: string }) => now - new Date(v.createdAt).getTime() < 7 * day);
  const last30Days = all.filter((v: { createdAt: string }) => now - new Date(v.createdAt).getTime() < 30 * day);

  const sessions7 = new Set(last7Days.map((v: { sessionId: string }) => v.sessionId)).size;
  const sessions30 = new Set(last30Days.map((v: { sessionId: string }) => v.sessionId)).size;

  const dailyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * day);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = 0;
  }
  for (const v of last7Days) {
    const key = v.createdAt.slice(0, 10);
    if (key in dailyMap) dailyMap[key]++;
  }

  const pageMap: Record<string, number> = {};
  for (const v of last30Days) {
    pageMap[v.page] = (pageMap[v.page] || 0) + 1;
  }

  return {
    totalVisits: all.length,
    last7DaysVisits: last7Days.length,
    last30DaysVisits: last30Days.length,
    sessions7, sessions30,
    dailyBreakdown: dailyMap,
    pageBreakdown: pageMap,
  };
}

// ============ USER COMMUNITY RESTRICTIONS ============
export async function apiSetCommunityRestrictions(token: string, userId: string, restrictions: {
  canPost?: boolean; canComment?: boolean; canReply?: boolean;
}) {
  const admin = await getAuthUser(token);
  if (!admin || (admin.role !== 'admin' && admin.role !== 'manager')) return err('غير مصرح', 403);
  const db = await getDB();
  const user = await db.get('users', userId);
  if (!user) return err('المستخدم غير موجود', 404);
  user.communityRestrictions = { ...user.communityRestrictions, ...restrictions };
  await db.put('users', user);
  return ok(user);
}

export type { ApiRes };
