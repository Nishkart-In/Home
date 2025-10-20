/*
  consent.js — Drop-in scaffold for Privacy & Consent
  - Sets Google Consent Mode v2 defaults (denied)
  - Exposes window.nkConsent.onGranted() to be called by your CMP when user accepts
  - Provides a lightweight fallback banner for non-EEA use (NOT Google-certified)
*/

(function(){
  // dataLayer/gtag bootstrap (before any Google tags)
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ dataLayer.push(arguments); };

  // Default: Denied until consent is obtained
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
  });

  // Namespace
  window.nkConsent = window.nkConsent || {};

  // Called by CMP on "accept all"
  window.nkConsent.onGranted = function(){
    try {
      gtag('consent', 'update', {
        'ad_storage': 'granted',
        'analytics_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
    } catch(e){}

    // Render AdSense slots if present
    try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e){}

    // Remember local state for basic fallback
    try { localStorage.setItem('nk_consent', 'granted'); } catch(e){}
    hideBanner();
  };

  // Called by CMP when user rejects
  window.nkConsent.onDenied = function(){
    try {
      gtag('consent', 'update', {
        'ad_storage': 'denied',
        'analytics_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    } catch(e){}
    try { localStorage.setItem('nk_consent', 'denied'); } catch(e){}
    hideBanner();
  };

  // ---------- Lightweight fallback banner (NOT a certified CMP) ----------
  function createBanner(){
    if (document.getElementById('nk-c-banner')) return;
    var b = document.createElement('div');
    b.id = 'nk-c-banner';
    b.style.cssText = 'position:fixed;inset:auto 0 0 0;background:#0b0d11;color:#c6cbd8;border-top:1px solid #2b3240;padding:12px 16px;display:flex;gap:12px;align-items:center;z-index:9999;flex-wrap:wrap';
    b.innerHTML = '\
      <span style="flex:1;min-width:200px">We use cookies for ads & measurement. See our <a href="privacy.html" style="color:#9bb1ff">Privacy Policy</a>.</span>\
      <div style="display:flex;gap:8px">\
        <button id="nk-accept" style="padding:8px 12px;border-radius:10px;border:1px solid #2b3240;background:#131722;color:#fff">Accept</button>\
        <button id="nk-reject" style="padding:8px 12px;border-radius:10px;border:1px solid #2b3240;background:#131722;color:#fff">Reject</button>\
      </div>';
    document.body.appendChild(b);
    document.getElementById('nk-accept').onclick = window.nkConsent.onGranted;
    document.getElementById('nk-reject').onclick = window.nkConsent.onDenied;
  }
  function hideBanner(){
    var b = document.getElementById('nk-c-banner');
    if (b) b.remove();
  }

  // Show fallback only if no certified CMP appears AND no stored choice
  function maybeShowFallback(){
    try {
      var s = localStorage.getItem('nk_consent');
      if (s === 'granted') { window.nkConsent.onGranted(); return; }
      if (s === 'denied') { window.nkConsent.onDenied(); return; }
    } catch(e){}
    // Give CMP a moment to initialize; if nothing shows, display fallback
    setTimeout(function(){
      if (!document.querySelector('[data-cmp-consent], .qc-cmp2-container, .uc-banner, .cky-consent-container')) {
        createBanner();
      }
    }, 1200);
  }

  // Expose a "reopen settings" hook for footer button
  window.nkConsent.openSettings = function(){
    // Replace with your CMP’s API call, e.g. window.cookieyes?.openSettings();
    // Fallback: re-show our basic banner
    createBanner();
  };

  // Init on DOM ready
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', maybeShowFallback);
  } else {
    maybeShowFallback();
  }
})();
