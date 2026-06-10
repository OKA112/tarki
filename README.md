# TARKI

Мебельная мастерская в Махачкале — сайт.

Премиум-сайт мебельного бренда с двумя режимами восприятия (для дома / для дачи), полнофункциональным каталогом, страницами товаров, SEO-лендингами и плавными анимациями. Без сборщиков, фреймворков и build-step — чистый HTML / CSS / JavaScript.

## Демо

- 🏠 Главная: [`/index.html`](./index.html)
- 📦 Каталог: [`/catalog.html`](./catalog.html)
- 🛋 Лендинг для дома: [`/home.html`](./home.html)
- 🌳 Лендинг для дачи: [`/dacha.html`](./dacha.html)

## Ключевые фичи

- **Двойная идентичность бренда** — переключатель «Для дома / Для дачи». Меняется палитра, шрифты, копирайтинг, плотность каталога, рекомендации.
- **Affinity-движок** — каждый из 77+ товаров получает оценку соответствия каждому режиму на основе категории, материалов, цены. Каталог сортируется по active mode.
- **Welcome-экран первого визита** — мягкая сегментация по цели визита.
- **Полнофункциональный каталог** — фильтры (категории, материалы, цена, вместимость, сценарии использования), поиск, сортировка, чипы, пагинация, quick view.
- **Страница товара** — галерея, конфигуратор отделки/ткани/размера, калькулятор цены, cross-mode discovery («А есть ли это для дачи?»), spec-таблица, похожие товары.
- **SEO-лендинги** — две посадочные страницы под разные поисковые запросы, авто-устанавливают режим.
- **Избранное** — в localStorage, drawer-панель, обновляется через CustomEvent.
- **Двуязычность RU / EN** — переключатель в навбаре, тексты в `data-ru` / `data-en` атрибутах.
- **Адаптив** — 4 брейкпоинта (1280, 1100, 760, 540), плавные `clamp()` размеры.
- **Анимации** — кастомный курсор, magnetic-кнопки, scroll-reveal через IntersectionObserver, sticky-эффекты. Все уважают `prefers-reduced-motion`.

## Стек

- HTML5
- CSS (CSS-переменные для тем, Grid, Flexbox)
- Vanilla JavaScript (no frameworks, no build)
- Google Fonts (Bodoni Moda, Jost, Yeseva One, Spectral, Caveat)
- LocalStorage для wishlist + mode preference

**Никаких** npm-пакетов, бандлеров, прекомпиляторов. Открыл файл в браузере → работает.

## Локальный запуск

### Вариант 1. Python (без установки чего-либо ещё)

```bash
cd "Claude Code"
python3 -m http.server 5173
```

Открой `http://localhost:5173/index.html`.

### Вариант 2. VSCode + Live Server

1. Установи расширение **Live Server** в VSCode
2. Правый клик на `index.html` → **Open with Live Server**

### Вариант 3. Любой статический сервер

`npx serve`, `php -S localhost:8000`, nginx, и т.д. — что угодно. Просто статика.

## Структура проекта

```
.
├── index.html          # Главная страница
├── catalog.html        # Каталог со всем ассортиментом
├── product.html        # Страница товара (динамически из ?id=...)
├── home.html           # SEO-лендинг «Для дома»
├── dacha.html          # SEO-лендинг «Для дачи»
│
├── styles.css          # Общая дизайн-система + темы
├── catalog.css         # Стили каталога
├── product.css         # Стили страницы товара
├── landing.css         # Стили лендингов
├── welcome.css         # Welcome-экран
│
├── products.js         # ЕДИНСТВЕННОЕ место хранения данных о товарах
├── affinity.js         # Алгоритм mode-affinity
├── wishlist.js         # Модуль избранного
├── welcome.js          # Welcome-экран
├── script.js           # Общая логика всех страниц
├── homepage.js         # Логика главной (featured + categories rail)
├── catalog.js          # Логика каталога (фильтры, сортировка, рендер)
├── product.js          # Логика страницы товара
├── landing.js          # Логика лендингов
│
└── images/products/    # Фото товаров по категориям
    ├── armchairs/
    ├── sofas/
    ├── beds/
    ├── dining/
    ├── storage/
    ├── terraces/
    ├── loungers/
    ├── pavilions/
    ├── swings/
    ├── pillows/
    ├── rugs/
    └── README.md       # Инструкция по именам, размерам, сжатию
```

## Как добавлять товары

Все товары живут в одном файле — `products.js`. Каждый товар описывается как объект:

```js
R({
  id:           'gracia',
  nameRu:       'Кресло «Грация»',
  nameEn:       'Grace Armchair',
  category:     'armchairs',
  price:        64000,
  materials:    ['oak', 'linen', 'brass'],
  capacity:     1,
  sizeRu:       '78×85 см',
  sizeEn:       '78×85 cm',
  isBestseller: true,
  isNew:        false,
  images: [
    'images/products/armchairs/gracia-1.jpg',
    'images/products/armchairs/gracia-2.jpg'
  ],
  shortDescRu:  '...',
  shortDescEn:  '...',
  descRu:       '...',
  descEn:       '...',
  specs:        [ ... ]
})
```

Подробная инструкция и шаблон — в комментариях к фабрике `R()` внутри `products.js`.

## Категории

| ID | Название | Родитель |
|---|---|---|
| `armchairs` | Кресла | Для дома |
| `sofas` | Диваны | Для дома |
| `beds` | Кровати | Для дома |
| `dining` | Обеденные группы | Для дома |
| `storage` | Шкафы и хранение | Для дома |
| `terraces` | Террасы | Для дачи |
| `loungers` | Лежаки и кушетки | Для дачи |
| `pavilions` | Беседки | Для дачи |
| `swings` | Качели и гамаки | Для дачи |
| `pillows` | Подушки и пледы | Текстиль и декор |
| `rugs` | Дорожки и ковры | Текстиль и декор |

## Материалы

`oak` · `ash` · `teak` · `linden` · `linen` · `wool` · `velour` · `aluminum` · `steel` · `rattan` · `polymer` · `brass` · `ceramic` · `glass`

## Деплой

Поскольку проект — чистая статика, его можно опубликовать **бесплатно** на:

- **GitHub Pages** — `Settings → Pages → Source: main branch`
- **Netlify** — drag-n-drop папки на [netlify.com/drop](https://app.netlify.com/drop)
- **Vercel** — `vercel deploy` из CLI
- **Cloudflare Pages** — подключить репозиторий

Никакого `npm run build` не требуется.

## Лицензия

MIT — см. [LICENSE](./LICENSE).
