// munpie — JavaScript без библиотек

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Мобильное меню
const burger = $('.burger');
const nav = $('#nav');

const setMenu = (open) => {
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  burger.textContent = open ? 'Закрыть' : 'Меню';
};

burger.addEventListener('click', () => {
  setMenu(!nav.classList.contains('open'));
});

nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});

addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    setMenu(false);
    burger.focus();
  }
});

// 2. Подсветка активного раздела и появление блоков при прокрутке
const links = $$('.nav a');
const sections = $$('main section');

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      links.forEach((link) => {
        const isActive = link.hash === `#${entry.target.id}`;
        link.classList.toggle('active', isActive);

        if (isActive) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  $$('.reveal').forEach((element, index) => {
    element.style.transitionDelay = `${(index % 3) * 90}ms`;
    revealObserver.observe(element);
  });
} else {
  $$('.reveal').forEach((element) => element.classList.add('in'));
}

// 3. Фильтрация проектов
const cards = $$('.card');
const empty = $('.empty');

$('.filters').addEventListener('click', (event) => {
  const button = event.target.closest('.f');
  if (!button) return;

  $$('.f').forEach((filter) => {
    const isActive = filter === button;
    filter.classList.toggle('on', isActive);
    filter.setAttribute('aria-pressed', isActive);
  });

  const category = button.dataset.filter;
  let visibleCount = 0;

  cards.forEach((card) => {
    const shouldShow = category === 'all'
      || card.dataset.cat.split(' ').includes(category);

    if (shouldShow) {
      visibleCount += 1;
      card.hidden = false;
      requestAnimationFrame(() => card.classList.remove('out'));
    } else {
      card.classList.add('out');
      setTimeout(() => {
        if (card.classList.contains('out')) card.hidden = true;
      }, reduce ? 0 : 300);
    }
  });

  empty.hidden = visibleCount > 0;
});

// 4. Модальное окно с описанием проекта
const dialog = $('.modal');
let opener = null;

cards.forEach((card) => {
  $('.open', card).addEventListener('click', (event) => {
    opener = event.currentTarget;

    $('.m-art').replaceChildren($('.art', card).cloneNode(true));
    $('#m-num').textContent = $('.num', card).textContent;
    $('#m-title').textContent = opener.textContent;
    $('#m-tags').textContent = $('.tags', card).textContent;
    $('#m-desc').textContent = $('.desc', card).textContent;
    $('#m-more').textContent = $('.more', card).textContent;

    dialog.showModal();
    document.body.style.overflow = 'hidden';
  });
});

$('.close').addEventListener('click', () => dialog.close());

dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

dialog.addEventListener('close', () => {
  document.body.style.overflow = '';
  if (opener) opener.focus();
});

// 5. Курсор-акцент — только для мыши и при включённой анимации
if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
  const cursor = $('.cursor');
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;

  addEventListener('mousemove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  });

  (function animateCursor() {
    x += (targetX - x) * 0.25;
    y += (targetY - y) * 0.25;

    cursor.style.transform = `translate(${x - cursor.offsetWidth / 2}px, ${y - cursor.offsetHeight / 2}px)`;
    requestAnimationFrame(animateCursor);
  })();

  document.addEventListener('mouseover', (event) => {
    cursor.classList.toggle('big', Boolean(event.target.closest('a, button')));
  });
}
