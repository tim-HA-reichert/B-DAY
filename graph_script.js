const DATA = [
  { name: 'Remi',           attending: 'ja',  mat: 'ja',  food: 'Mother India',  kino: 'ja',  movie: 'Jumanji'       },
  { name: 'Helene',         attending: 'ja',  mat: 'ja',  food: 'Mother India',  kino: 'ja',  movie: 'Jumanji'       },
  { name: 'Richard',        attending: 'nei', mat: '',    food: '',              kino: '',    movie: ''              },
  { name: 'Julianne',       attending: 'nei', mat: '',    food: '',              kino: '',    movie: ''              },
  { name: 'Thomas',         attending: 'ja',  mat: 'ja',  food: 'Amigos',        kino: 'ja',  movie: 'Jumanji'       },
  { name: 'Catalina',       attending: 'nei', mat: '',    food: '',              kino: '',    movie: ''              },
  { name: 'Daniel E',       attending: 'nei', mat: '',    food: '',              kino: '',    movie: ''              },
  { name: 'Adrian',         attending: 'nei', mat: '',    food: '',              kino: '',    movie: ''              },
  { name: 'Sanne',          attending: 'nei', mat: '',    food: '',              kino: '',    movie: ''              },
  { name: 'Julianne',       attending: 'nei', mat: '',    food: '',              kino: '',    movie: ''              },
  { name: 'Nicklas',        attending: 'ja',  mat: 'ja',  food: 'Amigos',        kino: 'nei', movie: ''              },
  { name: 'Farah',          attending: 'nei', mat: '',    food: '',              kino: '',    movie: ''              },
  { name: 'Linda Leirpoll', attending: 'ja',  mat: 'ja',  food: 'Mother India',  kino: 'ja',  movie: 'Jumanji'       },
  { name: 'Audun',          attending: 'nei', mat: '',    food: '',              kino: '',    movie: ''              },
  { name: 'Ane',            attending: 'ja',  mat: 'ja',  food: 'Til Stede',     kino: 'ja',  movie: 'Jumanji'       },
  { name: 'Grunde',         attending: 'ja',  mat: 'ja',  food: 'Amigos',        kino: 'ja',  movie: 'Jumanji'       },
  { name: 'Autz',           attending: 'ja',  mat: 'ja',  food: 'Mother India',  kino: 'ja',  movie: 'Spirited Away' },
  { name: 'Jachra',         attending: 'ja',  mat: 'ja',  food: 'Mother India',  kino: 'ja',  movie: 'Yes Man'       },
  { name: 'Anlaug Helene',  attending: 'ja',  mat: 'ja',  food: 'Amigos',        kino: 'ja',  movie: 'Jumanji'       },
  { name: 'Olav',           attending: 'ja',  mat: 'ja',  food: 'Amigos',        kino: 'ja',  movie: 'Jumanji'       },
  { name: 'Max',            attending: 'ja',  mat: 'ja',  food: 'Amigos',        kino: 'ja',  movie: 'Jumanji'       },
  { name: 'Christine',      attending: 'ja',  mat: 'ja',  food: 'Til Stede',     kino: 'ja',  movie: 'Yes Man'       },
  { name: 'Tim',            attending: 'ja',  mat: 'ja',  food: 'Mother India',  kino: 'ja',  movie: 'Spirited Away' },
  { name: 'Johanne',        attending: 'ja',  mat: 'ja',  food: 'STEMMELØS, VIL KUN SPISE',              kino: 'nei', movie: ''              },
  { name: 'Mads',           attending: 'ja',  mat: 'ja',  food: 'STEMMELØS, VIL KUN SPISE',              kino: 'nei', movie: ''              },
  { name: 'Elea',           attending: 'ja',  mat: 'ja',  food: 'STEMMELØS, VIL KUN SPISE',              kino: 'nei', movie: ''              },
];

// ───────────────────────────────────────────────────────────────────────────

const charts = {};

renderStats(DATA);

function renderStats(submissions) {
  const coming     = submissions.filter(s => s.attending === 'ja');
  const cantCome   = submissions.filter(s => s.attending === 'nei');
  const matComing  = coming.filter(s => s.mat === 'ja');
  const kinoComing = coming.filter(s => s.kino === 'ja');

  document.getElementById('val-total').textContent  = submissions.length;
  document.getElementById('val-coming').textContent = coming.length;
  document.getElementById('val-mat').textContent    = matComing.length;
  document.getElementById('val-kino').textContent   = kinoComing.length;

  const foodCounts = { 'Mother India': 0, 'Amigos': 0, 'Til Stede': 0 };
  matComing.forEach(s => { if (s.food in foodCounts) foodCounts[s.food]++; });
  renderBar('food-chart', Object.keys(foodCounts), Object.values(foodCounts), '#FF6B2B');

  const movieCounts = { 'Jumanji': 0, 'Spirited Away': 0, 'Yes Man': 0 };
  kinoComing.forEach(s => { if (s.movie in movieCounts) movieCounts[s.movie]++; });
  renderBar('movie-chart', Object.keys(movieCounts), Object.values(movieCounts), '#8338EC');

  const tbody = document.getElementById('guest-tbody');
  tbody.innerHTML = '';

  coming.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${esc(s.name) || '—'}</td>
      <td>${yesno(s.mat === 'ja', '🍝 Ja')}</td>
      <td>${yesno(s.kino === 'ja', '🎬 Ja')}</td>
      <td>${s.food ? `<span class="badge badge-orange">${esc(s.food)}</span>` : '<span class="badge badge-muted">—</span>'}</td>
      <td>${s.movie ? `<span class="badge badge-purple">${esc(s.movie)}</span>` : '<span class="badge badge-muted">—</span>'}</td>
    `;
    tbody.appendChild(tr);
  });

  cantCome.forEach(s => {
    const tr = document.createElement('tr');
    tr.style.opacity = '0.45';
    tr.innerHTML = `
      <td>${esc(s.name) || '—'}</td>
      <td colspan="5"><span class="badge badge-muted">Kommer ikke</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderBar(id, labels, data, color) {
  if (charts[id]) charts[id].destroy();
  const ctx = document.getElementById(id).getContext('2d');
  charts[id] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: color + '28',
        borderColor: color,
        borderWidth: 2,
        borderRadius: 10,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          ticks: { stepSize: 1, font: { family: 'Nunito', weight: '700', size: 10 } },
          grid: { color: '#EDE4FA' },
          border: { display: false },
        },
        x: {
          ticks: { font: { family: 'Nunito', weight: '700', size: 10 } },
          grid: { display: false },
          border: { display: false },
        }
      }
    }
  });
}

function yesno(yes, label) {
  return yes
    ? `<span class="badge badge-green">${label}</span>`
    : `<span class="badge badge-muted">Nei</span>`;
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
