export const STORAGE_KEY = "scrollcheck_eggs_v1";

export const EASTER_EGGS = [
  {
    id: "turbo_battery",
    title: "الشحن التوربو",
    hint: "اضغط بسرعة على بطارية المخ 5 مرات ورا بعض",
    message: "فتحت وضع الشحن التوربو.. البطارية لبست النضارة وركّزت 100%",
  },
  {
    id: "extreme_routine",
    title: "أقصى يمين أو أقصى شمال",
    hint: "اسحب السلايدرز لآخرها خالص في السهر أو في الروقان",
    message: "وصلت لأقصى روتين ممكن في السيستم",
  },
  {
    id: "detox_master",
    title: "بطل الديتوكس",
    hint: "شغّل كل خطوات الديتوكس السريعة مع بعض",
    message: "قفلّت خطوات الديتوكس كلها.. ده يوم مثالي على الورق",
  },
  {
    id: "nokia_mode",
    title: "وضع نوكيا 3310",
    hint: "اكتب كلمة nokia أو detox على الكيبورد في أي مكان",
    message: "مبروك فتحت وضع نوكيا كشاف.. البطارية هتقعد أسبوعين من غير شاحن",
  },
  {
    id: "twin_ping",
    title: "توأم السهر",
    hint: "اضغط على شارة نسبة التشابه بتاعة توأمك تحت الخريطة",
    message: "بعتناله سلام.. شكله فاتح الموبايل دلوقتي زيك بالظبط",
  },
];

export function loadUnlockedEggs() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid = new Set(EASTER_EGGS.map((e) => e.id));
    return parsed.filter((id) => valid.has(id));
  } catch {
    return [];
  }
}

export function saveUnlockedEggs(ids) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage quota or private-mode restrictions
  }
}
