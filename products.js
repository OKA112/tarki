/* ==========================================================================
   TARKI — product database (62 items)
   Each product:
     id, nameRu/En, category, price, materials[], capacity, sizeRu/En,
     isNew, isBestseller, images[], shortDescRu/En, descRu/En, specs[],
     finishes[], fabrics[]
   ========================================================================== */

// Two-level hierarchy: parent groups → categories (subcategories)
// Parents now mirror the two site modes — Home vs Outdoor — plus a small
// decor parent that's universal to both.
window.TARKI_PARENTS = [
  { id: 'home',    ru: 'Для дома',          en: 'For home' },
  { id: 'garden',  ru: 'Для дачи и сада',   en: 'For dacha & garden' },
  { id: 'decor',   ru: 'Текстиль и декор',  en: 'Textile & decor' }
];

window.TARKI_CATEGORIES = [
  // ----- Home (interior furniture) -----
  { id: 'armchairs', parent: 'home',   ru: 'Кресла',                  en: 'Armchairs' },
  { id: 'sofas',     parent: 'home',   ru: 'Диваны',                  en: 'Sofas' },
  { id: 'beds',      parent: 'home',   ru: 'Кровати',                 en: 'Beds' },
  { id: 'dining',    parent: 'home',   ru: 'Обеденные группы',        en: 'Dining sets' },
  { id: 'storage',   parent: 'home',   ru: 'Шкафы и хранение',        en: 'Storage' },
  // ----- Garden (outdoor furniture) -----
  { id: 'terraces',  parent: 'garden', ru: 'Террасы',                 en: 'Terraces' },
  { id: 'loungers',  parent: 'garden', ru: 'Лежаки и кушетки',        en: 'Loungers & daybeds' },
  { id: 'pavilions', parent: 'garden', ru: 'Беседки',                 en: 'Pavilions' },
  { id: 'swings',    parent: 'garden', ru: 'Садовые качели и гамаки', en: 'Garden swings & hammocks' },
  // ----- Decor (universal) -----
  { id: 'pillows',   parent: 'decor',  ru: 'Подушки и пледы',         en: 'Pillows & throws' },
  { id: 'rugs',      parent: 'decor',  ru: 'Дорожки и ковры',         en: 'Runners & rugs' }
];

window.TARKI_MATERIALS = [
  // Wood
  { id: 'oak',      ru: 'Дуб',                  en: 'Oak' },
  { id: 'ash',      ru: 'Ясень',                en: 'Ash' },
  { id: 'teak',     ru: 'Тик',                  en: 'Teak' },
  { id: 'linden',   ru: 'Липа',                 en: 'Linden' },
  // Textile
  { id: 'linen',    ru: 'Лён',                  en: 'Linen' },
  { id: 'wool',     ru: 'Шерсть',               en: 'Wool' },
  { id: 'velour',   ru: 'Велюр',                en: 'Velour' },
  // Metals & outdoor
  { id: 'aluminum', ru: 'Алюминий',             en: 'Aluminum' },
  { id: 'steel',    ru: 'Сталь',                en: 'Steel' },
  { id: 'rattan',   ru: 'Искусственный ротанг', en: 'Synthetic rattan' },
  { id: 'polymer',  ru: 'Полимер',              en: 'Polymer' },
  { id: 'brass',    ru: 'Латунь',               en: 'Brass' },
  // Decorative
  { id: 'ceramic',  ru: 'Керамика',             en: 'Ceramic' },
  { id: 'glass',    ru: 'Стекло',               en: 'Glass' }
];

// Curated working image set — rotated across products
const IMG = {
  terrace1: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1400&q=80',
  terrace2: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
  lounge1:  'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1400&q=80',
  lounge2:  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80',
  chair1:   'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1400&q=80',
  dining1:  'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1400&q=80',
  textile1: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=1400&q=80',
  mountain: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1400&q=80',
  // Picsum stand-ins for variety
  p: (seed) => `https://picsum.photos/seed/tarki-${seed}/1400/1050`
};

// Shared finish & fabric swatches
const FINISHES = [
  { id: 'oil-wax',  ru: 'Масло-воск (натуральный)', en: 'Oil-wax (natural)',     swatch: '#B8975C' },
  { id: 'walnut',   ru: 'Орех',                     en: 'Walnut',                swatch: '#5C3A1E' },
  { id: 'smoked',   ru: 'Копчёный дуб',             en: 'Smoked oak',            swatch: '#2C2620' },
  { id: 'whitewash',ru: 'Беленый',                  en: 'Whitewash',             swatch: '#E8DDC8' }
];
const FABRICS = [
  { id: 'linen-nat', ru: 'Лён натуральный',  en: 'Natural linen',  swatch: '#E3D9C6' },
  { id: 'linen-clay',ru: 'Лён терракота',     en: 'Terracotta linen',swatch: '#B45A2A' },
  { id: 'linen-ink', ru: 'Лён графит',        en: 'Graphite linen', swatch: '#2A2520' },
  { id: 'wool-ochre',ru: 'Шерсть охра',        en: 'Ochre wool',     swatch: '#C28A2C' }
];

// ----- specs builders -----
function specsSeating(dims, weightKg, capacity) {
  return [
    { ru: 'Габариты',           en: 'Dimensions',          valueRu: dims + ' см', valueEn: dims + ' cm' },
    { ru: 'Каркас',             en: 'Frame',               valueRu: 'Массив дуба, сушка 90 дней', valueEn: 'Solid oak, 90-day air-dry' },
    { ru: 'Обивка',             en: 'Upholstery',          valueRu: 'Лён двойного плетения', valueEn: 'Double-woven linen' },
    { ru: 'Наполнитель',        en: 'Filling',             valueRu: 'Овечья шерсть + кокосовая койра', valueEn: 'Sheep wool + coconut coir' },
    { ru: 'Вес',                en: 'Weight',              valueRu: weightKg + ' кг', valueEn: weightKg + ' kg' },
    { ru: 'Вместимость',        en: 'Capacity',            valueRu: capacity + ' чел.', valueEn: capacity + ' person(s)' },
    { ru: 'Срок изготовления',  en: 'Lead time',           valueRu: '4–6 недель', valueEn: '4–6 weeks' },
    { ru: 'Гарантия',           en: 'Warranty',            valueRu: '7 лет', valueEn: '7 years' }
  ];
}
function specsDining(dims, capacity, weightKg) {
  return [
    { ru: 'Габариты столешницы', en: 'Top size',           valueRu: dims + ' см', valueEn: dims + ' cm' },
    { ru: 'Высота',              en: 'Height',             valueRu: '75 см', valueEn: '75 cm' },
    { ru: 'Материал столешницы', en: 'Top material',       valueRu: 'Массив дуба 45 мм', valueEn: '45mm solid oak' },
    { ru: 'Подстолье',           en: 'Base',               valueRu: 'Латунированная сталь', valueEn: 'Brass-finished steel' },
    { ru: 'Финиш',               en: 'Finish',             valueRu: 'Натуральный масло-воск', valueEn: 'Natural oil-wax' },
    { ru: 'Вместимость',         en: 'Seats',              valueRu: 'До ' + capacity + ' человек', valueEn: 'Up to ' + capacity },
    { ru: 'Вес',                 en: 'Weight',             valueRu: weightKg + ' кг', valueEn: weightKg + ' kg' },
    { ru: 'Срок изготовления',   en: 'Lead time',          valueRu: '5–8 недель', valueEn: '5–8 weeks' }
  ];
}
function specsPavilion(dims, capacity) {
  return [
    { ru: 'Габариты',          en: 'Dimensions',           valueRu: dims + ' м', valueEn: dims + ' m' },
    { ru: 'Каркас',            en: 'Frame',                valueRu: 'Клееный дуб 120×120 мм', valueEn: 'Glulam oak 120×120 mm' },
    { ru: 'Кровля',            en: 'Roof',                 valueRu: 'Кедровая дранка',         valueEn: 'Cedar shake' },
    { ru: 'Фурнитура',         en: 'Hardware',             valueRu: 'Кубачинская латунь',      valueEn: 'Kubachi-forged brass' },
    { ru: 'Вместимость',       en: 'Capacity',             valueRu: capacity + ' человек', valueEn: capacity + ' guests' },
    { ru: 'Срок изготовления', en: 'Lead time',            valueRu: '10–14 недель', valueEn: '10–14 weeks' },
    { ru: 'Монтаж',            en: 'Assembly',             valueRu: 'Бригадой ТАРКИ, 3–5 дней', valueEn: 'TARKI crew, 3–5 days' },
    { ru: 'Гарантия',          en: 'Warranty',             valueRu: '10 лет', valueEn: '10 years' }
  ];
}
function specsBed(dims, mattressDims, weightKg) {
  return [
    { ru: 'Габариты',           en: 'Dimensions',     valueRu: dims + ' см',         valueEn: dims + ' cm' },
    { ru: 'Спальное место',     en: 'Mattress size',  valueRu: mattressDims + ' см', valueEn: mattressDims + ' cm' },
    { ru: 'Каркас',             en: 'Frame',          valueRu: 'Массив дуба, шкантовое соединение', valueEn: 'Solid oak, dowel-jointed' },
    { ru: 'Изголовье',          en: 'Headboard',      valueRu: 'Льняная обивка, наполнитель — пенополиуретан', valueEn: 'Linen upholstery, foam padding' },
    { ru: 'Основание',          en: 'Slat base',      valueRu: 'Ламели берёзовые, 24 шт.', valueEn: '24 birch slats' },
    { ru: 'Вес',                en: 'Weight',         valueRu: weightKg + ' кг',    valueEn: weightKg + ' kg' },
    { ru: 'Срок изготовления',  en: 'Lead time',      valueRu: '4–6 недель',         valueEn: '4–6 weeks' },
    { ru: 'Гарантия',           en: 'Warranty',       valueRu: '7 лет',              valueEn: '7 years' }
  ];
}
function specsStorage(dims, weightKg, compartments) {
  return [
    { ru: 'Габариты',           en: 'Dimensions',         valueRu: dims + ' см',      valueEn: dims + ' cm' },
    { ru: 'Корпус',             en: 'Body',               valueRu: 'Массив дуба 22 мм', valueEn: '22mm solid oak' },
    { ru: 'Внутреннее наполнение', en: 'Interior',        valueRu: compartments,      valueEn: compartments },
    { ru: 'Фурнитура',          en: 'Hardware',           valueRu: 'Латунированные ручки и петли', valueEn: 'Brass-finished handles and hinges' },
    { ru: 'Финиш',              en: 'Finish',             valueRu: 'Натуральный масло-воск', valueEn: 'Natural oil-wax' },
    { ru: 'Вес',                en: 'Weight',             valueRu: weightKg + ' кг', valueEn: weightKg + ' kg' },
    { ru: 'Срок изготовления',  en: 'Lead time',          valueRu: '5–7 недель',     valueEn: '5–7 weeks' },
    { ru: 'Гарантия',           en: 'Warranty',           valueRu: '7 лет',          valueEn: '7 years' }
  ];
}
function specsTextile(size, materialRu, materialEn) {
  return [
    { ru: 'Размер',     en: 'Size',     valueRu: size + ' см', valueEn: size + ' cm' },
    { ru: 'Материал',   en: 'Material', valueRu: materialRu,   valueEn: materialEn },
    { ru: 'Плотность',  en: 'Weight',   valueRu: '320 г/м²',   valueEn: '320 g/m²' },
    { ru: 'Уход',       en: 'Care',     valueRu: 'Холодная стирка', valueEn: 'Cold wash' },
    { ru: 'Изготовление', en: 'Origin', valueRu: 'Ставрополье / Дагестан', valueEn: 'Stavropol / Dagestan' },
    { ru: 'Гарантия',   en: 'Warranty', valueRu: '2 года', valueEn: '2 years' }
  ];
}

// ----- Product factory ----------------------------------------------
// `isDemo: true` is set on every product created by the legacy `P()` factory.
// Real products go through `R()` (defined further down) which sets isDemo=false.
// This lets us toggle demo visibility from one place — useful while we
// gradually replace the demo catalog with real items.
function P(o) {
  return Object.assign({
    isDemo: true,
    isNew: false,
    isBestseller: false,
    finishes: ['oil-wax', 'walnut', 'smoked'],
    fabrics:  ['linen-nat', 'linen-clay', 'linen-ink', 'wool-ochre'],
    reviews: []
  }, o);
}

// ============================================================
// 1. ТЕРРАСЫ (10)
// ============================================================
const TERRACES = [
  P({ id: 'terrace-tarki',  nameRu: 'Терраса «Тарки»',   nameEn: 'Tarki Terrace',     category: 'terraces', price:  86000, materials: ['aluminum','rattan','linen'],  capacity: 4, sizeRu: '240×180 см', sizeEn: '240×180 cm', isBestseller: true,
       images: [IMG.terrace1, IMG.terrace2, IMG.p('terrace-tarki-a'), IMG.p('terrace-tarki-b')],
       shortDescRu: 'Угловой террасный комплект для четверых.', shortDescEn: 'Corner terrace set for four.',
       descRu: 'Каркас — алюминиевый профиль с порошковой окраской, плетение — искусственный ротанг, подушки в съёмных льняных чехлах. Не боится дождя, солнца и перепадов температур.',
       descEn: 'Powder-coated aluminum frame, synthetic rattan weave, cushions in removable linen covers. Resists rain, sun and temperature swings.',
       specs: specsSeating('240×180×72', 38, 4) }),
  P({ id: 'terrace-gunib',  nameRu: 'Терраса «Гуниб»',   nameEn: 'Gunib Terrace',     category: 'terraces', price: 124000, materials: ['oak','linen'],  capacity: 5, sizeRu: '300×200 см', sizeEn: '300×200 cm',
       images: [IMG.terrace2, IMG.terrace1, IMG.p('terrace-gunib-a')],
       shortDescRu: 'П-образная терраса для большой семьи.', shortDescEn: 'U-shaped terrace for a large family.',
       descRu: 'П-образный модуль с глубокой посадкой и съёмными чехлами. Можно собрать в любую конфигурацию — от линейного дивана до большого «острова» под крышей беседки.',
       descEn: 'U-shaped module with deep seating and removable covers. Modular — from a simple bench to a large island under the pavilion.',
       specs: specsSeating('300×200×72', 88, 5) }),
  P({ id: 'terrace-derbent', nameRu: 'Терраса «Дербент»', nameEn: 'Derbent Terrace', category: 'terraces', price: 198000, materials: ['oak','linen','brass'], capacity: 8, sizeRu: '420×220 см', sizeEn: '420×220 cm',
       images: [IMG.terrace1, IMG.lounge1, IMG.p('terrace-derbent-a')],
       shortDescRu: 'Премиум-комплект на 8 персон с латунными вставками.', shortDescEn: 'Premium 8-seat set with brass details.',
       descRu: 'Флагманский террасный комплект. Латунные кромки кубачинской ковки, две глубокие посадки и центральный модуль-подушка. Создаём в одном экземпляре под точные размеры террасы.',
       descEn: 'Flagship terrace set. Kubachi-forged brass edges, two deep seating zones and a central ottoman. Made-to-measure, one-off.',
       specs: specsSeating('420×220×72', 136, 8) }),
  P({ id: 'terrace-makhachkala', nameRu: 'Терраса «Махачкала»', nameEn: 'Makhachkala Terrace', category: 'terraces', price: 78000, materials: ['aluminum','polymer','linen'], capacity: 3, sizeRu: '200×160 см', sizeEn: '200×160 cm', isNew: true,
       images: [IMG.terrace2, IMG.p('terrace-mhk-a'), IMG.p('terrace-mhk-b')],
       shortDescRu: 'Компактная терраса для городского балкона.', shortDescEn: 'Compact terrace for a city balcony.',
       descRu: 'Алюминиевый каркас, сидения — литой полимер с УФ-защитой. Подходит для балконов и небольших дворов. Складывается за 5 минут.',
       descEn: 'Aluminum frame, UV-stable molded polymer seats. Fits balconies and small yards. Folds in 5 minutes.',
       specs: specsSeating('200×160×70', 22, 3) }),
  P({ id: 'terrace-kaspii', nameRu: 'Терраса «Каспий»', nameEn: 'Kaspii Terrace', category: 'terraces', price: 112000, materials: ['teak','linen'], capacity: 4, sizeRu: '260×180 см', sizeEn: '260×180 cm',
       images: [IMG.terrace1, IMG.lounge2, IMG.p('terrace-kaspii-a')],
       shortDescRu: 'Тиковая терраса для побережья.', shortDescEn: 'Teak terrace for the seaside.',
       descRu: 'Цельный тик из выдержанной древесины. Не боится солёных брызг и южного солнца. Финиш — натуральное тиковое масло.',
       descEn: 'Aged solid teak. Resistant to salt spray and southern sun. Finished with natural teak oil.',
       specs: specsSeating('260×180×72', 72, 4) }),
  P({ id: 'terrace-khunzakh', nameRu: 'Терраса «Хунзах»', nameEn: 'Khunzakh Terrace', category: 'terraces', price:  68000, materials: ['linden','linen'], capacity: 3, sizeRu: '180×160 см', sizeEn: '180×160 cm',
       images: [IMG.terrace2, IMG.p('terrace-khunzakh-a')],
       shortDescRu: 'Лёгкая терраса для дачи выходного дня.', shortDescEn: 'Light terrace for weekend getaways.',
       descRu: 'Минималистичный набор из липы со съёмной обивкой. Подойдёт для летней дачи, которую вы используете несколько месяцев в году.',
       descEn: 'Minimal linden set with removable covers. Made for seasonal-use cottages.',
       specs: specsSeating('180×160×70', 28, 3) }),
  P({ id: 'terrace-sulak', nameRu: 'Терраса «Сулак»', nameEn: 'Sulak Terrace', category: 'terraces', price:  94000, materials: ['oak','wool'], capacity: 4, sizeRu: '240×180 см', sizeEn: '240×180 cm',
       images: [IMG.terrace1, IMG.p('terrace-sulak-a')],
       shortDescRu: 'Терраса с шерстяной обивкой для прохладных вечеров.', shortDescEn: 'Wool-upholstered terrace for cool evenings.',
       descRu: 'Шерстяная обивка натуральных оттенков. Идеально для горных дач, где ночи прохладные даже летом.',
       descEn: 'Wool upholstery in natural tones. Made for mountain cottages where summer nights are cool.',
       specs: specsSeating('240×180×72', 66, 4) }),
  P({ id: 'terrace-samur', nameRu: 'Терраса «Самур»', nameEn: 'Samur Terrace', category: 'terraces', price: 142000, materials: ['oak','linen','brass'], capacity: 6,  sizeRu: '320×200 см', sizeEn: '320×200 cm',
       images: [IMG.terrace2, IMG.terrace1, IMG.p('terrace-samur-a')],
       shortDescRu: 'Терраса для шестерых с латунными ножками.', shortDescEn: 'Six-seater with brass legs.',
       descRu: 'Шесть глубоких сидений и латунные ножки. Подходит для длинных южных террас и патио.',
       descEn: 'Six deep seats and brass feet. Designed for long southern terraces and patios.',
       specs: specsSeating('320×200×72', 102, 6) }),
  P({ id: 'terrace-tsurib', nameRu: 'Терраса «Цуриб»', nameEn: 'Tsurib Terrace', category: 'terraces', price:  82000, materials: ['aluminum','rattan'],  capacity: 3, sizeRu: '220×160 см', sizeEn: '220×160 cm',
       images: [IMG.lounge1, IMG.p('terrace-tsurib-a')],
       shortDescRu: 'Угловой модуль с открытым подлокотником.', shortDescEn: 'Corner module with open armrest.',
       descRu: 'Алюминиевый каркас, плетение из искусственного ротанга. Открытый подлокотник можно использовать как столик для книги или чашки чая.',
       descEn: 'Aluminum frame, synthetic rattan weave. The open armrest doubles as a side table for a book or a cup of tea.',
       specs: specsSeating('220×160×72', 28, 3) }),
  P({ id: 'terrace-chirkey', nameRu: 'Терраса «Чиркей»', nameEn: 'Chirkey Terrace', category: 'terraces', price: 108000, materials: ['teak','wool'], capacity: 4, sizeRu: '260×190 см', sizeEn: '260×190 cm', isNew: true,
       images: [IMG.terrace1, IMG.lounge2, IMG.p('terrace-chirkey-a')],
       shortDescRu: 'Тик + шерсть для прибрежных дач.', shortDescEn: 'Teak + wool for lakeside houses.',
       descRu: 'Соединение тика и шерсти — для домов у воды. Не боится туманов и сырости.',
       descEn: 'Teak meets wool — for waterfront homes. Resistant to mist and damp.',
       specs: specsSeating('260×190×72', 74, 4) })
];

// ============================================================
// 2. ЛЕЖАКИ И КУШЕТКИ (10)
// ============================================================
const LOUNGERS = [
  P({ id: 'lounger-bazarduzi', nameRu: 'Лежак «Базардюзи»', nameEn: 'Bazarduzi Lounger', category: 'loungers', price: 38000, materials: ['aluminum','polymer'], capacity: 1, sizeRu: '200×80 см', sizeEn: '200×80 cm',
       images: [IMG.lounge1, IMG.lounge2, IMG.p('lounger-bzd-a')],
       shortDescRu: 'Классический односпальный лежак с регулируемой спинкой.', shortDescEn: 'Classic single lounger with adjustable back.',
       descRu: 'Алюминиевый каркас, литое полимерное сиденье. Регулируемая спинка в 5 положениях. Колёса для удобства перемещения. Не выгорает на солнце.',
       descEn: 'Aluminum frame, molded polymer seat. Adjustable back, 5 positions. Wheels for easy moving. UV-stable.',
       specs: specsSeating('200×80×38', 12, 1) }),
  P({ id: 'lounger-shalbuzdag', nameRu: 'Лежак «Шалбуздаг»', nameEn: 'Shalbuzdag Lounger', category: 'loungers', price: 44000, materials: ['oak','wool'], capacity: 1, sizeRu: '210×85 см', sizeEn: '210×85 cm', isBestseller: true,
       images: [IMG.lounge2, IMG.lounge1, IMG.p('lounger-shl-a')],
       shortDescRu: 'Лежак с шерстяным матрасом — наш бестселлер.', shortDescEn: 'Wool-mattress lounger — our bestseller.',
       descRu: 'Толстый матрас из овечьей шерсти. Один из самых популярных лежаков — клиенты часто берут парами.',
       descEn: 'Thick sheep-wool mattress. One of our most-ordered loungers — usually bought in pairs.',
       specs: specsSeating('210×85×40', 28, 1) }),
  P({ id: 'lounger-untsukul', nameRu: 'Кушетка «Унцукуль»', nameEn: 'Untsukul Daybed', category: 'loungers', price: 72000, materials: ['oak','linen'], capacity: 2, sizeRu: '200×120 см', sizeEn: '200×120 cm',
       images: [IMG.lounge1, IMG.terrace1, IMG.p('lounger-unt-a')],
       shortDescRu: 'Двухместная кушетка с резными подлокотниками.', shortDescEn: 'Two-seat daybed with carved armrests.',
       descRu: 'Резьба по подлокотникам — классическая унцукульская насечка по дереву серебром.',
       descEn: 'Armrests feature traditional Untsukul silver-inlay wood carving.',
       specs: specsSeating('200×120×42', 46, 2) }),
  P({ id: 'lounger-kubachi', nameRu: 'Лежак «Кубачи»', nameEn: 'Kubachi Lounger', category: 'loungers', price: 58000, materials: ['oak','linen','brass'], capacity: 1, sizeRu: '205×85 см', sizeEn: '205×85 cm', isNew: true,
       images: [IMG.lounge1, IMG.p('lounger-kub-a'), IMG.p('lounger-kub-b')],
       shortDescRu: 'Лежак с латунными вставками.', shortDescEn: 'Lounger with brass inlays.',
       descRu: 'Латунные вставки на изголовье — фирменный кубачинский узор. На каждой вставке — клеймо мастера.',
       descEn: 'Brass inlays on the headrest — signature Kubachi pattern. Each carries the maker\'s mark.',
       specs: specsSeating('205×85×40', 26, 1) }),
  P({ id: 'lounger-balkhar', nameRu: 'Лежак «Балхар»', nameEn: 'Balkhar Lounger', category: 'loungers', price: 36000, materials: ['aluminum','rattan'], capacity: 1, sizeRu: '195×75 см', sizeEn: '195×75 cm',
       images: [IMG.lounge2, IMG.p('lounger-blr-a')],
       shortDescRu: 'Лёгкий лежак для бассейна.', shortDescEn: 'Light poolside lounger.',
       descRu: 'Алюминиевый каркас, плетение из искусственного ротанга. Не боится воды и хлорки. Можно оставлять под открытым небом весь сезон.',
       descEn: 'Aluminum frame, synthetic rattan weave. Resistant to water and chlorine. Stays outdoors all season.',
       specs: specsSeating('195×75×38', 9, 1) }),
  P({ id: 'lounger-gimry', nameRu: 'Кушетка «Гимры»', nameEn: 'Gimry Daybed', category: 'loungers', price: 86000, materials: ['oak','linen'], capacity: 2, sizeRu: '210×130 см', sizeEn: '210×130 cm',
       images: [IMG.terrace1, IMG.lounge1, IMG.p('lounger-gim-a')],
       shortDescRu: 'Просторная кушетка с балдахином.', shortDescEn: 'Spacious daybed with canopy.',
       descRu: 'Может комплектоваться льняным балдахином на четырёх стойках. Для глубокого послеобеденного сна.',
       descEn: 'Comes with optional linen canopy on four posts. For deep afternoon naps.',
       specs: specsSeating('210×130×42', 58, 2) }),
  P({ id: 'lounger-shamil', nameRu: 'Лежак «Шамиль»', nameEn: 'Shamil Lounger', category: 'loungers', price: 52000, materials: ['teak','linen'], capacity: 1, sizeRu: '210×80 см', sizeEn: '210×80 cm',
       images: [IMG.lounge1, IMG.lounge2],
       shortDescRu: 'Тиковый лежак для прибрежных вилл.', shortDescEn: 'Teak lounger for seaside villas.',
       descRu: 'Цельный тик. Подходит для прибрежных вилл — не боится солёных брызг и хлорки.',
       descEn: 'Solid teak. Suited for seaside villas — resists salt spray and chlorine.',
       specs: specsSeating('210×80×40', 30, 1) }),
  P({ id: 'lounger-andi', nameRu: 'Кушетка «Анди»', nameEn: 'Andi Daybed', category: 'loungers', price: 98000, materials: ['oak','wool'], capacity: 2, sizeRu: '220×140 см', sizeEn: '220×140 cm',
       images: [IMG.lounge2, IMG.terrace1],
       shortDescRu: 'Кушетка с шерстяными подушками.', shortDescEn: 'Daybed with wool cushions.',
       descRu: 'Четыре шерстяные подушки и плотный матрас. Подходит как гостевая кровать на лето.',
       descEn: 'Four wool cushions and a thick mattress. Doubles as a summer guest bed.',
       specs: specsSeating('220×140×44', 62, 2) }),
  P({ id: 'lounger-sogratl', nameRu: 'Лежак «Согратль»', nameEn: 'Sogratl Lounger', category: 'loungers', price: 42000, materials: ['aluminum','rattan'], capacity: 1, sizeRu: '200×85 см', sizeEn: '200×85 cm',
       images: [IMG.lounge2, IMG.p('lounger-sog-a')],
       shortDescRu: 'С откидным подголовником.', shortDescEn: 'With fold-down headrest.',
       descRu: 'Алюминиевый каркас, плетение из ротанга. Откидной подголовник можно использовать как столик для книги.',
       descEn: 'Aluminum frame, rattan weave. The fold-down headrest doubles as a side table for a book.',
       specs: specsSeating('200×85×40', 13, 1) }),
  P({ id: 'lounger-kakhib', nameRu: 'Лежак «Кахиб»', nameEn: 'Kakhib Lounger', category: 'loungers', price: 32000, materials: ['aluminum','polymer'], capacity: 1, sizeRu: '190×75 см', sizeEn: '190×75 cm',
       images: [IMG.lounge1, IMG.p('lounger-kak-a')],
       shortDescRu: 'Самая лёгкая модель — для путешествий.', shortDescEn: 'Lightest model — travel-friendly.',
       descRu: 'Самый лёгкий лежак в коллекции — 6 кг. Алюминиевый каркас и литое полимерное полотно. Складывается, помещается в багажник.',
       descEn: 'Our lightest lounger — 6 kg. Aluminum frame and molded polymer surface. Folds flat, fits in a car boot.',
       specs: specsSeating('190×75×38', 6, 1) })
];

// ============================================================
// 3. КРЕСЛА (12)
// ============================================================
const ARMCHAIRS = [
  P({ id: 'chair-gunib', nameRu: 'Кресло «Гуниб»', nameEn: 'Gunib Armchair', category: 'armchairs', price: 42000, materials: ['ash','linen'], capacity: 1, sizeRu: '78×85 см', sizeEn: '78×85 cm', isBestseller: true,
       images: [IMG.chair1, IMG.p('chair-gun-a'), IMG.p('chair-gun-b')],
       shortDescRu: 'Классическое кресло из ясеня.', shortDescEn: 'Classic ash armchair.',
       descRu: 'Одно из первых наших изделий. Используем тот же чертёж с 2019 года.',
       descEn: 'One of our first pieces. Same drawing in use since 2019.',
       specs: specsSeating('78×85×85', 16, 1) }),
  P({ id: 'chair-khunzakh', nameRu: 'Кресло «Хунзах»', nameEn: 'Khunzakh Armchair', category: 'armchairs', price: 48000, materials: ['oak','linen'], capacity: 1, sizeRu: '82×90 см', sizeEn: '82×90 cm',
       images: [IMG.chair1, IMG.terrace2],
       shortDescRu: 'Кресло с высокой спинкой.', shortDescEn: 'High-back armchair.',
       descRu: 'Высокая спинка с поддержкой шеи. Дубовые подлокотники с латунными гвоздями.',
       descEn: 'High back with neck support. Oak armrests with brass nails.',
       specs: specsSeating('82×90×98', 19, 1) }),
  P({ id: 'chair-tsurib', nameRu: 'Кресло «Цуриб»', nameEn: 'Tsurib Armchair', category: 'armchairs', price: 36000, materials: ['ash','linen'], capacity: 1, sizeRu: '75×80 см', sizeEn: '75×80 cm',
       images: [IMG.chair1, IMG.p('chair-tsr-a')],
       shortDescRu: 'Лёгкое кресло для террасы.', shortDescEn: 'Light terrace armchair.',
       descRu: 'Самое лёгкое кресло — 11 кг. Удобно переносить за подлокотник.',
       descEn: 'Our lightest chair — 11 kg. Easy to carry by the armrest.',
       specs: specsSeating('75×80×82', 11, 1) }),
  P({ id: 'chair-makhachkala', nameRu: 'Кресло «Махачкала»', nameEn: 'Makhachkala Armchair', category: 'armchairs', price: 58000, materials: ['oak','wool'], capacity: 1, sizeRu: '85×92 см', sizeEn: '85×92 cm', isNew: true,
       images: [IMG.chair1, IMG.lounge1, IMG.p('chair-mhk-a')],
       shortDescRu: 'Кресло с шерстяной обивкой и подлокотниками-«стаканами».', shortDescEn: 'Wool-upholstered chair with cup armrests.',
       descRu: 'Шерсть, дуб и подлокотники с углублениями под стакан. Премиум-сегмент.',
       descEn: 'Wool, oak, and armrests carved to fit a glass. Premium tier.',
       specs: specsSeating('85×92×95', 21, 1) }),
  P({ id: 'chair-derbent', nameRu: 'Кресло «Дербент»', nameEn: 'Derbent Armchair', category: 'armchairs', price: 64000, materials: ['oak','linen','brass'], capacity: 1, sizeRu: '88×95 см', sizeEn: '88×95 cm',
       images: [IMG.chair1, IMG.terrace1],
       shortDescRu: 'Кресло с латунными вставками.', shortDescEn: 'Armchair with brass inlays.',
       descRu: 'Латунные кромки и кубачинская гравировка на подлокотниках. Парный экземпляр для гостиной на террасе.',
       descEn: 'Brass edges and Kubachi engraving on the armrests. Made in pairs for terrace living rooms.',
       specs: specsSeating('88×95×98', 24, 1) }),
  P({ id: 'chair-kaspiisk', nameRu: 'Кресло «Каспийск»', nameEn: 'Kaspiisk Armchair', category: 'armchairs', price: 38000, materials: ['teak','linen'], capacity: 1, sizeRu: '78×85 см', sizeEn: '78×85 cm',
       images: [IMG.chair1, IMG.p('chair-ksk-a')],
       shortDescRu: 'Тиковое кресло для побережья.', shortDescEn: 'Teak chair for the coast.',
       descRu: 'Тик и натуральный лён. Подходит для прибрежных дач.',
       descEn: 'Teak and natural linen. Made for coastal homes.',
       specs: specsSeating('78×85×85', 15, 1) }),
  P({ id: 'chair-tarki-tau', nameRu: 'Кресло «Тарки-Тау»', nameEn: 'Tarki-Tau Armchair', category: 'armchairs', price: 72000, materials: ['oak','wool','brass'], capacity: 1, sizeRu: '90×100 см', sizeEn: '90×100 cm',
       images: [IMG.chair1, IMG.terrace1, IMG.p('chair-ttau-a')],
       shortDescRu: 'Флагман — кресло-«трон».', shortDescEn: 'Flagship — throne armchair.',
       descRu: 'Самое крупное кресло в линейке. Чтобы провести в нём весь воскресный полдень с книгой.',
       descEn: 'Our largest chair. For an entire Sunday afternoon with a book.',
       specs: specsSeating('90×100×110', 31, 1) }),
  P({ id: 'chair-addala', nameRu: 'Кресло «Аддала»', nameEn: 'Addala Armchair', category: 'armchairs', price: 46000, materials: ['ash','wool'], capacity: 1, sizeRu: '80×88 см', sizeEn: '80×88 cm',
       images: [IMG.chair1, IMG.p('chair-add-a')],
       shortDescRu: 'Кресло с тёплой шерстью.', shortDescEn: 'Chair with warm wool.',
       descRu: 'Толстая шерсть для прохладных вечеров. Сидение можно снять для стирки.',
       descEn: 'Thick wool for cool evenings. The seat is removable for washing.',
       specs: specsSeating('80×88×88', 17, 1) }),
  P({ id: 'chair-charun', nameRu: 'Кресло «Чарун»', nameEn: 'Charun Armchair', category: 'armchairs', price: 34000, materials: ['linden','linen'], capacity: 1, sizeRu: '72×78 см', sizeEn: '72×78 cm',
       images: [IMG.chair1, IMG.p('chair-chr-a')],
       shortDescRu: 'Лёгкое детское/гостевое кресло.', shortDescEn: 'Light kids/guest chair.',
       descRu: 'Уменьшенный размер. Часто берут как детское кресло на террасу.',
       descEn: 'Compact dimensions — often ordered for children\'s terraces.',
       specs: specsSeating('72×78×78', 9, 1) }),
  P({ id: 'chair-urkarakh', nameRu: 'Кресло «Уркарах»', nameEn: 'Urkarakh Armchair', category: 'armchairs', price: 42000, materials: ['oak','linen'], capacity: 1, sizeRu: '78×85 см', sizeEn: '78×85 cm',
       images: [IMG.chair1, IMG.lounge1],
       shortDescRu: 'Классика с глубокой посадкой.', shortDescEn: 'Classic with deep seat.',
       descRu: 'Глубокая посадка для расслабленного полусидячего положения.',
       descEn: 'Deep seat for a relaxed half-reclined position.',
       specs: specsSeating('78×85×85', 18, 1) }),
  P({ id: 'chair-levashi', nameRu: 'Кресло «Леваши»', nameEn: 'Levashi Armchair', category: 'armchairs', price: 38000, materials: ['ash','linen'], capacity: 1, sizeRu: '76×80 см', sizeEn: '76×80 cm', isNew: true,
       images: [IMG.chair1, IMG.p('chair-lev-a')],
       shortDescRu: 'Кресло в скандинавском прочтении.', shortDescEn: 'Chair in Scandinavian reading.',
       descRu: 'Минимализм + дагестанский акцент: латунная кнопка на спинке с гравировкой «ТАРКИ».',
       descEn: 'Minimalism plus a Dagestani accent: a brass button on the back engraved "TARKI".',
       specs: specsSeating('76×80×85', 14, 1) }),
  P({ id: 'chair-gergebil', nameRu: 'Кресло «Гергебиль»', nameEn: 'Gergebil Armchair', category: 'armchairs', price: 52000, materials: ['oak','linen'], capacity: 1, sizeRu: '82×88 см', sizeEn: '82×88 cm',
       images: [IMG.chair1, IMG.terrace1],
       shortDescRu: 'Кресло-качалка с льняной обивкой.', shortDescEn: 'Rocking chair with linen upholstery.',
       descRu: 'Классическое кресло-качалка. Льняная обивка, дубовые полозья, сборка без единого гвоздя.',
       descEn: 'Classic rocking chair. Linen upholstery, oak runners, no-nail assembly.',
       specs: specsSeating('82×88×95', 19, 1) })
];

// ============================================================
// 4. ОБЕДЕННЫЕ ГРУППЫ (10)
// ============================================================
const DINING = [
  P({ id: 'dining-derbent', nameRu: 'Стол «Дербент»', nameEn: 'Derbent Table', category: 'dining', price: 168000, materials: ['oak','brass'], capacity: 12, sizeRu: '320×100 см', sizeEn: '320×100 cm', isBestseller: true,
       images: [IMG.dining1, IMG.terrace1, IMG.p('dining-drb-a')],
       shortDescRu: 'Обеденный стол на 12 персон.', shortDescEn: 'Dining table for 12.',
       descRu: 'Один кусок дуба 320×100. Латунированные ножки крестом, стол не качается даже на неровном полу.',
       descEn: 'Single 320×100 oak slab. Brass-finished X-base — stays level on uneven floors.',
       specs: specsDining('320×100', 12, 78) }),
  P({ id: 'dining-kaspii', nameRu: 'Стол «Каспий»', nameEn: 'Kaspii Table', category: 'dining', price: 92000, materials: ['oak'], capacity: 6, sizeRu: '180×90 см', sizeEn: '180×90 cm',
       images: [IMG.dining1, IMG.p('dining-ksp-a')],
       shortDescRu: 'Стол на 6 персон для семейных ужинов.', shortDescEn: 'Six-seat dining table.',
       descRu: 'Подходит для повседневных семейных ужинов на террасе. Прочный, но не громоздкий.',
       descEn: 'For everyday family dinners on the terrace. Sturdy without being bulky.',
       specs: specsDining('180×90', 6, 42) }),
  P({ id: 'dining-sulak', nameRu: 'Стол «Сулак»', nameEn: 'Sulak Table', category: 'dining', price: 124000, materials: ['oak','brass'], capacity: 8, sizeRu: '240×100 см', sizeEn: '240×100 cm',
       images: [IMG.dining1, IMG.lounge1],
       shortDescRu: 'Стол на 8 персон.', shortDescEn: 'Eight-seat dining table.',
       descRu: 'Размер «золотой середины» — большие компании за ужином, но помещается в стандартную беседку.',
       descEn: 'Sweet-spot size — fits a crowd, but also fits a standard pavilion.',
       specs: specsDining('240×100', 8, 58) }),
  P({ id: 'dining-samur', nameRu: 'Стол «Самур»', nameEn: 'Samur Table', category: 'dining', price: 76000, materials: ['ash'], capacity: 4, sizeRu: '140×80 см', sizeEn: '140×80 cm',
       images: [IMG.dining1, IMG.terrace2],
       shortDescRu: 'Камерный стол на 4 персоны.', shortDescEn: 'Intimate four-seat table.',
       descRu: 'Камерный формат для бистро/террасы. Ясень в светлом финише.',
       descEn: 'Intimate bistro-terrace format. Light-finish ash.',
       specs: specsDining('140×80', 4, 28) }),
  P({ id: 'dining-chirkey', nameRu: 'Стол «Чиркей»', nameEn: 'Chirkey Table', category: 'dining', price: 88000, materials: ['teak'], capacity: 6, sizeRu: '180×85 см', sizeEn: '180×85 cm',
       images: [IMG.dining1, IMG.lounge2],
       shortDescRu: 'Тиковый стол для побережья.', shortDescEn: 'Teak table for the coast.',
       descRu: 'Цельный тик — не страшны прямые солнечные лучи и солёные брызги.',
       descEn: 'Solid teak — stands up to direct sun and salt spray.',
       specs: specsDining('180×85', 6, 38) }),
  P({ id: 'dining-makhachkala', nameRu: 'Стол «Махачкала»', nameEn: 'Makhachkala Table', category: 'dining', price: 56000, materials: ['oak'], capacity: 4, sizeRu: '130×80 см', sizeEn: '130×80 cm',
       images: [IMG.dining1],
       shortDescRu: 'Городской балконный стол.', shortDescEn: 'Urban balcony table.',
       descRu: 'Прямоугольный, на 4 персоны. Подходит для городских балконов и кафе.',
       descEn: 'Rectangular, four-seat. Fits city balconies and cafés.',
       specs: specsDining('130×80', 4, 22) }),
  P({ id: 'dining-khuchni', nameRu: 'Стол «Хучни»', nameEn: 'Khuchni Table', category: 'dining', price: 198000, materials: ['oak','brass','ceramic'], capacity: 14, sizeRu: '380×110 см', sizeEn: '380×110 cm', isNew: true,
       images: [IMG.dining1, IMG.terrace1, IMG.p('dining-khu-a')],
       shortDescRu: 'Стол на 14 персон с керамической вставкой.', shortDescEn: '14-seat table with ceramic inlay.',
       descRu: 'Центральная керамическая вставка балхарской работы — туда ставят горячее, не боясь стол испортить.',
       descEn: 'Central Balkhar-ceramic inlay — hot dishes go straight on it, no trivet needed.',
       specs: specsDining('380×110', 14, 96) }),
  P({ id: 'dining-madjalis', nameRu: 'Стол «Маджалис»', nameEn: 'Madjalis Table', category: 'dining', price: 104000, materials: ['oak'], capacity: 6, sizeRu: '200×95 см', sizeEn: '200×95 cm',
       images: [IMG.dining1, IMG.terrace1],
       shortDescRu: 'Овальный стол на 6 персон.', shortDescEn: 'Oval six-seat table.',
       descRu: 'Овальный формат — гостям удобнее разговаривать через стол.',
       descEn: 'Oval format — easier conversation across the table.',
       specs: specsDining('200×95', 6, 46) }),
  P({ id: 'dining-khasavyurt', nameRu: 'Стол «Хасавюрт»', nameEn: 'Khasavyurt Table', category: 'dining', price: 84000, materials: ['ash','linen'], capacity: 6, sizeRu: '170×90 см', sizeEn: '170×90 cm',
       images: [IMG.dining1, IMG.p('dining-khs-a')],
       shortDescRu: 'Стол с льняной столешницей.', shortDescEn: 'Table with linen tabletop.',
       descRu: 'Эксперимент: спрессованный лён в эпоксидной смоле. Лёгкий, прочный, необычный.',
       descEn: 'An experiment: linen pressed in epoxy. Light, strong, unusual.',
       specs: specsDining('170×90', 6, 32) }),
  P({ id: 'dining-buinaksk', nameRu: 'Стол «Буйнакск»', nameEn: 'Buinaksk Table', category: 'dining', price: 142000, materials: ['oak','brass'], capacity: 10, sizeRu: '280×100 см', sizeEn: '280×100 cm',
       images: [IMG.dining1, IMG.terrace2],
       shortDescRu: 'Стол на 10 персон.', shortDescEn: 'Ten-seat dining table.',
       descRu: 'Подходит для больших семей. Подстолье — латунированная сталь крестом.',
       descEn: 'For large families. Brass-finished X-base.',
       specs: specsDining('280×100', 10, 64) })
];

// ============================================================
// 5. ДИВАНЫ (5)
// ============================================================
const SOFAS = [
  P({ id: 'sofa-kaspiisk', nameRu: 'Диван «Каспийск»', nameEn: 'Kaspiisk Sofa', category: 'sofas', price: 124000, materials: ['oak','linen'], capacity: 3, sizeRu: '220×95 см', sizeEn: '220×95 cm', isBestseller: true,
       images: [IMG.lounge1, IMG.terrace1, IMG.p('sofa-ksk-a')],
       shortDescRu: 'Трёхместный диван с льняной обивкой.', shortDescEn: 'Three-seat sofa with linen upholstery.',
       descRu: 'Каркас из массива дуба. Льняные съёмные чехлы. Глубокая посадка для расслабленного вечернего отдыха.',
       descEn: 'Solid oak frame. Removable linen covers. Deep seat for relaxed evenings.',
       specs: specsSeating('220×95×85', 64, 3) }),
  P({ id: 'sofa-derbent-corner', nameRu: 'Угловой диван «Дербент»', nameEn: 'Derbent Corner Sofa', category: 'sofas', price: 198000, materials: ['oak','velour','brass'], capacity: 5, sizeRu: '280×210 см', sizeEn: '280×210 cm',
       images: [IMG.lounge1, IMG.p('sofa-drb-a'), IMG.p('sofa-drb-b')],
       shortDescRu: 'Угловой диван для гостиной на 5 мест.', shortDescEn: 'Five-seat corner sofa for a living room.',
       descRu: 'L-образная компоновка. Велюровая обивка. Латунные ножки. Возможно зеркальное исполнение под левый или правый угол.',
       descEn: 'L-shaped layout. Velour upholstery. Brass legs. Available in left or right configurations.',
       specs: specsSeating('280×210×88', 112, 5) }),
  P({ id: 'sofa-khunzakh', nameRu: 'Диван «Хунзах»', nameEn: 'Khunzakh Sofa', category: 'sofas', price: 86000, materials: ['ash','linen'], capacity: 2, sizeRu: '180×85 см', sizeEn: '180×85 cm',
       images: [IMG.lounge1, IMG.p('sofa-khu-a')],
       shortDescRu: 'Компактный двухместный диван.', shortDescEn: 'Compact two-seat sofa.',
       descRu: 'Каркас из ясеня, лёгкий и устойчивый. Подходит для небольших гостиных и студий.',
       descEn: 'Ash frame — light and stable. Made for small living rooms and studios.',
       specs: specsSeating('180×85×82', 42, 2) }),
  P({ id: 'sofa-makhachkala-bed', nameRu: 'Диван-кровать «Махачкала»', nameEn: 'Makhachkala Sleeper Sofa', category: 'sofas', price: 156000, materials: ['oak','linen'], capacity: 3, sizeRu: '220×100 см', sizeEn: '220×100 cm', isNew: true,
       images: [IMG.lounge1, IMG.terrace1],
       shortDescRu: 'Раскладной диван с механизмом «еврокнижка».', shortDescEn: 'Sleeper sofa with euro-book mechanism.',
       descRu: 'Дубовый каркас, льняная обивка, спальное место 200×140 см. Подходит для квартиры-студии или комнаты для гостей.',
       descEn: 'Oak frame, linen upholstery, 200×140 cm sleeping surface. Made for studios or guest rooms.',
       specs: specsSeating('220×100×88', 76, 3) }),
  P({ id: 'sofa-sulak-modular', nameRu: 'Модульный диван «Сулак»', nameEn: 'Sulak Modular Sofa', category: 'sofas', price: 248000, materials: ['oak','velour'], capacity: 6, sizeRu: '320×95 см', sizeEn: '320×95 cm',
       images: [IMG.lounge1, IMG.terrace2, IMG.p('sofa-slk-a')],
       shortDescRu: 'Модульная система на 6 человек.', shortDescEn: 'Modular system for six.',
       descRu: 'Шесть модулей, которые можно переставить под любую конфигурацию. Хорошо подходит для больших гостиных.',
       descEn: 'Six modules that rearrange into any layout. Designed for large living rooms.',
       specs: specsSeating('320×95×85', 138, 6) })
];

// ============================================================
// 6. КРОВАТИ (5)
// ============================================================
const BEDS = [
  P({ id: 'bed-tarki', nameRu: 'Кровать «Тарки»', nameEn: 'Tarki Bed', category: 'beds', price: 68000, materials: ['oak','linen'], capacity: 1, sizeRu: '210×100 см', sizeEn: '210×100 cm',
       images: [IMG.terrace1, IMG.p('bed-trk-a')],
       shortDescRu: 'Односпальная кровать с льняным изголовьем.', shortDescEn: 'Single bed with linen headboard.',
       descRu: 'Дубовый каркас, мягкое изголовье с льняной обивкой. Подходит для подростковой комнаты или гостевой.',
       descEn: 'Oak frame, soft linen-upholstered headboard. Made for a teen bedroom or guest room.',
       specs: specsBed('210×100×100', '200×90', 38) }),
  P({ id: 'bed-gunib', nameRu: 'Двуспальная кровать «Гуниб»', nameEn: 'Gunib Double Bed', category: 'beds', price: 124000, materials: ['oak','linen'], capacity: 2, sizeRu: '220×170 см', sizeEn: '220×170 cm', isBestseller: true,
       images: [IMG.terrace1, IMG.lounge1, IMG.p('bed-gun-a')],
       shortDescRu: 'Двуспальная кровать с высоким изголовьем.', shortDescEn: 'Queen bed with tall headboard.',
       descRu: 'Самая популярная модель. Спальное место 200×160 см. Изголовье высотой 110 см с глубокой стёжкой.',
       descEn: 'Our bestseller. 200×160 cm sleeping surface. 110 cm headboard with deep stitching.',
       specs: specsBed('220×170×110', '200×160', 62) }),
  P({ id: 'bed-untsukul-storage', nameRu: 'Кровать «Унцукуль» с ящиками', nameEn: 'Untsukul Bed with Storage', category: 'beds', price: 158000, materials: ['oak','velour'], capacity: 2, sizeRu: '220×170 см', sizeEn: '220×170 cm',
       images: [IMG.terrace1, IMG.p('bed-unt-a')],
       shortDescRu: 'Двуспальная кровать с подъёмным механизмом.', shortDescEn: 'Queen bed with lift-up storage.',
       descRu: 'Подъёмный механизм с газовыми лифтами, бельевой ящик на всё спальное место. Велюровая обивка изголовья.',
       descEn: 'Gas-strut lift, full-mattress storage compartment. Velour-upholstered headboard.',
       specs: specsBed('220×170×112', '200×160', 84) }),
  P({ id: 'bed-kubachi-king', nameRu: 'Кровать «Кубачи» King-size', nameEn: 'Kubachi King Bed', category: 'beds', price: 198000, materials: ['oak','linen','brass'], capacity: 2, sizeRu: '230×210 см', sizeEn: '230×210 cm', isNew: true,
       images: [IMG.terrace1, IMG.lounge1, IMG.p('bed-kub-a')],
       shortDescRu: 'Кровать king-size с латунными вставками.', shortDescEn: 'King bed with brass inlays.',
       descRu: 'Спальное место 200×200 см. Латунные кромки изголовья ручной работы. Премиум-сегмент.',
       descEn: '200×200 cm sleeping surface. Hand-finished brass edges. Premium tier.',
       specs: specsBed('230×210×115', '200×200', 96) }),
  P({ id: 'bed-tsurib-kids', nameRu: 'Детская кровать «Цуриб»', nameEn: 'Tsurib Kids Bed', category: 'beds', price: 52000, materials: ['ash','linen'], capacity: 1, sizeRu: '180×85 см', sizeEn: '180×85 cm',
       images: [IMG.terrace1, IMG.p('bed-tsr-a')],
       shortDescRu: 'Детская кровать с защитным бортиком.', shortDescEn: 'Kids bed with safety rail.',
       descRu: 'Ясень с гипоаллергенным финишем. Спальное место 170×80 см. Защитный бортик из дуба.',
       descEn: 'Ash with hypoallergenic finish. 170×80 cm sleeping surface. Oak safety rail.',
       specs: specsBed('180×85×80', '170×80', 24) })
];

// ============================================================
// 7. ШКАФЫ И ХРАНЕНИЕ (5)
// ============================================================
const STORAGE = [
  P({ id: 'storage-bazarduzi', nameRu: 'Шкаф-купе «Базардюзи»', nameEn: 'Bazarduzi Wardrobe', category: 'storage', price: 182000, materials: ['oak','glass'], capacity: 0, sizeRu: '240×60×220 см', sizeEn: '240×60×220 cm',
       images: [IMG.lounge2, IMG.p('store-bzd-a')],
       shortDescRu: 'Шкаф-купе на три отделения.', shortDescEn: 'Three-compartment sliding wardrobe.',
       descRu: 'Зеркальные двери-купе, латунированные направляющие. Штанги, полки и ящики внутри — комплектация под вас.',
       descEn: 'Mirrored sliding doors, brass-finished tracks. Interior fittings configured to your needs.',
       specs: specsStorage('240×60×220', 142, 'Штанга, 6 полок, 4 ящика') }),
  P({ id: 'storage-andi', nameRu: 'Комод «Анди»', nameEn: 'Andi Dresser', category: 'storage', price: 78000, materials: ['oak','brass'], capacity: 0, sizeRu: '120×45×90 см', sizeEn: '120×45×90 cm', isBestseller: true,
       images: [IMG.lounge2, IMG.p('store-and-a')],
       shortDescRu: 'Комод на 6 ящиков с латунными ручками.', shortDescEn: 'Six-drawer dresser with brass handles.',
       descRu: 'Шесть ящиков на полном выкате. Латунные ручки и петли. Подходит для спальни и прихожей.',
       descEn: 'Six full-extension drawers. Brass handles and hinges. Made for bedrooms or entryways.',
       specs: specsStorage('120×45×90', 58, '6 ящиков на полном выкате') }),
  P({ id: 'storage-shamil-shelving', nameRu: 'Стеллаж «Шамиль»', nameEn: 'Shamil Shelving Unit', category: 'storage', price: 64000, materials: ['oak'], capacity: 0, sizeRu: '180×35×210 см', sizeEn: '180×35×210 cm',
       images: [IMG.lounge2],
       shortDescRu: 'Открытый стеллаж с 15 секциями.', shortDescEn: 'Open shelving with 15 sections.',
       descRu: 'Открытые полки 30×30 см. Подходит для книг, посуды, винила или показа предметов.',
       descEn: 'Open 30×30 cm sections. For books, ceramics, vinyl, or display.',
       specs: specsStorage('180×35×210', 72, '15 открытых секций 30×30 см') }),
  P({ id: 'storage-khunzakh-wardrobe', nameRu: 'Гардероб «Хунзах»', nameEn: 'Khunzakh Closet', category: 'storage', price: 142000, materials: ['oak','brass'], capacity: 0, sizeRu: '180×55×210 см', sizeEn: '180×55×210 cm',
       images: [IMG.lounge2, IMG.p('store-khu-a')],
       shortDescRu: 'Гардероб с распашными дверями.', shortDescEn: 'Wardrobe with hinged doors.',
       descRu: 'Две распашные секции и центральная — со штангой во всю высоту. Подходит для спальни или прихожей.',
       descEn: 'Two hinged sections plus a central full-height hanging compartment. Made for bedrooms or entryways.',
       specs: specsStorage('180×55×210', 118, 'Штанга 1.8м, 4 полки, 2 ящика') }),
  P({ id: 'storage-khairakh-bedside', nameRu: 'Прикроватная тумба «Хайрах»', nameEn: 'Khairakh Bedside Table', category: 'storage', price: 24000, materials: ['oak','brass'], capacity: 0, sizeRu: '50×40×55 см', sizeEn: '50×40×55 cm', isNew: true,
       images: [IMG.lounge2, IMG.p('store-khr-a')],
       shortDescRu: 'Прикроватная тумба с двумя ящиками.', shortDescEn: 'Bedside table with two drawers.',
       descRu: 'Два ящика на полном выкате, латунные ручки. Часто заказывают в паре с кроватями «Гуниб» или «Унцукуль».',
       descEn: 'Two full-extension drawers, brass handles. Often ordered in pairs with Gunib or Untsukul beds.',
       specs: specsStorage('50×40×55', 14, '2 ящика на полном выкате') })
];

// ============================================================
// 8. БЕСЕДКИ (6)
// ============================================================
const PAVILIONS = [
  P({ id: 'pavilion-kubachi', nameRu: 'Беседка «Кубачи»', nameEn: 'Kubachi Pavilion', category: 'pavilions', price: 420000, materials: ['oak','brass'], capacity: 8, sizeRu: '4×4 м', sizeEn: '4×4 m', isBestseller: true,
       images: [IMG.terrace1, IMG.terrace2, IMG.p('pavilion-kub-a'), IMG.p('pavilion-kub-b')],
       shortDescRu: 'Классическая 4×4 беседка с кедровой крышей.', shortDescEn: 'Classic 4×4 pavilion with cedar roof.',
       descRu: 'Каркас — клееный дуб 120×120. Кровля — кедровая дранка. Латунная фурнитура. Срок монтажа на участке — 3–5 дней.',
       descEn: 'Glulam oak 120×120 frame. Cedar shake roof. Brass hardware. On-site assembly takes 3–5 days.',
       specs: specsPavilion('4×4', 8) }),
  P({ id: 'pavilion-balkhar', nameRu: 'Беседка «Балхар»', nameEn: 'Balkhar Pavilion', category: 'pavilions', price: 560000, materials: ['oak','ceramic','brass'], capacity: 12, sizeRu: '5×5 м', sizeEn: '5×5 m',
       images: [IMG.terrace1, IMG.p('pavilion-blr-a')],
       shortDescRu: 'Просторная беседка с балхарской керамикой.', shortDescEn: 'Large pavilion with Balkhar ceramic floor.',
       descRu: 'В основании — пол из балхарской керамической плитки ручной работы. На 12 человек.',
       descEn: 'Floor: hand-made Balkhar ceramic tiles. Seats 12.',
       specs: specsPavilion('5×5', 12) }),
  P({ id: 'pavilion-untsukul', nameRu: 'Беседка «Унцукуль»', nameEn: 'Untsukul Pavilion', category: 'pavilions', price: 380000, materials: ['oak'], capacity: 6, sizeRu: '3.5×3.5 м', sizeEn: '3.5×3.5 m',
       images: [IMG.terrace2, IMG.p('pavilion-unt-a')],
       shortDescRu: 'Беседка с резными колоннами.', shortDescEn: 'Pavilion with carved columns.',
       descRu: 'Колонны с фирменной унцукульской резьбой по дереву с серебряной насечкой.',
       descEn: 'Columns feature Untsukul wood carving with silver inlay.',
       specs: specsPavilion('3.5×3.5', 6) }),
  P({ id: 'pavilion-shamil', nameRu: 'Беседка «Шамиль»', nameEn: 'Shamil Pavilion', category: 'pavilions', price: 720000, materials: ['oak','brass','ceramic'], capacity: 16, sizeRu: '6×6 м', sizeEn: '6×6 m', isNew: true,
       images: [IMG.terrace1, IMG.terrace2, IMG.p('pavilion-shm-a')],
       shortDescRu: 'Флагман — 6×6 на 16 персон.', shortDescEn: 'Flagship — 6×6 m, 16 guests.',
       descRu: 'Самая большая беседка коллекции. Камин в центре опционально.',
       descEn: 'Our largest pavilion. Central fire pit optional.',
       specs: specsPavilion('6×6', 16) }),
  P({ id: 'pavilion-imam', nameRu: 'Беседка «Имам»', nameEn: 'Imam Pavilion', category: 'pavilions', price: 340000, materials: ['ash','linen'], capacity: 4, sizeRu: '3×3 м', sizeEn: '3×3 m',
       images: [IMG.terrace2, IMG.p('pavilion-im-a')],
       shortDescRu: 'Лёгкая беседка с льняными шторами.', shortDescEn: 'Light pavilion with linen curtains.',
       descRu: 'Каркас — ясень, стенки — льняные шторы. Снимаются на зиму.',
       descEn: 'Ash frame, linen curtain walls. Removable for winter.',
       specs: specsPavilion('3×3', 4) }),
  P({ id: 'pavilion-kavkaz', nameRu: 'Беседка «Кавказ»', nameEn: 'Kavkaz Pavilion', category: 'pavilions', price: 480000, materials: ['oak','brass'], capacity: 10, sizeRu: '4.5×4.5 м', sizeEn: '4.5×4.5 m',
       images: [IMG.terrace1, IMG.lounge1],
       shortDescRu: 'Восьмиугольная беседка.', shortDescEn: 'Octagonal pavilion.',
       descRu: 'Восьмиугольная форма с центральной мачтой. Внутри помещается обеденный стол «Сулак» с креслами.',
       descEn: 'Octagonal with a central mast. Fits a "Sulak" dining table inside.',
       specs: specsPavilion('4.5×4.5', 10) })
];

// ============================================================
// 6. КАЧЕЛИ И ГАМАКИ (6)
// ============================================================
const SWINGS = [
  P({ id: 'swing-khairakh', nameRu: 'Качели «Хайрах»', nameEn: 'Khairakh Swing', category: 'swings', price: 86000, materials: ['oak','linen'], capacity: 2, sizeRu: '180×80 см', sizeEn: '180×80 cm', isBestseller: true,
       images: [IMG.lounge1, IMG.terrace1, IMG.p('swing-khr-a')],
       shortDescRu: 'Двухместные качели на дубовой раме.', shortDescEn: 'Two-seater swing on oak frame.',
       descRu: 'Подходят для двух взрослых. Подвес — латунированные цепи, рассчитанные на 250 кг.',
       descEn: 'Fits two adults. Brass-finished chains rated for 250 kg.',
       specs: specsSeating('180×80×100', 42, 2) }),
  P({ id: 'swing-talgi', nameRu: 'Гамак «Талги»', nameEn: 'Talgi Hammock', category: 'swings', price: 18000, materials: ['linen'], capacity: 1, sizeRu: '200×100 см', sizeEn: '200×100 cm',
       images: [IMG.lounge2, IMG.p('swing-tlg-a')],
       shortDescRu: 'Льняной гамак на бахроме.', shortDescEn: 'Linen hammock with fringe.',
       descRu: 'Натуральный лён с бахромой ручной вязки. Опционально — деревянная стойка.',
       descEn: 'Natural linen with hand-knotted fringe. Optional wooden stand.',
       specs: specsSeating('200×100×—', 4, 1) }),
  P({ id: 'swing-gimry', nameRu: 'Качели «Гимры»', nameEn: 'Gimry Swing', category: 'swings', price: 124000, materials: ['oak','wool','brass'], capacity: 3, sizeRu: '220×95 см', sizeEn: '220×95 cm',
       images: [IMG.lounge2, IMG.terrace1],
       shortDescRu: 'Трёхместные качели с навесом.', shortDescEn: 'Three-seat swing with canopy.',
       descRu: 'Качели с льняным навесом. Латунные крепления, дубовая основа.',
       descEn: 'Swing with linen canopy. Brass fittings, oak base.',
       specs: specsSeating('220×95×220', 64, 3) }),
  P({ id: 'swing-sulak', nameRu: 'Качели «Сулак»', nameEn: 'Sulak Swing', category: 'swings', price: 56000, materials: ['ash','linen'], capacity: 2, sizeRu: '170×75 см', sizeEn: '170×75 cm',
       images: [IMG.lounge1, IMG.p('swing-slk-a')],
       shortDescRu: 'Лёгкие качели для двоих.', shortDescEn: 'Light two-person swing.',
       descRu: 'Лёгкие качели для двоих — без рамы, крепятся на потолок беседки.',
       descEn: 'Light two-seater — no frame, mounts to a pavilion ceiling.',
       specs: specsSeating('170×75×—', 18, 2) }),
  P({ id: 'swing-kaspii', nameRu: 'Гамак «Каспий»', nameEn: 'Kaspii Hammock', category: 'swings', price: 22000, materials: ['linen','wool'], capacity: 1, sizeRu: '210×110 см', sizeEn: '210×110 cm', isNew: true,
       images: [IMG.lounge2],
       shortDescRu: 'Тёплый гамак с шерстяной подкладкой.', shortDescEn: 'Warm hammock with wool lining.',
       descRu: 'Двухслойный: льняная основа + шерстяная подкладка. Можно использовать осенью.',
       descEn: 'Two-layer: linen base, wool lining. Good well into autumn.',
       specs: specsSeating('210×110×—', 6, 1) }),
  P({ id: 'swing-aul', nameRu: 'Качели «Аул»', nameEn: 'Aul Swing', category: 'swings', price: 98000, materials: ['oak','linen'], capacity: 4, sizeRu: '240×100 см', sizeEn: '240×100 cm',
       images: [IMG.terrace1, IMG.p('swing-aul-a')],
       shortDescRu: 'Большие семейные качели на 4 персоны.', shortDescEn: 'Large four-seat family swing.',
       descRu: 'Семейные качели — мама, папа и двое детей. Прочная дубовая рама.',
       descEn: 'Family swing — for two parents and two kids. Heavy oak frame.',
       specs: specsSeating('240×100×220', 78, 4) })
];

// ============================================================
// 7. ТЕКСТИЛЬ (8)
// ============================================================
const TEXTILES = [
  P({ id: 'textile-khunzakh', nameRu: 'Подушка «Хунзах»', nameEn: 'Khunzakh Pillow', category: 'pillows', price: 4200, materials: ['linen','wool'], capacity: 0, sizeRu: '50×50 см', sizeEn: '50×50 cm', isBestseller: true,
       images: [IMG.textile1, IMG.p('text-khu-a')],
       shortDescRu: 'Декоративная подушка с шерстяной набивкой.', shortDescEn: 'Decorative pillow with wool fill.',
       descRu: 'Льняной чехол снимается. Шерстяная набивка из овечьей шерсти.',
       descEn: 'Removable linen cover. Sheep-wool fill.',
       finishes: [], fabrics: ['linen-nat','linen-clay','linen-ink','wool-ochre'],
       specs: specsTextile('50×50', 'Лён + овечья шерсть', 'Linen + sheep wool') }),
  P({ id: 'textile-tarki', nameRu: 'Плед «Тарки»', nameEn: 'Tarki Throw', category: 'pillows', price: 8400, materials: ['wool'], capacity: 0, sizeRu: '180×130 см', sizeEn: '180×130 cm',
       images: [IMG.textile1, IMG.p('text-trk-a')],
       shortDescRu: 'Тёплый плед на полтора места.', shortDescEn: 'Cozy throw for one and a half.',
       descRu: 'Овечья шерсть. Натуральные тона: молочный, охра, графит.',
       descEn: 'Sheep wool. Natural shades: milk, ochre, graphite.',
       finishes: [], fabrics: ['linen-nat','wool-ochre','linen-ink'],
       specs: specsTextile('180×130', 'Овечья шерсть 100%', '100% sheep wool') }),
  P({ id: 'textile-kubachi', nameRu: 'Подушка «Кубачи»', nameEn: 'Kubachi Pillow', category: 'pillows', price: 5600, materials: ['linen'], capacity: 0, sizeRu: '45×45 см', sizeEn: '45×45 cm',
       images: [IMG.textile1, IMG.p('text-kub-a')],
       shortDescRu: 'Подушка с кубачинским узором.', shortDescEn: 'Pillow with Kubachi pattern.',
       descRu: 'Орнамент кубачинской насечки, перенесённый на льняную ткань.',
       descEn: 'Kubachi pattern transferred to linen.',
       finishes: [], fabrics: ['linen-nat','linen-clay','linen-ink'],
       specs: specsTextile('45×45', 'Лён двойного плетения', 'Double-woven linen') }),
  P({ id: 'textile-balkhar', nameRu: 'Дорожка «Балхар»', nameEn: 'Balkhar Runner', category: 'rugs', price: 7800, materials: ['linen'], capacity: 0, sizeRu: '40×180 см', sizeEn: '40×180 cm',
       images: [IMG.textile1],
       shortDescRu: 'Льняная дорожка на стол.', shortDescEn: 'Linen table runner.',
       descRu: 'Льняная дорожка для обеденного стола. Не выцветает на солнце.',
       descEn: 'Linen table runner. Sun-resistant.',
       finishes: [], fabrics: ['linen-nat','linen-clay','linen-ink'],
       specs: specsTextile('40×180', 'Лён ручной выделки', 'Hand-loomed linen') }),
  P({ id: 'textile-gunib', nameRu: 'Штора «Гуниб»', nameEn: 'Gunib Curtain', category: 'pillows', price: 14800, materials: ['linen'], capacity: 0, sizeRu: '140×260 см', sizeEn: '140×260 cm', isNew: true,
       images: [IMG.textile1, IMG.p('text-gnb-a')],
       shortDescRu: 'Льняная штора для беседки.', shortDescEn: 'Linen curtain for the pavilion.',
       descRu: 'Плотный лён для боковин беседки. Защищает от солнца и ветра.',
       descEn: 'Heavy linen for pavilion walls. Sun and wind protection.',
       finishes: [], fabrics: ['linen-nat','linen-clay','linen-ink'],
       specs: specsTextile('140×260', 'Плотный лён 380 г/м²', 'Heavy linen 380 g/m²') }),
  P({ id: 'textile-derbent', nameRu: 'Покрывало «Дербент»', nameEn: 'Derbent Blanket', category: 'pillows', price: 12400, materials: ['wool','linen'], capacity: 0, sizeRu: '220×200 см', sizeEn: '220×200 cm',
       images: [IMG.textile1, IMG.p('text-drb-a')],
       shortDescRu: 'Покрывало на двуспальную кровать.', shortDescEn: 'Blanket for a king bed.',
       descRu: 'Двусторонний: лён + шерсть. Можно переворачивать в зависимости от настроения.',
       descEn: 'Reversible: linen and wool. Flip according to mood.',
       finishes: [], fabrics: ['linen-nat','wool-ochre','linen-ink'],
       specs: specsTextile('220×200', 'Лён + шерсть', 'Linen + wool') }),
  P({ id: 'textile-charun', nameRu: 'Коврик «Чарун»', nameEn: 'Charun Mat', category: 'rugs', price: 6200, materials: ['wool'], capacity: 0, sizeRu: '60×90 см', sizeEn: '60×90 cm',
       images: [IMG.textile1],
       shortDescRu: 'Шерстяной коврик под ноги.', shortDescEn: 'Wool foot mat.',
       descRu: 'Маленький шерстяной коврик под кресло или у входа на террасу.',
       descEn: 'Small wool mat for under a chair or at the terrace door.',
       finishes: [], fabrics: ['wool-ochre','linen-nat','linen-ink'],
       specs: specsTextile('60×90', 'Овечья шерсть', 'Sheep wool') }),
  P({ id: 'textile-lezginka', nameRu: 'Ковёр «Лезгинка»', nameEn: 'Lezginka Rug', category: 'rugs', price: 38000, materials: ['wool'], capacity: 0, sizeRu: '200×140 см', sizeEn: '200×140 cm',
       images: [IMG.textile1, IMG.p('text-lzk-a'), IMG.p('text-lzk-b')],
       shortDescRu: 'Шерстяной ковёр ручной работы.', shortDescEn: 'Hand-woven wool rug.',
       descRu: 'Ковёр ручной работы из горного селения Куркент. Тёплый, плотный, износостойкий.',
       descEn: 'Hand-woven in the mountain village of Kurkent. Warm, dense, hardwearing.',
       finishes: [], fabrics: ['wool-ochre','linen-nat','linen-ink'],
       specs: specsTextile('200×140', 'Шерсть овечья 100%', '100% sheep wool') })
];

// All products
/**
 * ----- Real product factory (R) -----
 * Use this for actual catalog items. Identical to P() but marks the
 * product `isDemo: false` so it shows even when demo data is hidden.
 *
 * Real-product array `REAL_PRODUCTS` will collect them. They go FIRST
 * in TARKI_PRODUCTS so they appear at the top of catalog "Featured"
 * sort by default (assuming similar affinity).
 */
function R(o) {
  return Object.assign({
    isDemo: false,
    isNew: false,
    isBestseller: false,
    finishes: [],
    fabrics:  [],
    reviews:  []
  }, o);
}

// Real products live here — filled in as we add them.
const REAL_PRODUCTS = [];

window.TARKI_PRODUCTS = [].concat(
  // Real products always first
  REAL_PRODUCTS,
  // ----- Demo data (gradually replaced) -----
  // Home
  ARMCHAIRS, SOFAS, BEDS, DINING, STORAGE,
  // Garden
  TERRACES, LOUNGERS, PAVILIONS, SWINGS,
  // Decor
  TEXTILES
);

/**
 * Helper to hide demo products globally. By default everything shows.
 * To hide demos site-wide, set localStorage `tarki-hide-demo` = '1'
 * (or call `TARKI_HIDE_DEMO()` from console).
 *
 * UI surfaces (catalog, homepage, landings) honor this via the filter
 * function below. Demo data isn't deleted — just filtered out at render.
 */
window.TARKI_IS_DEMO_HIDDEN = function () {
  try { return localStorage.getItem('tarki-hide-demo') === '1'; }
  catch (e) { return false; }
};
window.TARKI_HIDE_DEMO = function () {
  try { localStorage.setItem('tarki-hide-demo', '1'); } catch (e) {}
  location.reload();
};
window.TARKI_SHOW_DEMO = function () {
  try { localStorage.removeItem('tarki-hide-demo'); } catch (e) {}
  location.reload();
};
/**
 * Filter applied to TARKI_PRODUCTS at consumer time. Wraps the array
 * with a getter so anywhere we read from it, demos get stripped if
 * the user opted to hide them.
 */
window.TARKI_VISIBLE_PRODUCTS = function () {
  if (!window.TARKI_IS_DEMO_HIDDEN()) return window.TARKI_PRODUCTS;
  return window.TARKI_PRODUCTS.filter(function (p) { return !p.isDemo; });
};
window.TARKI_FINISHES = FINISHES;
window.TARKI_FABRICS  = FABRICS;

// price bounds for slider
window.TARKI_PRICE_MIN = Math.min.apply(null, window.TARKI_PRODUCTS.map(p => p.price));
window.TARKI_PRICE_MAX = Math.max.apply(null, window.TARKI_PRODUCTS.map(p => p.price));

// helper — works with both camelCase keys (nameRu/nameEn) and lowercase (ru/en)
window.TARKI_T = (obj, lang, suffix) => {
  if (!obj) return '';
  const upper = suffix + (lang === 'en' ? 'En' : 'Ru');
  if (obj[upper] !== undefined) return obj[upper];
  // fallback for lowercase ru/en (categories, parents, finishes, fabrics, specs, etc.)
  const lower = suffix + (lang === 'en' ? 'en' : 'ru');
  if (obj[lower] !== undefined) return obj[lower];
  // single-prop fallback
  const direct = lang === 'en' ? 'en' : 'ru';
  return obj[direct] !== undefined ? obj[direct] : '';
};
window.TARKI_FIND = (id) => window.TARKI_PRODUCTS.find(p => p.id === id);
window.TARKI_CAT = (id) => window.TARKI_CATEGORIES.find(c => c.id === id);
window.TARKI_MAT = (id) => window.TARKI_MATERIALS.find(m => m.id === id);
window.TARKI_PARENT = (id) => window.TARKI_PARENTS.find(p => p.id === id);
// Get all category ids under a parent
window.TARKI_PARENT_CATS = (parentId) =>
  window.TARKI_CATEGORIES.filter(c => c.parent === parentId).map(c => c.id);
// Get parent of a category
window.TARKI_CAT_PARENT = (catId) => {
  const c = window.TARKI_CAT(catId);
  return c ? window.TARKI_PARENT(c.parent) : null;
};
