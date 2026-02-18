
import { StreamType, Subject, Post, Summary } from './types.ts';

export interface TeacherChannel {
  id: string;
  name: string;
  subject: string;
  channelUrl: string;
  avatar: string;
  subscribers: string;
  verified: boolean;
}

export const TOP_TEACHERS: TeacherChannel[] = [
  {
    id: 'noureddine',
    name: 'الأستاذ نور الدين',
    subject: 'الرياضيات',
    channelUrl: 'https://www.youtube.com/@noureddine2013',
    avatar: 'https://yt3.googleusercontent.com/ytc/AIdro_n4RzWjLzS_XFv0lP5rI7H_vW_0_v_5_v=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '+2M',
    verified: true
  },
  {
    id: 'bouarich',
    name: 'الأستاذ بوالريش أحمد',
    subject: 'العلوم الطبيعية',
    channelUrl: 'https://www.youtube.com/@Prof_Bouarich_Ahmed',
    avatar: 'https://yt3.googleusercontent.com/ytc/AIdro_ndWv9O6w8Z_T_9V0f1_j_F_p_9_v_5_v=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '+500K',
    verified: true
  },
  {
    id: 'moulay',
    name: 'الأستاذ مولاي عمار',
    subject: 'الفيزياء',
    channelUrl: 'https://www.youtube.com/@moulay-amar',
    avatar: 'https://yt3.googleusercontent.com/ytc/AIdro_mc_Wv9Z_T_9V0f1_j_F_p_9_v_5_v=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '+800K',
    verified: true
  },
  {
    id: 'boussaadi',
    name: 'الأستاذة بوسعادي',
    subject: 'العلوم الإسلامية',
    channelUrl: 'https://www.youtube.com/@nawal_boussaadi',
    avatar: 'https://yt3.googleusercontent.com/ytc/AIdro_lc_Wv9Z_T_9V0f1_j_F_p_9_v_5_v=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '+400K',
    verified: true
  },
  {
    id: 'bournane',
    name: 'الأستاذ بورنان',
    subject: 'تاريخ وجغرافيا',
    channelUrl: 'https://www.youtube.com/@proff_bournane',
    avatar: 'https://yt3.googleusercontent.com/ytc/AIdro_kc_Wv9Z_T_9V0f1_j_F_p_9_v_5_v=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '+600K',
    verified: true
  },
  {
    id: 'saidani',
    name: 'الأستاذ خليل سعيداني',
    subject: 'الفلسفة',
    channelUrl: 'https://www.youtube.com/@KhalilSaidani',
    avatar: 'https://yt3.googleusercontent.com/ytc/AIdro_jc_Wv9Z_T_9V0f1_j_F_p_9_v_5_v=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '+300K',
    verified: true
  }
];

export const STREAM_SUBJECTS: Record<string, Subject[]> = {
  'علوم تجريبية': [
    { id: 101, name: 'العلوم الطبيعية', icon: '🔬', progress: 65, color: 'bg-emerald-500', description: 'المجال 1: التخصص الوظيفي للبروتينات' },
    { id: 102, name: 'الفيزياء', icon: '⚡', progress: 40, color: 'bg-blue-500', description: 'المتابعة الزمنية لتحول كيميائي' },
    { id: 103, name: 'الرياضيات', icon: '📐', progress: 85, color: 'bg-indigo-600', description: 'الدوال العددية، المتتاليات' },
    { id: 104, name: 'اللغة العربية', icon: '📚', progress: 50, color: 'bg-rose-500', description: 'الأدب العربي والبلاغة' },
    { id: 105, name: 'الفلسفة', icon: '🧠', progress: 20, color: 'bg-amber-500', description: 'السؤال العلمي والفلسفي' },
    { id: 106, name: 'تاريخ وجغرافيا', icon: '🗺️', progress: 40, color: 'bg-green-600', description: 'العالم وتوازن القوى' },
    { id: 107, name: 'اللغات الأجنبية', icon: '🌐', progress: 70, color: 'bg-violet-500', description: 'فرنسية وإنجليزية' },
    { id: 108, name: 'العلوم الإسلامية', icon: '🕌', progress: 90, color: 'bg-emerald-600', description: 'العقيدة والشريعة' },
  ],
  'رياضيات': [
    { id: 201, name: 'الرياضيات', icon: '📐', progress: 30, color: 'bg-indigo-700', description: 'الأعداد والحساب، الجبر' },
    { id: 202, name: 'الفيزياء', icon: '⚡', progress: 55, color: 'bg-blue-600', description: 'الظواهر الكهربائية والميكانيكية' },
    { id: 203, name: 'العلوم الطبيعية', icon: '🔬', progress: 45, color: 'bg-emerald-600', description: 'تركيب البروتين، الإنزيمات' },
    { id: 204, name: 'اللغة العربية', icon: '📚', progress: 60, color: 'bg-rose-500', description: 'الأدب العربي والبلاغة' },
    { id: 205, name: 'الفلسفة', icon: '🧠', progress: 25, color: 'bg-amber-500', description: 'فلسفة الرياضيات والمنطق' },
    { id: 206, name: 'تاريخ وجغرافيا', icon: '🗺️', progress: 50, color: 'bg-green-600', description: 'تطور العالم ما بعد 1945' },
    { id: 207, name: 'اللغات الأجنبية', icon: '🌐', progress: 65, color: 'bg-violet-500', description: 'فرنسية وإنجلزية' },
  ],
  'تقني رياضي': [
    { id: 301, name: 'الرياضيات', icon: '📐', progress: 50, color: 'bg-indigo-600', description: 'الدوال والمنحنيات البيانية' },
    { id: 302, name: 'التكنولوجيا', icon: '⚙️', progress: 45, color: 'bg-orange-500', description: 'هندسة ميكانيكية/كهربائية/مدنية/طرائق' },
    { id: 303, name: 'الفيزياء', icon: '⚡', progress: 35, color: 'bg-blue-500', description: 'تحولات الطاقة والكهرباء' },
    { id: 304, name: 'اللغة العربية', icon: '📚', progress: 55, color: 'bg-rose-500', description: 'الأدب العربي' },
    { id: 305, name: 'الفلسفة', icon: '🧠', progress: 20, color: 'bg-amber-500', description: 'المشكلة والاشكالية' },
    { id: 306, name: 'تاريخ وجغرافيا', icon: '🗺️', progress: 45, color: 'bg-green-600', description: 'الثورة التحريرية الكبرى' },
    { id: 307, name: 'اللغات الأجنبية', icon: '🌐', progress: 70, color: 'bg-violet-500', description: 'اللغات الأساسية' },
  ],
  'تسيير واقتصاد': [
    { id: 401, name: 'اقتصاد ومناجمنت', icon: '📊', progress: 40, color: 'bg-cyan-600', description: 'السوق، الأسعار، النقود' },
    { id: 402, name: 'تسيير محاسبي ومالي', icon: '💰', progress: 55, color: 'bg-emerald-600', description: 'أعمال نهاية السنة والميزانية' },
    { id: 403, name: 'الرياضيات', icon: '📐', progress: 65, color: 'bg-indigo-500', description: 'الإحصاء والاحتمالات' },
    { id: 404, name: 'القانون', icon: '⚖️', progress: 30, color: 'bg-slate-600', description: 'عقود العمل، الشركات التجارية' },
    { id: 405, name: 'اللغة العربية', icon: '📚', progress: 50, color: 'bg-rose-500', description: 'البلاغة والنقد الأدبي' },
    { id: 406, name: 'الفلسفة', icon: '🧠', progress: 25, color: 'bg-amber-500', description: 'المنطق والتحليل' },
    { id: 407, name: 'تاريخ وجغرافيا', icon: '🗺️', progress: 45, color: 'bg-green-600', description: 'الجزائر والعالم' },
    { id: 408, name: 'اللغات الأجنبية', icon: '🌐', progress: 60, color: 'bg-violet-500', description: 'اللغات الحية' },
  ],
  'آداب وفلسفة': [
    { id: 501, name: 'الفلسفة', icon: '🧠', progress: 70, color: 'bg-amber-600', description: 'الإحساس والإدراك، الذاكرة، الخيال' },
    { id: 502, name: 'اللغة العربية', icon: '📚', progress: 80, color: 'bg-rose-600', description: 'تحليل النصوص، القواعد، العروض' },
    { id: 503, name: 'تاريخ وجغرافيا', icon: '🗺️', progress: 40, color: 'bg-green-600', description: 'تاريخ الجزائر الحديث، الجغرافيا الاقتصادية' },
    { id: 504, name: 'اللغات الأجنبية', icon: '🌐', progress: 60, color: 'bg-violet-600', description: 'فرنسية وإنجليزية مكثفة' },
    { id: 505, name: 'العلوم الإسلامية', icon: '🕌', progress: 90, color: 'bg-emerald-500', description: 'مقاصد الشريعة والعقيدة' },
  ],
  'لغات أجنبية': [
    { id: 601, name: 'اللغات الأجنبية', icon: '🌐', progress: 60, color: 'bg-violet-600', description: 'اللغة الثالثة + الفرنسية والإنجليزية' },
    { id: 602, name: 'اللغة العربية', icon: '📚', progress: 75, color: 'bg-rose-500', description: 'الأدب المهجري والالتزام' },
    { id: 603, name: 'الفلسفة', icon: '🧠', progress: 30, color: 'bg-amber-500', description: 'فلسفة اللغة والجمال' },
    { id: 604, name: 'تاريخ وجغرافيا', icon: '🗺️', progress: 50, color: 'bg-green-600', description: 'العلاقات الدولية الكبرى' },
    { id: 605, name: 'العلوم الإسلامية', icon: '🕌', progress: 85, color: 'bg-emerald-500', description: 'القيم الإسلامية' },
  ],
  'فنون': [
    { id: 701, name: 'الفنون التخصصية', icon: '🎭', progress: 40, color: 'bg-fuchsia-600', description: 'موسيقى، رسم، مسرح، أو سينما' },
    { id: 702, name: 'الثقافة الفنية', icon: '🎨', progress: 30, color: 'bg-pink-500', description: 'تاريخ الفنون والنقد الجمالي' },
    { id: 703, name: 'اللغة العربية', icon: '📚', progress: 60, color: 'bg-rose-500', description: 'اللغة والأدب' },
    { id: 704, name: 'الفلسفة', icon: '🧠', progress: 50, color: 'bg-amber-500', description: 'فلسفة الإبداع والجمال' },
    { id: 705, name: 'تاريخ وجغرافيا', icon: '🗺️', progress: 45, color: 'bg-green-600', description: 'الجغرافيا العالمية والتاريخ' },
  ]
};

const now = new Date();
const lastWeek = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();

export const SUMMARIES_DATA: Summary[] = [
  { 
    id: 1, 
    title: 'ملخص الوحدة الأولى: الميكانيك', 
    subject: 'الفيزياء', 
    author: 'أ. بوالريش', 
    downloads: 15400, 
    rating: 4.9, 
    commentsCount: 124,
    icon: '🚀', 
    color: 'bg-blue-500', 
    fileSize: '2.4 MB', 
    streams: ['علوم تجريبية', 'رياضيات', 'تقني رياضي'], 
    uploadDate: lastWeek,
    previewSnippet: `تتناول هذه الوحدة دراسة حركة الأجسام الصلبة وتطبيق قوانين نيوتن الثلاثة.[PAGE]المرحلة الثانية تشمل دراسة حركة الكواكب والأقمار الاصطناعية وتفسير القوة الجاذبة المركزية.[PAGE]المرحلة الثالثة تتطرق إلى حركة السقوط الشاقولي الحقيقي والحر في الهواء.`
  },
  { 
    id: 2, 
    title: 'كل أفكار المتتاليات في ورقة واحدة', 
    subject: 'الرياضيات', 
    author: 'أ. نور الدين', 
    downloads: 28900, 
    rating: 5.0, 
    commentsCount: 450,
    icon: '📈', 
    color: 'bg-indigo-600', 
    fileSize: '1.1 MB', 
    streams: ['علوم تجريبية', 'رياضيات', 'تقني رياضي', 'تسيير واقتصاد'], 
    uploadDate: now.toISOString(),
    previewSnippet: `المتتاليات الحسابية والهندسية، إثبات التقارب والاستدلال بالتراجع...[PAGE]دراسة اتجاه التغير وحساب المجموع للنهايات الشهيرة.`
  },
  { 
    id: 4, 
    title: 'بنك دروس وملخصات الفلسفة الشامل', 
    subject: 'الفلسفة', 
    author: 'منصة dzexams', 
    downloads: 45000, 
    rating: 5.0, 
    commentsCount: 850,
    icon: '🧠', 
    color: 'bg-amber-500', 
    fileSize: 'مجموعة روابط', 
    streams: ['آداب وفلسفة', 'لغات أجنبية', 'علوم تجريبية'], 
    uploadDate: now.toISOString(),
    url: 'https://www.dzexams.com/ar/3as/philosophie/cours',
    previewSnippet: `بنك شامل لجميع دروس وملخصات مادة الفلسفة للسنة الثالثة ثانوي...[PAGE]يحتوي هذا البنك على مقالات جاهزة للمنهجية الجديدة 2025.`
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    author: "محمد إبراهيم",
    time: "منذ ساعتين",
    content: "يا جماعة، هل عندكم ملخصات مليحة لدرس 'الظواهر الكهربائية' في الفيزياء؟ راني حاصل شوية في الدارة RC.",
    likes: 12,
    comments: 5,
    tag: "طلب مساعدة",
    avatarSeed: "mohammed"
  },
  {
    id: 2,
    author: "سارة بن علي",
    time: "منذ 5 ساعات",
    content: "تم بفضل الله إكمال مراجعة الوحدة الأولى في العلوم. نصيحة: ركزوا بزاف على الرسومات التخطيطية لأنها مفتاح النقاط!",
    likes: 45,
    comments: 12,
    tag: "نصيحة",
    avatarSeed: "sara"
  }
];

export const AI_SYSTEM_INSTRUCTION = `
أنت مساعد تعليمي ذكي لمنصة "DzairEdu Pro" المتخصصة في البكالوريا الجزائرية (3AS). 
- اسمك "مساعد دزاير إيدو الذكي".
- لغتك هي العربية الرسمية مع لمسة خفيفة من الدارجة الجزائرية المهذبة للتقرب من الطالب.
- تخصصك هو تقديم شروحات، حلول تمارين، وملخصات للبرنامج الدراسي الجزائري لجميع الشعب السبع المعتمدة رسمياً.
- كن مشجعاً، إيجابياً، وصبوراً.
- إذا سألك الطالب عن درس، قدم له أهم النقاط فيه.
- إذا طلب حل تمرين، حاول توجيهه بدلاً من إعطائه الحل المباشر فوراً.
`;
