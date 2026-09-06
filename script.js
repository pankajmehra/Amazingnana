// Google Analytics 4 for Amazing Nana
(function initGoogleAnalytics() {
  const measurementId = 'G-W71K9PELRB';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true
  });

  const analyticsScript = document.createElement('script');
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(analyticsScript);
})();

const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');

if (toggle && links) {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (event) => {
    if (!links.contains(event.target) && !toggle.contains(event.target)) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// On the Grandma's House checklist, keep the main article visually clean by
// moving the larger affiliate disclosure to the footer area.
if (window.location.pathname.endsWith('/things-to-keep-at-grandmas-house.html')) {
  const disclosure = document.querySelector('.shop-note');
  const footerLegal = document.querySelector('.footer .legal');

  if (disclosure && footerLegal) {
    const footerDisclosure = document.createElement('div');
    footerDisclosure.className = 'legal';
    footerDisclosure.innerHTML = '<strong>Affiliate disclosure:</strong> This page contains Amazon affiliate links. As an Amazon Associate I earn from qualifying purchases, at no extra cost to you. Prices and availability can change. <a href="disclosure.html">Learn more</a>.';
    footerLegal.before(footerDisclosure);
    disclosure.remove();
  }
}

// Track monetization clicks in GA4 so we can see which page, category and product
// produces buying intent before Amazon reports a commission.
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || typeof window.gtag !== 'function') return;

  const href = link.href;
  const isAmazonAffiliate = /amazon\.com|amzn\.to/i.test(href);

  if (isAmazonAffiliate) {
    window.gtag('event', 'affiliate_click', {
      affiliate_network: 'Amazon',
      product_name: link.dataset.product || (link.textContent || '').trim(),
      affiliate_category: link.dataset.affiliateCategory || 'unspecified',
      link_url: href,
      link_text: (link.textContent || '').trim(),
      page_path: window.location.pathname,
      page_title: document.title
    });
  }
});
