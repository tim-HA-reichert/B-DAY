console.log("ikke se her det er vibe-coded som f")

// ── CONFIG ──────────────────────────────────────────────
const PARTY_PASSWORD = 'max32'; //HEHE SECURITY-MANNEN
const FORMSPREE_URL  = 'https://formspree.io/f/mpqeelqk'; // TODO: swap in your real endpoint

// ── INIT ────────────────────────────────────────────────
(function init() {
  // Already submitted — skip gate, show done state
  if (localStorage.getItem('rsvp_done')) {
    showAlreadySubmitted();
    return;
  }
  // Not authenticated — show gate and hide page content beneath it
  if (!localStorage.getItem('party_auth')) {
    document.getElementById('pw-gate').classList.add('visible');
    document.body.classList.add('gate-active');
  }
  // Ensure a stable guest ID exists for this browser
  if (!localStorage.getItem('guest_id')) {
    localStorage.setItem('guest_id', crypto.randomUUID());
  }
})();

// ── PASSWORD GATE ────────────────────────────────────────
function submitPassword() {
  const val = document.getElementById('pw-input').value;
  if (val === PARTY_PASSWORD) {
    localStorage.setItem('party_auth', '1');
    const gate = document.getElementById('pw-gate');
    gate.classList.add('closing');
    gate.addEventListener('animationend', () => {
      gate.classList.remove('visible', 'closing');
      document.body.classList.remove('gate-active');
      document.body.classList.add('after-gate');
    }, { once: true });
  } else {
    document.getElementById('pw-error').textContent = 'Feil passord, prøv igjen 🙈';
  }
}

// ── ALREADY SUBMITTED ────────────────────────────────────
function showAlreadySubmitted() {
  document.querySelectorAll('.form-block, .submit-block').forEach(el => el.style.display = 'none');
  const panel = localStorage.getItem('rsvp_type') === 'cantcome' ? 'success-cant' : 'success';
  document.getElementById(panel).classList.add('show');
}

// ── RADIO CARDS ──────────────────────────────────────────
const movieTitles = { jumanji: 'Jumanji', spirited: 'Spirited Away', yesman: 'Yes Man' };
const foodTitles  = { motherindia: 'Mother India', amigos: 'Amigos', tilstede: 'Til Stede' };

function pick(el) {
  const g = el.dataset.g;
  document.querySelectorAll('.card-opt[data-g="' + g + '"]').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

// ── HELPERS ──────────────────────────────────────────────
function requireName() {
  const name = document.getElementById('guest-name').value.trim();
  const err  = document.getElementById('name-error');
  if (!name) {
    err.textContent = '👆 Skriv inn navnet ditt først!';
    err.classList.add('show');
    document.getElementById('guest-name').focus();
    return null;
  }
  err.classList.remove('show');
  return name;
}

// ── SUBMIT ───────────────────────────────────────────────
async function doSubmit() {
  const name = requireName();
  if (!name) return;

  const moviePick = document.querySelector('.card-opt[data-g="movie"].selected');
  if (!moviePick) {
    const result = document.getElementById('movie-result');
    result.textContent = '👆 Velg en film først!';
    result.classList.add('show', 'error');
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const foodPick = document.querySelector('.card-opt[data-g="food"].selected');
  if (!foodPick) {
    const result = document.getElementById('food-result');
    result.textContent = '👆 Velg en restaurant først!';
    result.classList.add('show', 'error');
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const acceptErr = document.getElementById('accept-error');
  if (!document.getElementById('accept-200').checked) {
    acceptErr.textContent = '👆 Du må akseptere betalingen først!';
    acceptErr.classList.add('show');
    acceptErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  acceptErr.classList.remove('show');

  const btn = document.querySelector('#submit-block .submit-btn');
  btn.disabled = true;
  btn.textContent = 'Sender…';

  const payload = {
    name:     name,
    nickname: document.getElementById('nick-name').value.trim(),
    movie:    movieTitles[moviePick.dataset.v] || moviePick.dataset.v,
    food:     foodTitles[foodPick.dataset.v]   || foodPick.dataset.v,
    attending: 'ja jeg kommer',
    vippskrav: 'JEG AKSEPTERER VIPPSKRAV 200KR',
    guest_id:  localStorage.getItem('guest_id'),
  };

  try {
    const res = await fetch(FORMSPREE_URL, {
      method:  'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('server error');

    // Lock fields
    document.querySelectorAll('.card-opt').forEach(c => c.classList.add('locked'));
    document.getElementById('guest-name').disabled = true;
    document.getElementById('nick-name').disabled  = true;

    localStorage.setItem('rsvp_done', '1');
    localStorage.setItem('rsvp_type', 'coming');
    document.getElementById('submit-block').style.display = 'none';
    document.getElementById('success').classList.add('show');
  } catch {
    btn.disabled    = false;
    btn.textContent = 'JEG KOMMER 🎉';
    const result = document.getElementById('movie-result');
    result.textContent = '⚠️ Noe gikk galt, prøv igjen!';
    result.classList.add('show', 'error');
  }
}

// ── CANT COME ────────────────────────────────────────────
async function cantCome() {
  const name = requireName();
  if (!name) return;

  const btn = document.querySelector('#submit-block .cant-come-btn');
  btn.disabled = true;
  btn.textContent = 'Sender…';

  try {
    const res = await fetch(FORMSPREE_URL, {
      method:  'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, attending: 'nei', message: 'i cant come...', guest_id: localStorage.getItem('guest_id') }),
    });

    if (!res.ok) throw new Error('server error');

    document.querySelectorAll('.card-opt').forEach(c => c.classList.add('locked'));
    document.getElementById('guest-name').disabled = true;
    document.getElementById('nick-name').disabled  = true;

    localStorage.setItem('rsvp_done', '1');
    localStorage.setItem('rsvp_type', 'cantcome');
    document.getElementById('submit-block').style.display = 'none';
    document.getElementById('success-cant').classList.add('show');
  } catch {
    btn.disabled    = false;
    btn.textContent = 'Jeg kan ikke komme 😢';
    const result = document.getElementById('name-error');
    result.textContent = '⚠️ Noe gikk galt, prøv igjen!';
    result.classList.add('show');
  }
}
