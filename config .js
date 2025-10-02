// config.js — put this file in your site root (same folder as index.html)
//
// FILL THESE 3 FIELDS ↓↓↓
// - SUPABASE_URL: from Supabase → Project Settings → API (looks like https://xxxx.supabase.co)
// - SUPABASE_ANON_KEY: from the same page (the 'anon' public key)
// - WA_NUMBER: your WhatsApp number (no + sign), e.g. 9198XXXXXXXX

window.NKCFG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_PUBLIC_ANON_KEY",
  WA_NUMBER: "91XXXXXXXXXX"
};

// Optional: gentle reminder if you forgot to fill it
(function(){
  try {
    const c = window.NKCFG || {};
    const looksBlank = !String(c.SUPABASE_URL).includes(".supabase.co") || String(c.SUPABASE_ANON_KEY).length < 20;
    if (looksBlank) {
      console.warn("[config.js] Please fill SUPABASE_URL and SUPABASE_ANON_KEY with your real values from Supabase Settings → API.");
    }
  } catch {}
})();