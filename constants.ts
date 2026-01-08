
export const DEFAULT_SETTINGS = {
  // --- إعدادات الأرباح والوقت ---
  miningRatePerSession: 0.00550000, // ربح الجلسة الواحدة (3 ساعات)
  sessionDurationMs: 3 * 60 * 60 * 1000, // مدة الجلسة (3 ساعات بالملي ثانية)
  
  // --- إعدادات مالية ---
  referralCommission: 10, // عمولة الإحالة 10%
  minWithdrawal: 0.10000000, // الحد الأدنى للسحب
  dailyGiftAmount: 0.00150000, // مبلغ الهدية اليومية
  
  // --- إعدادات تقنية (يجب تعديلها من لوحة التحكم لاحقاً أو هنا) ---
  adsgramBlockId: '3946', // معرف الإعلانات الخاص بك من Adsgram
  adminBotToken: '', // توكن البوت الخاص بالإشعارات من @BotFather
  adminChatId: '', // معرف حسابك تليجرام لتصلك عليه رسائل السحب
  adminPassword: '123', // كلمة مرور لوحة التحكم الافتراضية
  
  // --- قائمة المهام الافتراضية ---
  tasks: [
    { id: 'ad1', title: 'مشاهدة إعلان سريع 1', reward: 0.00015000, type: 'ad' },
    { id: 'ad2', title: 'مشاهدة إعلان سريع 2', reward: 0.00020000, type: 'ad' },
    { id: 'join_tg', title: 'الانضمام لقناة المشروع الرسمية', reward: 0.00100000, type: 'social' },
  ]
};

export const UPDATE_INTERVAL_MS = 1000;
export const DAY_IN_MS = 24 * 60 * 60 * 1000;
