// First-run Welcome screen (design-reference/V2-Welcome.dc.html).
import { icon } from '../icons.js';

export function renderWelcome(app, ctx) {
  const resume = !!(ctx.draft && ctx.draft.step && ctx.draft.step !== 'intro');
  app.innerHTML = `
    <section class="welcome">
      <svg class="welcome-rings" width="520" height="520" viewBox="0 0 520 520" aria-hidden="true">
        <circle cx="260" cy="260" r="250" fill="none" stroke="#14233B" stroke-width="2"/>
        <circle cx="260" cy="260" r="200" fill="none" stroke="#14233B" stroke-width="2"/>
        <circle cx="260" cy="260" r="150" fill="none" stroke="#182B48" stroke-width="2"/>
      </svg>
      <div class="welcome-emblem">
        <svg width="150" height="150" viewBox="0 0 120 120" role="img" aria-label="MILITARY FIT emblem: shield with chevrons and a star">
          <path d="M60 8l42 15v32c0 27-19 45-42 53-23-8-42-26-42-53V23z" fill="#172A47" stroke="#F2C14E" stroke-width="4" stroke-linejoin="round"/>
          <path d="M36 62l24 14 24-14M36 76l24 14 24-14" fill="none" stroke="#F2C14E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M60 26l5.3 10.8 11.9 1.7-8.6 8.4 2 11.8L60 53.1l-10.6 5.6 2-11.8-8.6-8.4 11.9-1.7z" fill="#F2C14E"/>
        </svg>
      </div>
      <h1 class="welcome-title"><span>MILITARY</span><span class="gold">FIT</span></h1>
      <p class="welcome-tag">Train. Track. Transform.</p>
      <div class="welcome-foot">
        <a class="btn block" id="start" href="#/onboarding${resume ? '' : '/intro'}">${resume ? 'Continue where you stopped' : 'Get Started'} ${icon('arrow', 22)}</a>
        <p class="muted center">Your personal fitness coach,<br>right on your phone.</p>
      </div>
    </section>`;
  return { tab: 'home', title: 'Welcome' };
}
