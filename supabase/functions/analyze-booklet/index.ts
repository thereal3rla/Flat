import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

// ─── Product features reference (hardcoded from master XLSX) ───
// Inline to avoid Deno import issues with relative TS files in Edge Functions.
// Fields: section, subsection, feature_name, sub_component, tag, ipf (is_product_feature), ic (in_cost)
const FEATURES_REFERENCE = [
    // ДОМ / Квартира предчистовая
    { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Радиаторы", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Терморегулятор", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Окна", sub_component: "Профиль окна", tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Окна", sub_component: "Стекла", tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Окна", sub_component: "Подоконник", tag: "Функциональность, Безопасность, эмоциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Дверь входная", sub_component: null, tag: "Безопасность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Электрозамок", sub_component: null, tag: "Безопасность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Планшет видеодомофона", sub_component: null, tag: "Безопасность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Дверной проем межкомнатный", sub_component: null, tag: "Эмоциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира предчистовая", feature_name: "Датчики Умного дома", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    // ДОМ / Квартира чистовая
    { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Отделка стен", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Отделка полов", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Отделка потолка", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Сантехника", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Осветительные приборы", sub_component: null, tag: "Функциональность, эмоциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Розетки, включатели", sub_component: null, tag: "Функциональность, безопасность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Двери межкомнатные", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Корпусная мебель", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Мягкая мебель", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Бытовая техника", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Предметы декора (шторы, ковры, картины)", sub_component: null, tag: "Эмоциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Квартира чистовая", feature_name: "Теплый пол", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    // ДОМ / Поэтажный коридор
    { section: "ДОМ", subsection: "Поэтажный коридор", feature_name: "Керамогранит на полу", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Поэтажный коридор", feature_name: "Потолочное освещение", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Поэтажный коридор", feature_name: "Технические двери", sub_component: null, tag: "Функциональность", ipf: false, ic: false },
    { section: "ДОМ", subsection: "Поэтажный коридор", feature_name: "Эвакуационные двери", sub_component: null, tag: "Безопасность", ipf: false, ic: false },
    { section: "ДОМ", subsection: "Поэтажный коридор", feature_name: "Картины", sub_component: null, tag: "Эмоциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Поэтажный коридор", feature_name: "Отделка стен", sub_component: null, tag: "Функциональность", ipf: false, ic: false },
    // ДОМ / Подъезд
    { section: "ДОМ", subsection: "Подъезд", feature_name: "Сквозной подъезд", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Подъезд", feature_name: "Колясочная", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Подъезд", feature_name: "Мебель на 1 эт", sub_component: null, tag: "Функциональность, эмоциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Подъезд", feature_name: "Ароматизаторы", sub_component: null, tag: "Эмоциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Подъезд", feature_name: "Тепловые завесы", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Подъезд", feature_name: "Кондиционеры", sub_component: null, tag: "Эмоциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Подъезд", feature_name: "Отделка 1 и 2 этажей", sub_component: null, tag: "Эмоциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Подъезд", feature_name: "Ресепшн", sub_component: null, tag: "Эмоциональность, социальность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Подъезд", feature_name: "Керамогранит на полу", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Подъезд", feature_name: "Интерьерное освещение", sub_component: null, tag: "Функциональность", ipf: true, ic: false },
    { section: "ДОМ", subsection: "Подъезд", feature_name: "Навигация", sub_component: null, tag: "Функциональность", ipf: true, ic: false },
    { section: "ДОМ", subsection: "Подъезд", feature_name: "Лифты", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    // ДОМ / Паркинг
    { section: "ДОМ", subsection: "Паркинг", feature_name: "Интерьер входа с паркинга", sub_component: null, tag: "Эмоциональность", ipf: true, ic: false },
    { section: "ДОМ", subsection: "Паркинг", feature_name: "Фэйс айди с паркинга", sub_component: null, tag: "Безопасность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Паркинг", feature_name: "Освещение", sub_component: null, tag: "Функциональность, безопасность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Паркинг", feature_name: "Кладовая", sub_component: null, tag: "Функциональность, безопасность", ipf: true, ic: false },
    { section: "ДОМ", subsection: "Паркинг", feature_name: "Велопарковки", sub_component: null, tag: "Функциональность, безопасность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Паркинг", feature_name: "Электрозарядки для электрокаров", sub_component: null, tag: "Функциональность", ipf: true, ic: false },
    { section: "ДОМ", subsection: "Паркинг", feature_name: "Навигация по паркингу", sub_component: null, tag: "Функциональность, эмоциональность", ipf: true, ic: false },
    { section: "ДОМ", subsection: "Паркинг", feature_name: "Планировка паркинга", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "ДОМ", subsection: "Паркинг", feature_name: "Нумерация паркоместа", sub_component: null, tag: "Функциональность", ipf: true, ic: false },
    // ДОМ / Многофункциональные помещения
    { section: "ДОМ", subsection: "Многофункциональные помещения", feature_name: "Кинорум", sub_component: null, tag: "Эмоциональность, социальность", ipf: true, ic: false },
    { section: "ДОМ", subsection: "Многофункциональные помещения", feature_name: "Фитнес", sub_component: null, tag: "Эмоциональность, социальность", ipf: true, ic: false },
    { section: "ДОМ", subsection: "Многофункциональные помещения", feature_name: "Детская комната", sub_component: null, tag: "Эмоциональность, социальность", ipf: true, ic: false },
    { section: "ДОМ", subsection: "Многофункциональные помещения", feature_name: "Коворкинги", sub_component: null, tag: "Эмоциональность, социальность", ipf: true, ic: false },
    // ДОМ / Фасады
    { section: "ДОМ", subsection: "Фасады", feature_name: "Фасад", sub_component: null, tag: "Функциональность, безопасность, эмоциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Фасады", feature_name: "Ночное освещение", sub_component: null, tag: "Функциональность, безопасность, эмоциональность", ipf: true, ic: true },
    { section: "ДОМ", subsection: "Фасады", feature_name: "Логотип компании", sub_component: null, tag: "Эмоциональность", ipf: false, ic: false },
    { section: "ДОМ", subsection: "Фасады", feature_name: "Адресная табличка", sub_component: null, tag: "Функциональность", ipf: false, ic: false },
    // Двор / МАФ-ы
    { section: "Двор", subsection: "МАФ-ы", feature_name: "Детские игровые МАФ-ы", sub_component: null, tag: "Функциональность, социальность", ipf: true, ic: true },
    { section: "Двор", subsection: "МАФ-ы", feature_name: "Беседки", sub_component: null, tag: "Функциональность, социальность", ipf: true, ic: true },
    { section: "Двор", subsection: "МАФ-ы", feature_name: "Скамьи", sub_component: null, tag: "Функциональность, социальность", ipf: true, ic: true },
    { section: "Двор", subsection: "МАФ-ы", feature_name: "Урна", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "Двор", subsection: "МАФ-ы", feature_name: "Песочница", sub_component: null, tag: "Функциональность, эмоциональность, социальность", ipf: true, ic: true },
    { section: "Двор", subsection: "МАФ-ы", feature_name: "Арт инсталляции", sub_component: null, tag: "Эмоциональность", ipf: true, ic: true },
    { section: "Двор", subsection: "МАФ-ы", feature_name: "Садовая мебель", sub_component: null, tag: "Функциональность, социальность", ipf: true, ic: true },
    // Двор / Озеленение
    { section: "Двор", subsection: "Озеленение", feature_name: "Автополив", sub_component: null, tag: "Функциональность", ipf: false, ic: false },
    { section: "Двор", subsection: "Озеленение", feature_name: "Кустарники", sub_component: null, tag: "Функциональность, эмоциональность", ipf: true, ic: true },
    { section: "Двор", subsection: "Озеленение", feature_name: "Деревья", sub_component: null, tag: "Функциональность, эмоциональность", ipf: true, ic: true },
    // Двор / Активный отдых
    { section: "Двор", subsection: "Активный отдых", feature_name: "Футбольное/баскетбольное поле", sub_component: null, tag: "Функциональность, социальность", ipf: true, ic: true },
    { section: "Двор", subsection: "Активный отдых", feature_name: "Уличные тренажеры", sub_component: null, tag: "Функциональность, социальность", ipf: true, ic: true },
    { section: "Двор", subsection: "Активный отдых", feature_name: "зона Work Out", sub_component: null, tag: "Функциональность, социальность", ipf: true, ic: true },
    // Двор / Проезд
    { section: "Двор", subsection: "Проезд", feature_name: "Тартановое покрытие", sub_component: null, tag: "Функциональность, безопасность", ipf: true, ic: true },
    { section: "Двор", subsection: "Проезд", feature_name: "Мощение из брусчатки", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "Двор", subsection: "Проезд", feature_name: "Галька", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "Двор", subsection: "Проезд", feature_name: "Безбарьерная среда", sub_component: null, tag: "Функциональность, безопасность", ipf: true, ic: false },
    { section: "Двор", subsection: "Проезд", feature_name: "Двор без авто", sub_component: null, tag: "Функциональность, безопасность", ipf: true, ic: false },
    { section: "Двор", subsection: "Проезд", feature_name: "Система ливневой канализации", sub_component: null, tag: "Функциональность", ipf: false, ic: false },
    // Двор / Придомовая территория
    { section: "Двор", subsection: "Придомовая территория", feature_name: "Мусорные контейнеры", sub_component: null, tag: "Функциональность", ipf: true, ic: true },
    { section: "Двор", subsection: "Придомовая территория", feature_name: "Открытые паркоместа", sub_component: null, tag: "Функциональность", ipf: true, ic: false },
    { section: "Двор", subsection: "Придомовая территория", feature_name: "Придомовое озеленение", sub_component: null, tag: "Функциональность, эмоциональность", ipf: false, ic: false },
    { section: "Двор", subsection: "Придомовая территория", feature_name: "Пандусы", sub_component: null, tag: "Функциональность, безопасность", ipf: true, ic: false },
    { section: "Двор", subsection: "Придомовая территория", feature_name: "Охранная будка", sub_component: null, tag: "Функциональность, безопасность", ipf: true, ic: true },
    { section: "Двор", subsection: "Придомовая территория", feature_name: "Многоуровневое освещение", sub_component: null, tag: "Функциональность, безопасность", ipf: true, ic: false },
    { section: "Двор", subsection: "Придомовая территория", feature_name: "Видеонаблюдение", sub_component: null, tag: "Безопасность", ipf: true, ic: true },
    // Окружающая среда / Социальная инфраструктура
    { section: "Окружающая среда", subsection: "Социальная инфраструктура", feature_name: "Религиозные объекты (Мечеть, Храм)", sub_component: null, tag: "Эмоциональность", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Социальная инфраструктура", feature_name: "Частный детский сад", sub_component: null, tag: "Социализация", ipf: true, ic: false },
    { section: "Окружающая среда", subsection: "Социальная инфраструктура", feature_name: "Частная Школа", sub_component: null, tag: "Социализация", ipf: true, ic: false },
    { section: "Окружающая среда", subsection: "Социальная инфраструктура", feature_name: "Медицинский центр", sub_component: null, tag: "Безопасность", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Социальная инфраструктура", feature_name: "Районная библиотека", sub_component: null, tag: "Социализация", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Социальная инфраструктура", feature_name: "Частный университет", sub_component: null, tag: "Социализация", ipf: false, ic: false },
    // Окружающая среда / Инфраструктура безопасности
    { section: "Окружающая среда", subsection: "Инфраструктура безопасности", feature_name: "Пункт полиции", sub_component: null, tag: "Безопасность", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Инфраструктура безопасности", feature_name: "Пост охраны Бигвилля", sub_component: null, tag: "Безопасность", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Инфраструктура безопасности", feature_name: "Пожарная часть", sub_component: null, tag: "Безопасность", ipf: false, ic: false },
    // Окружающая среда / Транспортная инфраструктура
    { section: "Окружающая среда", subsection: "Транспортная инфраструктура", feature_name: "Автомобильные улицы", sub_component: null, tag: "Безопасность", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Транспортная инфраструктура", feature_name: "Пешеходные улицы", sub_component: null, tag: "Безопасность", ipf: true, ic: false },
    { section: "Окружающая среда", subsection: "Транспортная инфраструктура", feature_name: "Велодорожки в профиле улицы", sub_component: null, tag: "Безопасность", ipf: true, ic: false },
    { section: "Окружающая среда", subsection: "Транспортная инфраструктура", feature_name: "Многоуровневые наземные паркинги", sub_component: null, tag: "Безопасность", ipf: true, ic: false },
    { section: "Окружающая среда", subsection: "Транспортная инфраструктура", feature_name: "Остановки общественного транспорта", sub_component: null, tag: "Безопасность", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Транспортная инфраструктура", feature_name: "Станции рельсового транспорта (метро, ЛРТ)", sub_component: null, tag: "Безопасность", ipf: false, ic: false },
    // Окружающая среда / Визуальная инфраструктура
    { section: "Окружающая среда", subsection: "Визуальная инфраструктура", feature_name: "Въездные арки в Бигвилль / Отдел продаж", sub_component: null, tag: "Эмоциональность", ipf: true, ic: false },
    { section: "Окружающая среда", subsection: "Визуальная инфраструктура", feature_name: "Система навигации в Бигвилле / Дизайн-код в благоустройстве", sub_component: null, tag: "Эмоциональность", ipf: true, ic: false },
    // Окружающая среда / Зоны рекреации
    { section: "Окружающая среда", subsection: "Зоны рекреации", feature_name: "Аллея", sub_component: null, tag: "Эмоциональность", ipf: true, ic: false },
    { section: "Окружающая среда", subsection: "Зоны рекреации", feature_name: "Сквер", sub_component: null, tag: "Эмоциональность", ipf: true, ic: false },
    { section: "Окружающая среда", subsection: "Зоны рекреации", feature_name: "Парк", sub_component: null, tag: "Эмоциональность", ipf: true, ic: false },
    // Окружающая среда / Спортивная инфраструктура
    { section: "Окружающая среда", subsection: "Спортивная инфраструктура", feature_name: "Спортивный комплекс", sub_component: null, tag: "Социализация", ipf: true, ic: false },
    { section: "Окружающая среда", subsection: "Спортивная инфраструктура", feature_name: "Play Hub", sub_component: null, tag: "Социализация", ipf: true, ic: false },
    { section: "Окружающая среда", subsection: "Спортивная инфраструктура", feature_name: "Sport Hub", sub_component: null, tag: "Социализация", ipf: true, ic: false },
    // Окружающая среда / Коммерческая инфраструктура
    { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Магазин", sub_component: null, tag: "Функциональность", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Супермаркет", sub_component: null, tag: "Функциональность", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Кафе / Пекарня", sub_component: null, tag: "Социализация", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Ресторан", sub_component: null, tag: "Социализация", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Аптека", sub_component: null, tag: "Функциональность", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Салон красоты / Барбершоп", sub_component: null, tag: "Социализация", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Фитнес центр", sub_component: null, tag: "Социализация", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Торгово-развлекательный центр", sub_component: null, tag: "Функциональность", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Коммерческая инфраструктура", feature_name: "Бизнес центр", sub_component: null, tag: "Функциональность", ipf: false, ic: false },
    // Окружающая среда / Культура в Бигвилле
    { section: "Окружающая среда", subsection: "Культура в Бигвилле", feature_name: "Театр", sub_component: null, tag: "Эмоциональность", ipf: false, ic: false },
    { section: "Окружающая среда", subsection: "Культура в Бигвилле", feature_name: "Культурный центр (BI Art)", sub_component: null, tag: "Социализация", ipf: true, ic: false },
    { section: "Окружающая среда", subsection: "Культура в Бигвилле", feature_name: "Соседский центр Yourt", sub_component: null, tag: "Социализация", ipf: true, ic: false },
    { section: "Окружающая среда", subsection: "Культура в Бигвилле", feature_name: "Коммьюнити центр", sub_component: null, tag: "Социализация", ipf: true, ic: false },
    // Комьюнити
    { section: "Комьюнити", subsection: "Комьюнити", feature_name: "Сервисное обслуживание", sub_component: null, tag: "Функциональность", ipf: true, ic: false },
    { section: "Комьюнити", subsection: "Комьюнити", feature_name: "Мобильное приложение BIG App", sub_component: null, tag: "Эмоциональность", ipf: false, ic: false },
    { section: "Комьюнити", subsection: "Комьюнити", feature_name: "Эко акции BI Green", sub_component: null, tag: "Социализация", ipf: false, ic: false },
    // Качество / Качественные метрики
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Срок строительства", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Качество строительства", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Шумоизоляция", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Цена-ценность", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Сроки сдачи", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Условия покупки", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Репутация бренда", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Безопасность 24/7", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Локация", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Ликвидность", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Количество квартир на площадке", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Посадка-вид из окна", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Сейсмохарактеристика", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Гарантийный срок", sub_component: null, tag: null, ipf: true, ic: false },
    { section: "Качество", subsection: "Качественные метрики", feature_name: "Паркинг для электромобилей", sub_component: null, tag: null, ipf: true, ic: false },
];

serve(async (req: Request) => {
    // Extract bookletId early so it's available in catch block
    let bookletId: string | null = null;

    try {
        const { record } = await req.json()
        bookletId = record.id
        const pdfUrl = record.pdf_url

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // 1. Update status to processing
        await supabase
            .from('booklets')
            .update({ status: 'processing' })
            .eq('id', bookletId)

        // 2. Upload PDF to Gemini File API
        console.log('Uploading PDF to Gemini File API...');

        // Local dev fix: 127.0.0.1 is not reachable from within the container
        let fetchUrl = pdfUrl;
        if (fetchUrl.includes('127.0.0.1') || fetchUrl.includes('localhost')) {
            console.log('Transforming local URL for internal networking');
            fetchUrl = fetchUrl.replace('127.0.0.1', 'host.docker.internal').replace('localhost', 'host.docker.internal');
        }

        const fetchPdfResponse = await fetch(fetchUrl);
        if (!fetchPdfResponse.ok) throw new Error(`Failed to fetch PDF from storage (${fetchPdfResponse.status})`);

        const pdfBlob = await fetchPdfResponse.blob();

        const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`;

        if (!GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is missing in Edge Function environment!');
        }

        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'X-Goog-Upload-Protocol': 'resumable',
                'X-Goog-Upload-Command': 'start',
                'X-Goog-Upload-Header-Content-Length': pdfBlob.size.toString(),
                'X-Goog-Upload-Header-Content-Type': 'application/pdf',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: { display_name: `booklet_${bookletId}` } }),
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error(`Gemini Upload Initiation Failed [Status: ${uploadResponse.status}]:`, errorText);
            throw new Error(`Failed to initiate Gemini upload: ${uploadResponse.status}`);
        }

        const uploadLocation = uploadResponse.headers.get('x-goog-upload-url');
        if (!uploadLocation) throw new Error('Failed to get upload location (header missing)');

        const finalUploadResponse = await fetch(uploadLocation, {
            method: 'POST',
            headers: {
                'X-Goog-Upload-Offset': '0',
                'X-Goog-Upload-Command': 'upload, finalize',
            },
            body: pdfBlob,
        });

        const fileInfo = await finalUploadResponse.json();
        const fileUri = fileInfo.file.uri;
        console.log('File uploaded to Gemini:', fileUri);

        // ═══════════════════════════════════════════════════════
        // PASS 1: Floor plan analysis
        // ═══════════════════════════════════════════════════════
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`

        const pass1Prompt = `
### ROLE
You are a Senior Real Estate Data Analyst. Your goal is to structure architectural data with extreme precision.

### OBJECTIVE
Analyze the provided floor plan document. You must group the data hierarchically:
Project -> Entrances (Sections/Подъезды) -> Floor Layouts -> Apartments.

### CRITICAL RULES
1.  HIERARCHY IS KING:
    - First, identify if the building has multiple Sections (Секции) or Entrances (Подъезды).
    - If the document explicitly separates "Section A" and "Section B", you must create two entries in the \`entrances\` array.
    - If no sections are named, create one default entrance named "Main Section".

2.  CALCULATING TOTALS (NO GUESSING):
    - Total Apartments: strictly calculate as:
      SUM( for each layout: \`apartmentsOnLayout\` * \`countOfFloorsWithThisLayout\` ).
    - Explicit Override: If the text says "Total: 150 apartments", trust the text over your calculation.

3.  AI ANALYSIS:
    - Fill the \`aiAnalize\` field with a comprehensive review of the layout efficiency, zoning, and ergonomics in Russian.

### OUTPUT FORMAT
Return ONLY valid JSON. All string values must be in RUSSIAN.

### JSON SCHEMA
{
  "projectInfo": {
    "name": "String (Project Name)",
    "globalSummary": {
      "totalBuildingFloors": number,
      "totalBuildingApartments": number,
      "verificationMethod": "String (e.g., 'Explicit text found: 92' or 'Calculated by summing sections')"
    }
  },
  "entrances": [
    {
      "entranceName": "String (e.g., 'Секция 1', 'Подъезд А')",
      "maxFloors": number,
      "floorLayouts": [
        {
          "floorRange": "String (e.g., '2-9')",
          "floorsCount": number,
          "totalApartmentsOnSingleFloor": number,
          "apartments": [
            {
              "type": "String (e.g., '1-к', '2-к')",
              "area": number,
              "countOnFloor": number
            }
          ]
        }
      ]
    }
  ],
  "aiAnalize": "String (Detailed analysis in Russian. Discuss zoning, pros/cons, light, and space efficiency.)"
}
`;

        const pass1Response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { fileData: { mimeType: "application/pdf", fileUri: fileUri } },
                        { text: pass1Prompt }
                    ]
                }],
                generationConfig: { responseMimeType: "application/json" }
            })
        })

        const pass1Result = await pass1Response.json()

        // Check for Gemini API errors
        if (pass1Result.error) {
            throw new Error(`Gemini Pass 1 error: ${pass1Result.error.message || JSON.stringify(pass1Result.error)}`);
        }
        if (!pass1Result.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Gemini Pass 1 returned empty or blocked response');
        }

        const pass1Text = pass1Result.candidates[0].content.parts[0].text
        const pass1Clean = pass1Text.replace(/```json|```/g, "").trim()
        const analysisData = JSON.parse(pass1Clean)

        // Save Pass 1 result and set status to completed
        await supabase
            .from('booklets')
            .update({
                analysis_info: analysisData,
                status: 'completed'
            })
            .eq('id', bookletId)

        console.log('Pass 1 complete: analysis_info saved');

        // ═══════════════════════════════════════════════════════
        // PASS 2: Product features detection
        // ═══════════════════════════════════════════════════════
        try {
            console.log('Starting Pass 2: product features detection...');

            const refListForPrompt = FEATURES_REFERENCE.map((f, i) => ({
                idx: i,
                section: f.section,
                subsection: f.subsection,
                feature_name: f.feature_name,
                sub_component: f.sub_component,
                tag: f.tag,
            }));

            const pass2Prompt = `
### ROLE
You are a Senior Real Estate Product Analyst. You analyze residential complex marketing booklets to identify product features.

### OBJECTIVE
Analyze the provided PDF booklet and determine which product features from the reference list are mentioned, shown, or implied in the document.

### REFERENCE LIST
Below is the full list of product features to check against the booklet. Each item has an "idx" (index) for identification:

${JSON.stringify(refListForPrompt, null, 0)}

### INSTRUCTIONS
1. For EACH item in the reference list (by idx), determine:
   - "found": boolean — is this feature mentioned, shown in images, or clearly implied in the booklet?
   - "confidence": number 0.0 to 1.0 — how confident are you?
   - "notes": string (max 200 chars, in Russian) — what you found (quote or describe). Empty string if not found.
   - "dimensions": string | null — if the booklet specifies dimensions/sizes for this feature, extract them
   - "material": string | null — if the booklet specifies material, extract it
   - "brand": string | null — if the booklet mentions a brand/manufacturer, extract it
   - "extra_info": string | null — any other relevant details from the booklet

2. You MUST return EXACTLY ${FEATURES_REFERENCE.length} objects, one per reference item, in the same order (idx 0 to ${FEATURES_REFERENCE.length - 1}).

### OUTPUT FORMAT
Return ONLY valid JSON — an array of objects:
[
  { "idx": 0, "found": true, "confidence": 0.95, "notes": "Упоминаются панельные радиаторы на стр 5", "dimensions": "500 мм", "material": "Стальные", "brand": "Sole", "extra_info": null },
  { "idx": 1, "found": false, "confidence": 0.1, "notes": "", "dimensions": null, "material": null, "brand": null, "extra_info": null },
  ...
]
`;

            const pass2Response = await fetch(geminiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { fileData: { mimeType: "application/pdf", fileUri: fileUri } },
                            { text: pass2Prompt }
                        ]
                    }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });

            const pass2Result = await pass2Response.json();

            // Check for Gemini API errors
            if (pass2Result.error) {
                throw new Error(`Gemini Pass 2 error: ${pass2Result.error.message || JSON.stringify(pass2Result.error)}`);
            }
            if (!pass2Result.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('Gemini Pass 2 returned empty or blocked response');
            }

            const pass2Text = pass2Result.candidates[0].content.parts[0].text;
            const pass2Clean = pass2Text.replace(/```json|```/g, "").trim();
            const featuresData: any[] = JSON.parse(pass2Clean);

            // Delete old features for this booklet (supports re-analysis)
            await supabase
                .from('booklet_features')
                .delete()
                .eq('booklet_id', bookletId);

            // Build a lookup map from AI response by idx
            const aiMap = new Map<number, any>();
            for (const item of featuresData) {
                if (item && typeof item.idx === 'number') {
                    aiMap.set(item.idx, item);
                }
            }

            // Iterate over ALL reference items to ensure complete coverage
            const rows = FEATURES_REFERENCE.map((ref, idx) => {
                const aiItem = aiMap.get(idx);
                if (!aiItem) {
                    console.warn(`AI did not return data for feature idx=${idx}: ${ref.feature_name}`);
                }
                return {
                    booklet_id: bookletId,
                    section: ref.section,
                    subsection: ref.subsection,
                    feature_name: ref.feature_name,
                    sub_component: ref.sub_component,
                    is_product_feature: ref.ipf,
                    in_cost: ref.ic,
                    tag: ref.tag,
                    dimensions: aiItem?.dimensions || null,
                    material: aiItem?.material || null,
                    brand: aiItem?.brand || null,
                    extra_info: aiItem?.extra_info || null,
                    found_in_booklet: aiItem?.found === true,
                    ai_confidence: aiItem ? Math.min(1, Math.max(0, Number(aiItem.confidence) || 0)) : 0,
                    ai_notes: aiItem ? (aiItem.notes || '').slice(0, 500) : '',
                };
            });

            const { error: insertError } = await supabase
                .from('booklet_features')
                .insert(rows);

            if (insertError) {
                console.error('Failed to insert features:', insertError.message);
            } else {
                const foundCount = rows.filter(r => r.found_in_booklet).length;
                console.log(`Pass 2 complete: ${rows.length} features saved (${foundCount} found in booklet)`);
            }

        } catch (pass2Error: any) {
            // Pass 2 failure should NOT block the main analysis
            console.error('Pass 2 (features) failed:', pass2Error.message);
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        })

    } catch (error: any) {
        console.error('Edge Function error:', error);

        // Set booklet status to error so it doesn't stay stuck in 'processing'
        if (bookletId) {
            try {
                const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
                await supabase
                    .from('booklets')
                    .update({ status: 'error' })
                    .eq('id', bookletId)
            } catch (updateErr: any) {
                console.error('Failed to set error status:', updateErr.message);
            }
        }

        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
})
