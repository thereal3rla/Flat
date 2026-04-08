/**
 * Product features reference list — hardcoded from the master XLSX
 * "Продуктовые_фичи_с_характеристиками.xlsx", sheet "Карта развития продукта AS IS".
 *
 * This file is Deno-compatible (no Node-specific imports) so it can be
 * used both in the Next.js app and the Supabase Edge Function.
 */

export interface FeatureRef {
  section: string;
  subsection: string;
  feature_name: string;
  sub_component: string | null;
  is_product_feature: boolean;
  in_cost: boolean;
  tag: string | null;
  dimensions: string | null;
  material: string | null;
  brand: string | null;
  extra_info: string | null;
}

export const FEATURES_REFERENCE: FeatureRef[] = [
  // ─── ДОМ / Квартира предчистовая ───
  { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Радиаторы", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "высота 500 мм, Длина согласно расчету", material: "Стальные панельные", brand: "Sole, Lemax", extra_info: null },
  { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Терморегулятор", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "100 мм", material: "Пластик", brand: "Danfoss", extra_info: null },
  { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Окна", sub_component: "Профиль окна", is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "H 2380 мм, L от 2100 мм до 2700 мм", material: "Металлопластик", brand: "Funke", extra_info: "5 камерные с 2 контуром уплотнения" },
  { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Окна", sub_component: "Стекла", is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "6-8 мм", material: "Стекло", brand: "Стекломир", extra_info: "Энергосберегающая прозрачная" },
  { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Окна", sub_component: "Подоконник", is_product_feature: true, in_cost: true, tag: "Функциональность, Безопасность, эмоциональность", dimensions: "250 мм", material: "Пластик", brand: "Керуен плюс", extra_info: null },
  { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Дверь входная", sub_component: null, is_product_feature: true, in_cost: true, tag: "Безопасность", dimensions: "2200 х 900 мм", material: "Металл, облицовка МДФ", brand: "Интерра", extra_info: null },
  { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Электрозамок", sub_component: null, is_product_feature: true, in_cost: true, tag: "Безопасность", dimensions: "60*270 мм", material: "Металл, пластик", brand: "Connected Home", extra_info: "Открытие отпечатками пальцев" },
  { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Планшет видеодомофона", sub_component: null, is_product_feature: true, in_cost: true, tag: "Безопасность", dimensions: "113*175 мм", material: "Пластик", brand: "Dahua/Hikvision", extra_info: null },
  { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Дверной проем межкомнатный", sub_component: null, is_product_feature: true, in_cost: true, tag: "Эмоциональность", dimensions: "1300х 2300 (h) / 900х 2300 (h)", material: "Газоблок", brand: null, extra_info: null },
  { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Датчики Умного дома", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "разные", material: "Пластик", brand: "Connected Home", extra_info: null },

  // ─── ДОМ / Квартира чистовая ───
  { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Отделка стен", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "Длина 25 м ширина 1,06 м", material: "Обои флизелиновые", brand: null, extra_info: null },
  { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Отделка полов", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "185*1380 мм", material: "Ламинат", brand: "Kastamonu", extra_info: "33 класс толщина 7 мм" },
  { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Отделка потолка", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: null, material: "Натяжной потолок", brand: "Местные", extra_info: null },
  { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Сантехника", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "разные", material: "Латунь", brand: "Haiba", extra_info: null },
  { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Осветительные приборы", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, эмоциональность", dimensions: "100 мм", material: "Пластик", brand: "Разные", extra_info: null },
  { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Розетки, включатели", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, безопасность", dimensions: "70*70 мм", material: "Пластик", brand: "Schneider Electric", extra_info: null },
  { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Двери межкомнатные", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "2200*900 мм", material: "Дерево", brand: "разные", extra_info: null },
  { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Корпусная мебель", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "разные", material: "Дерево, ткань", brand: "местный завод", extra_info: null },
  { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Мягкая мебель", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "разные", material: "Дерево, ткань", brand: "местный завод", extra_info: null },
  { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Бытовая техника", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "разные", material: "металл, пластик", brand: "Haier", extra_info: null },
  { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Предметы декора (шторы, ковры, картины)", sub_component: null, is_product_feature: true, in_cost: true, tag: "Эмоциональность", dimensions: "разные", material: "разный", brand: null, extra_info: null },
  { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Теплый пол", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "разные", material: "пластик", brand: "местный", extra_info: null },

  // ─── ДОМ / Поэтажный коридор ───
  { section: "ДОМ", subsection: "Поэтажный коридор", feature_name: "Керамогранит на полу", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "1200*600", material: "Керамогранит", brand: "Зерде (Актобе)", extra_info: null },
  { section: "ДОМ", subsection: "Поэтажный коридор", feature_name: "Потолочное освещение", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "300*300", material: "Пластик", brand: "DANILIGHT/LEOLED", extra_info: null },
  { section: "ДОМ", subsection: "Поэтажный коридор", feature_name: "Технические двери", sub_component: null, is_product_feature: false, in_cost: false, tag: "Функциональность", dimensions: "2200*900 мм", material: "Металл", brand: "Интерра", extra_info: null },
  { section: "ДОМ", subsection: "Поэтажный коридор", feature_name: "Эвакуационные двери", sub_component: null, is_product_feature: false, in_cost: false, tag: "Безопасность", dimensions: "2200*900 мм", material: "Металл", brand: "Интерра", extra_info: null },
  { section: "ДОМ", subsection: "Поэтажный коридор", feature_name: "Картины", sub_component: null, is_product_feature: true, in_cost: true, tag: "Эмоциональность", dimensions: "900*900 мм", material: "Бумага плотная", brand: null, extra_info: null },
  { section: "ДОМ", subsection: "Поэтажный коридор", feature_name: "Отделка стен", sub_component: null, is_product_feature: false, in_cost: false, tag: "Функциональность", dimensions: null, material: "Краска", brand: "Шебер", extra_info: null },

  // ─── ДОМ / Подъезд ───
  { section: "ДОМ", subsection: "Подъезд", feature_name: "Сквозной подъезд", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "ширина 2800 мм высота 3900 мм", material: null, brand: null, extra_info: null },
  { section: "ДОМ", subsection: "Подъезд", feature_name: "Колясочная", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "площадь 20 м2", material: null, brand: null, extra_info: null },
  { section: "ДОМ", subsection: "Подъезд", feature_name: "Мебель на 1 эт", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, эмоциональность", dimensions: "2000 мм", material: "Ткань", brand: "местный завод", extra_info: null },
  { section: "ДОМ", subsection: "Подъезд", feature_name: "Ароматизаторы", sub_component: null, is_product_feature: true, in_cost: true, tag: "Эмоциональность", dimensions: "200 мм", material: "Пластик", brand: null, extra_info: "Запах важен тут" },
  { section: "ДОМ", subsection: "Подъезд", feature_name: "Тепловые завесы", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: null, material: null, brand: null, extra_info: "отсутствует в комфорт+ классе" },
  { section: "ДОМ", subsection: "Подъезд", feature_name: "Кондиционеры", sub_component: null, is_product_feature: true, in_cost: true, tag: "Эмоциональность", dimensions: null, material: null, brand: null, extra_info: "В основном в теплых регионах" },
  { section: "ДОМ", subsection: "Подъезд", feature_name: "Отделка 1 и 2 этажей", sub_component: null, is_product_feature: true, in_cost: true, tag: "Эмоциональность", dimensions: null, material: "МДФ", brand: "местные производители", extra_info: null },
  { section: "ДОМ", subsection: "Подъезд", feature_name: "Ресепшн", sub_component: null, is_product_feature: true, in_cost: true, tag: "Эмоциональность, социальность", dimensions: null, material: null, brand: null, extra_info: "отсутствует в комфорт+ классе" },
  { section: "ДОМ", subsection: "Подъезд", feature_name: "Керамогранит на полу", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "1200*600", material: "Керамогранит", brand: "Зерде (Актобе)", extra_info: null },
  { section: "ДОМ", subsection: "Подъезд", feature_name: "Интерьерное освещение", sub_component: null, is_product_feature: true, in_cost: false, tag: "Функциональность", dimensions: "200 мм", material: "Пластик, металл", brand: "DANILIGHT/LEOLED", extra_info: null },
  { section: "ДОМ", subsection: "Подъезд", feature_name: "Навигация", sub_component: null, is_product_feature: true, in_cost: false, tag: "Функциональность", dimensions: "разные", material: "Пластик, металл", brand: "местные", extra_info: null },
  { section: "ДОМ", subsection: "Подъезд", feature_name: "Лифты", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "1200х1300 (630кг) / 1100х1400 (630кг) / 1300х2100 (1050-1275кг)", material: "Металл", brand: "Joylive, SWORD, AOLIDA (Китай)", extra_info: "Скорость от 1 метр в секунду" },

  // ─── ДОМ / Паркинг ───
  { section: "ДОМ", subsection: "Паркинг", feature_name: "Интерьер входа с паркинга", sub_component: null, is_product_feature: true, in_cost: false, tag: "Эмоциональность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "ДОМ", subsection: "Паркинг", feature_name: "Фэйс айди с паркинга", sub_component: null, is_product_feature: true, in_cost: true, tag: "Безопасность", dimensions: "100*200 мм", material: "Пластик", brand: "Dahua/Hikvision", extra_info: null },
  { section: "ДОМ", subsection: "Паркинг", feature_name: "Освещение", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, безопасность", dimensions: "100*1000 мм", material: "Пластик", brand: "Россия", extra_info: "Светодиодные" },
  { section: "ДОМ", subsection: "Паркинг", feature_name: "Кладовая", sub_component: null, is_product_feature: true, in_cost: false, tag: "Функциональность, безопасность", dimensions: "Высота 3000 мм", material: "Кирпич", brand: null, extra_info: null },
  { section: "ДОМ", subsection: "Паркинг", feature_name: "Велопарковки", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, безопасность", dimensions: "1700*570 мм", material: "Металл", brand: "местные производители", extra_info: null },
  { section: "ДОМ", subsection: "Паркинг", feature_name: "Электрозарядки для электрокаров", sub_component: null, is_product_feature: true, in_cost: false, tag: "Функциональность", dimensions: "1700*570 мм", material: "Металл", brand: "Партнер (Китай)", extra_info: null },
  { section: "ДОМ", subsection: "Паркинг", feature_name: "Навигация по паркингу", sub_component: null, is_product_feature: true, in_cost: false, tag: "Функциональность, эмоциональность", dimensions: "1000*3000 мм", material: "Алюминиево-композитные панели", brand: "Sibalux (РФ)", extra_info: null },
  { section: "ДОМ", subsection: "Паркинг", feature_name: "Планировка паркинга", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "ДОМ", subsection: "Паркинг", feature_name: "Нумерация паркоместа", sub_component: null, is_product_feature: true, in_cost: false, tag: "Функциональность", dimensions: "200*200 мм", material: "Пластик", brand: "местные производители", extra_info: null },

  // ─── ДОМ / Многофункциональные помещения ───
  { section: "ДОМ", subsection: "Многофункциональные помещения", feature_name: "Кинорум", sub_component: null, is_product_feature: true, in_cost: false, tag: "Эмоциональность, социальность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "ДОМ", subsection: "Многофункциональные помещения", feature_name: "Фитнес", sub_component: null, is_product_feature: true, in_cost: false, tag: "Эмоциональность, социальность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "ДОМ", subsection: "Многофункциональные помещения", feature_name: "Детская комната", sub_component: null, is_product_feature: true, in_cost: false, tag: "Эмоциональность, социальность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "ДОМ", subsection: "Многофункциональные помещения", feature_name: "Коворкинги", sub_component: null, is_product_feature: true, in_cost: false, tag: "Эмоциональность, социальность", dimensions: null, material: null, brand: null, extra_info: null },

  // ─── ДОМ / Фасады ───
  { section: "ДОМ", subsection: "Фасады", feature_name: "Фасад", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, безопасность, эмоциональность", dimensions: "Разные", material: "Гранит / Лаймстоун / Стеклофибробетон / Клинкерный кирпич / Клинкерная плитка / АКП", brand: "Гранит (Китай) / Лаймстоун (Турция, Иран) / Стеклофибробетон (SALBEN) / Клинкерный кирпич Германия / АКП (Sibalux RF)", extra_info: null },
  { section: "ДОМ", subsection: "Фасады", feature_name: "Ночное освещение", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, безопасность, эмоциональность", dimensions: null, material: "Пластик", brand: null, extra_info: null },
  { section: "ДОМ", subsection: "Фасады", feature_name: "Логотип компании", sub_component: null, is_product_feature: false, in_cost: false, tag: "Эмоциональность", dimensions: "1000*5000 мм", material: "Металл пластик", brand: "местные производители", extra_info: null },
  { section: "ДОМ", subsection: "Фасады", feature_name: "Адресная табличка", sub_component: null, is_product_feature: false, in_cost: false, tag: "Функциональность", dimensions: "300*1000 мм", material: "Пластик", brand: "местные производители", extra_info: null },

  // ─── Двор / МАФ-ы ───
  { section: "Двор", subsection: "МАФ-ы", feature_name: "Детские игровые МАФ-ы", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, социальность", dimensions: "Разные", material: "Металл, дерево, HDP пластик", brand: "Наш двор, Романа РФ", extra_info: null },
  { section: "Двор", subsection: "МАФ-ы", feature_name: "Беседки", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, социальность", dimensions: "Разные", material: "Металл, дерево", brand: "Аданат РФ", extra_info: null },
  { section: "Двор", subsection: "МАФ-ы", feature_name: "Скамьи", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, социальность", dimensions: "Разные", material: "Металл, дерево", brand: "местные производители", extra_info: null },
  { section: "Двор", subsection: "МАФ-ы", feature_name: "Урна", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "Разные", material: "Металл, дерево", brand: "местные производители", extra_info: null },
  { section: "Двор", subsection: "МАФ-ы", feature_name: "Песочница", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, эмоциональность, социальность", dimensions: "Разные", material: "Дерево", brand: "Наш двор, Романа РФ", extra_info: null },
  { section: "Двор", subsection: "МАФ-ы", feature_name: "Арт инсталляции", sub_component: null, is_product_feature: true, in_cost: true, tag: "Эмоциональность", dimensions: "Разные", material: "Металл, камень", brand: "Индивидуальные", extra_info: null },
  { section: "Двор", subsection: "МАФ-ы", feature_name: "Садовая мебель", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, социальность", dimensions: "Разные", material: "Ротанг", brand: "Разные", extra_info: null },

  // ─── Двор / Озеленение ───
  { section: "Двор", subsection: "Озеленение", feature_name: "Автополив", sub_component: null, is_product_feature: false, in_cost: false, tag: "Функциональность", dimensions: "Согласно проекту", material: "Резина, пластик", brand: "местные производители", extra_info: null },
  { section: "Двор", subsection: "Озеленение", feature_name: "Кустарники", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, эмоциональность", dimensions: "Разные", material: "Дерево", brand: "Местные питомники", extra_info: null },
  { section: "Двор", subsection: "Озеленение", feature_name: "Деревья", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, эмоциональность", dimensions: "Разные", material: "Дерево", brand: "Местные питомники, Европа", extra_info: null },

  // ─── Двор / Активный отдых ───
  { section: "Двор", subsection: "Активный отдых", feature_name: "Футбольное/баскетбольное поле", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, социальность", dimensions: "12*24 м", material: "Металл", brand: "местные производители", extra_info: null },
  { section: "Двор", subsection: "Активный отдых", feature_name: "Уличные тренажеры", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, социальность", dimensions: "разные", material: "Металл", brand: "Наш двор, Романа РФ", extra_info: null },
  { section: "Двор", subsection: "Активный отдых", feature_name: "зона Work Out", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, социальность", dimensions: "разные", material: "Металл", brand: "Наш двор, Романа РФ", extra_info: null },

  // ─── Двор / Проезд ───
  { section: "Двор", subsection: "Проезд", feature_name: "Тартановое покрытие", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, безопасность", dimensions: "Согласно проекту толщина 20 мм", material: "Тартан, EPDM", brand: "местные производители", extra_info: null },
  { section: "Двор", subsection: "Проезд", feature_name: "Мощение из брусчатки", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "Согласно проекту", material: "Брусчатка", brand: "Аверс", extra_info: null },
  { section: "Двор", subsection: "Проезд", feature_name: "Галька", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "Согласно проекту", material: "Галька", brand: "местные производители", extra_info: null },
  { section: "Двор", subsection: "Проезд", feature_name: "Безбарьерная среда", sub_component: null, is_product_feature: true, in_cost: false, tag: "Функциональность, безопасность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Двор", subsection: "Проезд", feature_name: "Двор без авто", sub_component: null, is_product_feature: true, in_cost: false, tag: "Функциональность, безопасность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Двор", subsection: "Проезд", feature_name: "Система ливневой канализации", sub_component: null, is_product_feature: false, in_cost: false, tag: "Функциональность", dimensions: null, material: null, brand: null, extra_info: null },

  // ─── Двор / Придомовая территория ───
  { section: "Двор", subsection: "Придомовая территория", feature_name: "Мусорные контейнеры", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность", dimensions: "1500*3000 мм", material: "Пластик, бетон", brand: "Мусконт", extra_info: null },
  { section: "Двор", subsection: "Придомовая территория", feature_name: "Открытые паркоместа", sub_component: null, is_product_feature: true, in_cost: false, tag: "Функциональность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Двор", subsection: "Придомовая территория", feature_name: "Придомовое озеленение", sub_component: null, is_product_feature: false, in_cost: false, tag: "Функциональность, эмоциональность", dimensions: null, material: "зелень", brand: "местные питомники", extra_info: null },
  { section: "Двор", subsection: "Придомовая территория", feature_name: "Пандусы", sub_component: null, is_product_feature: true, in_cost: false, tag: "Функциональность, безопасность", dimensions: "Согласно проекту", material: "Брусчатка", brand: "Аверс", extra_info: null },
  { section: "Двор", subsection: "Придомовая территория", feature_name: "Охранная будка", sub_component: null, is_product_feature: true, in_cost: true, tag: "Функциональность, безопасность", dimensions: "2500*2500 мм", material: "Металл", brand: "местные производители", extra_info: null },
  { section: "Двор", subsection: "Придомовая территория", feature_name: "Многоуровневое освещение", sub_component: null, is_product_feature: true, in_cost: false, tag: "Функциональность, безопасность", dimensions: "согласно проекту", material: "металл, пластик", brand: "местные производители", extra_info: null },
  { section: "Двор", subsection: "Придомовая территория", feature_name: "Видеонаблюдение", sub_component: null, is_product_feature: true, in_cost: true, tag: "Безопасность", dimensions: "100*100 мм", material: "Пластик", brand: "Dahua/Hikvision", extra_info: null },

  // ─── Окружающая среда / Социальная инфраструктура ───
  { section: "Окружающая среда", subsection: "Социальная инфраструктура", feature_name: "Религиозные объекты (Мечеть, Храм)", sub_component: null, is_product_feature: false, in_cost: false, tag: "Эмоциональность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Социальная инфраструктура", feature_name: "Частный детский сад", sub_component: null, is_product_feature: true, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Социальная инфраструктура", feature_name: "Частная Школа", sub_component: null, is_product_feature: true, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Социальная инфраструктура", feature_name: "Медицинский центр", sub_component: null, is_product_feature: false, in_cost: false, tag: "Безопасность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Социальная инфраструктура", feature_name: "Районная библиотека", sub_component: null, is_product_feature: false, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Социальная инфраструктура", feature_name: "Частный университет", sub_component: null, is_product_feature: false, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },

  // ─── Окружающая среда / Инфраструктура безопасности ───
  { section: "Окружающая среда", subsection: "Инфраструктура безопасности", feature_name: "Пункт полиции", sub_component: null, is_product_feature: false, in_cost: false, tag: "Безопасность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Инфраструктура безопасности", feature_name: "Пост охраны Бигвилля", sub_component: null, is_product_feature: false, in_cost: false, tag: "Безопасность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Инфраструктура безопасности", feature_name: "Пожарная часть", sub_component: null, is_product_feature: false, in_cost: false, tag: "Безопасность", dimensions: null, material: null, brand: null, extra_info: null },

  // ─── Окружающая среда / Транспортная инфраструктура ───
  { section: "Окружающая среда", subsection: "Транспортная инфраструктура", feature_name: "Автомобильные улицы", sub_component: null, is_product_feature: false, in_cost: false, tag: "Безопасность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Транспортная инфраструктура", feature_name: "Пешеходные улицы", sub_component: null, is_product_feature: true, in_cost: false, tag: "Безопасность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Транспортная инфраструктура", feature_name: "Велодорожки в профиле улицы", sub_component: null, is_product_feature: true, in_cost: false, tag: "Безопасность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Транспортная инфраструктура", feature_name: "Многоуровневые наземные паркинги", sub_component: null, is_product_feature: true, in_cost: false, tag: "Безопасность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Транспортная инфраструктура", feature_name: "Остановки общественного транспорта", sub_component: null, is_product_feature: false, in_cost: false, tag: "Безопасность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Транспортная инфраструктура", feature_name: "Станции рельсового транспорта (метро, ЛРТ)", sub_component: null, is_product_feature: false, in_cost: false, tag: "Безопасность", dimensions: null, material: null, brand: null, extra_info: null },

  // ─── Окружающая среда / Визуальная инфраструктура ───
  { section: "Окружающая среда", subsection: "Визуальная инфраструктура", feature_name: "Въездные арки в Бигвилль / Отдел продаж", sub_component: null, is_product_feature: true, in_cost: false, tag: "Эмоциональность", dimensions: null, material: "металл", brand: "местные производители", extra_info: null },
  { section: "Окружающая среда", subsection: "Визуальная инфраструктура", feature_name: "Система навигации в Бигвилле / Дизайн-код в благоустройстве", sub_component: null, is_product_feature: true, in_cost: false, tag: "Эмоциональность", dimensions: null, material: "металл, пластик", brand: "местные производители", extra_info: null },

  // ─── Окружающая среда / Зоны рекреации ───
  { section: "Окружающая среда", subsection: "Зоны рекреации", feature_name: "Аллея", sub_component: null, is_product_feature: true, in_cost: false, tag: "Эмоциональность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Зоны рекреации", feature_name: "Сквер", sub_component: null, is_product_feature: true, in_cost: false, tag: "Эмоциональность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Зоны рекреации", feature_name: "Парк", sub_component: null, is_product_feature: true, in_cost: false, tag: "Эмоциональность", dimensions: null, material: null, brand: null, extra_info: null },

  // ─── Окружающая среда / Спортивная инфраструктура ───
  { section: "Окружающая среда", subsection: "Спортивная инфраструктура", feature_name: "Спортивный комплекс", sub_component: null, is_product_feature: true, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Спортивная инфраструктура", feature_name: "Play Hub", sub_component: null, is_product_feature: true, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Спортивная инфраструктура", feature_name: "Sport Hub", sub_component: null, is_product_feature: true, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },

  // ─── Окружающая среда / Коммерческая инфраструктура ───
  { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Магазин", sub_component: null, is_product_feature: false, in_cost: false, tag: "Функциональность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Супермаркет", sub_component: null, is_product_feature: false, in_cost: false, tag: "Функциональность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Кафе / Пекарня", sub_component: null, is_product_feature: false, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Ресторан", sub_component: null, is_product_feature: false, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Аптека", sub_component: null, is_product_feature: false, in_cost: false, tag: "Функциональность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Салон красоты / Барбершоп", sub_component: null, is_product_feature: false, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Фитнес центр", sub_component: null, is_product_feature: false, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Торгово-развлекательный центр", sub_component: null, is_product_feature: false, in_cost: false, tag: "Функциональность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Бизнес центр", sub_component: null, is_product_feature: false, in_cost: false, tag: "Функциональность", dimensions: null, material: null, brand: null, extra_info: null },

  // ─── Окружающая среда / Культура в Бигвилле ───
  { section: "Окружающая среда", subsection: "Культура в Бигвилле", feature_name: "Театр", sub_component: null, is_product_feature: false, in_cost: false, tag: "Эмоциональность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Культура в Бигвилле", feature_name: "Культурный центр (BI Art)", sub_component: null, is_product_feature: true, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Культура в Бигвилле", feature_name: "Соседский центр Yourt", sub_component: null, is_product_feature: true, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Окружающая среда", subsection: "Культура в Бигвилле", feature_name: "Коммьюнити центр", sub_component: null, is_product_feature: true, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },

  // ─── Комьюнити ───
  { section: "Комьюнити", subsection: "Комьюнити", feature_name: "Сервисное обслуживание", sub_component: null, is_product_feature: true, in_cost: false, tag: "Функциональность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Комьюнити", subsection: "Комьюнити", feature_name: "Мобильное приложение BIG App", sub_component: null, is_product_feature: false, in_cost: false, tag: "Эмоциональность", dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Комьюнити", subsection: "Комьюнити", feature_name: "Эко акции BI Green", sub_component: null, is_product_feature: false, in_cost: false, tag: "Социализация", dimensions: null, material: null, brand: null, extra_info: null },

  // ─── Качество / Качественные метрики ───
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Срок строительства", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Качество строительства", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Шумоизоляция", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Цена-ценность", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Сроки сдачи", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Условия покупки", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Репутация бренда", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Безопасность 24/7", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Локация", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Ликвидность", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Количество квартир на площадке", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Посадка-вид из окна", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Сейсмохарактеристика", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Гарантийный срок", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
  { section: "Качество", subsection: "Качественные метрики", feature_name: "Паркинг для электромобилей", sub_component: null, is_product_feature: true, in_cost: false, tag: null, dimensions: null, material: null, brand: null, extra_info: null },
];
