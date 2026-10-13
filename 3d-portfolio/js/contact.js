/* Contact page: email, project brief, socials, Discord and rate sheet. */
(function () {
  'use strict';

  const data = window.PORTFOLIO;
  const site = window.Site;
  if (!data || !data.contact || !site) return;

  const { $, esc } = site;
  const contact = data.contact;
  const email = data.artist.email;

  renderEmail();
  renderBrief();
  renderSocials();
  renderDiscord();
  renderRates();

  function renderEmail() {
    const link = $('[data-email-link]');
    const copy = $('[data-email-copy]');
    const status = $('[data-email-status]');
    if (!link) return;
    link.href = `mailto:${email}`;
    link.textContent = email;
    $('[data-brief-email]').textContent = email;

    if (!copy) return;
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(email);
        status.textContent = 'Email address copied';
      } catch (err) {
        status.textContent = 'Couldn’t copy. Select the address to copy it.';
      }
      copy.classList.add('is-done');
      setTimeout(() => {
        copy.classList.remove('is-done');
        status.textContent = '';
      }, 2400);
    });
  }

  // The brief opens the visitor's email app with everything filled in: no server needed.
  function renderBrief() {
    const form = $('[data-brief]');
    if (!form) return;
    const options = (list) => list.map((v) => `<option>${esc(v)}</option>`).join('');
    $('[name="type"]', form).insertAdjacentHTML('beforeend', options(contact.projectTypes));
    $('[name="budget"]', form).insertAdjacentHTML('beforeend', options(contact.budgets));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const subject = `Project inquiry: ${f.get('type') || 'New project'}`;
      const body = [
        `Name: ${f.get('name')}`,
        `Project type: ${f.get('type') || '-'}`,
        `Budget: ${f.get('budget') || '-'}`,
        `Timeline: ${f.get('timeline') || '-'}`,
        '',
        f.get('message'),
      ].join('\n');
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  function renderSocials() {
    const list = $('[data-social-cards]');
    if (!list) return;
    list.innerHTML = data.artist.socials
      .map((s) => `<li><a class="social" href="${esc(s.url)}" target="_blank" rel="noopener">
        <span class="social-name">${esc(s.label)}</span>
        <span class="social-handle">${esc(s.handle || '')}</span>
        <span class="social-arrow" aria-hidden="true">&#8599;</span>
      </a></li>`)
      .join('');
  }

  function renderDiscord() {
    const box = $('[data-discord]');
    const d = contact.discord;
    if (!box || !d) return;
    box.innerHTML = `<h2 class="contact-heading">Join the community</h2>
      <p class="discord-name">${esc(d.name)} on Discord</p>
      <p class="contact-text">${esc(d.text)}</p>
      <a class="btn btn-ghost" href="${esc(d.url)}" target="_blank" rel="noopener">Join the server</a>`;
  }

  function renderRates() {
    const box = $('[data-rates]');
    const rates = contact.rates;
    if (!box || !rates) return;

    const download = rates.file
      ? `<a class="btn btn-ghost" href="${esc(rates.file)}" download>Download rate sheet (PDF)</a>`
      : `<button class="btn btn-ghost" type="button" data-print-rates>Save rate sheet as PDF</button>`;

    box.innerHTML = `<div class="rates-head">
        <div>
          <h2 class="contact-heading" id="rates-title">Rate sheet</h2>
          <p class="contact-text">${esc(rates.note)}</p>
        </div>
        <div class="rates-actions">${download}</div>
      </div>
      <p class="print-only">${esc(data.artist.name)} · ${esc(data.artist.title)} · ${esc(email)}</p>
      <div class="rates-table-wrap">
        <table class="rates-table">
          <thead><tr><th scope="col">Service</th><th scope="col">What’s included</th><th scope="col">Price</th></tr></thead>
          <tbody>
            ${rates.items.map((r) => `<tr>
              <th scope="row">${esc(r.service)}</th>
              <td>${esc(r.details)}</td>
              <td class="rate-price"><strong>${esc(r.price)}</strong><span>${esc(r.unit)}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    // Print only the rate sheet; the browser's print dialog offers "Save as PDF".
    const print = $('[data-print-rates]', box);
    if (print) {
      print.addEventListener('click', () => {
        document.documentElement.classList.add('print-rates');
        window.print();
      });
      window.addEventListener('afterprint', () => document.documentElement.classList.remove('print-rates'));
    }
  }
})();
