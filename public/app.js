let allData = {};
let currentMonth = null;
let npsCurrentIndex = 0;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  loadMonths();
});

// Load months and populate navigation
async function loadMonths() {
  try {
    const response = await fetch('/api/data/latest');
    const months = await response.json();

    // Store all data
    allData = months;
    currentMonth = months[0]; // Set first (latest) month as current

    // Populate month buttons
    const monthsNav = document.getElementById('monthsNav');
    monthsNav.innerHTML = '';

    months.forEach((month, index) => {
      const button = document.createElement('button');
      button.className = `month-button ${index === 0 ? 'active' : ''}`;
      button.textContent = month.monthName;
      button.onclick = () => selectMonth(month.id);
      monthsNav.appendChild(button);
    });

    // Load data for current month
    updateDashboard(currentMonth);
  } catch (error) {
    console.error('Error loading months:', error);
  }
}

// Select a month and update dashboard
function selectMonth(monthId) {
  const monthData = allData.find(m => m.id === monthId);
  if (monthData) {
    currentMonth = monthData;
    updateDashboard(monthData);

    // Update active button
    document.querySelectorAll('.month-button').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Update all dashboard elements
function updateDashboard(data) {
  // Update updated date
  const date = new Date(data.date);
  document.getElementById('updatedDate').textContent = `Aktualizováno: ${date.toLocaleDateString('cs-CZ')}`;

  // Update statistics
  updateStatistic('airportT1', data.stats.airportT1.visitors, data.stats.airportT1.change);
  updateStatistic('airportT2', data.stats.airportT2.visitors, data.stats.airportT2.change);
  updateStatistic('visaAssistance', data.stats.visaAssistance.requests, data.stats.visaAssistance.change);
  updateStatistic('visaDoctor', data.stats.visaDoctor.consultations, data.stats.visaDoctor.change);
  updateStatistic('visaVeterinary', data.stats.visaVeterinary.consultations, data.stats.visaVeterinary.change);

  // Update airport lounges
  updateLounge('t1', data.stats.airportT1);
  updateLounge('t2', data.stats.airportT2);

  // Update story
  updateStory(data.story);

  // Update NPS comments
  updateNPSCarousel(data.npsComments);

  // Update benefits table
  updateBenefitsTable(data.visaBenefits);

  // Update SLA
  updateSLA(data.sla);
}

// Update individual statistic
function updateStatistic(id, value, change) {
  const valueElem = document.getElementById(`stat-${id}`);
  const changeElem = document.getElementById(`change-${id}`);

  if (valueElem) {
    valueElem.textContent = value.toLocaleString();
  }
  if (changeElem) {
    changeElem.textContent = `${change > 0 ? '+' : ''}${change}%`;
    changeElem.className = `stat-change ${change < 0 ? 'negative' : ''}`;
  }
}

// Update lounge information
function updateLounge(terminal, data) {
  document.getElementById(`lounge-${terminal}-visitors`).textContent = data.visitors.toLocaleString();
  document.getElementById(`lounge-${terminal}-reservations`).textContent = data.reservations.toLocaleString();
  document.getElementById(`lounge-${terminal}-rating-value`).textContent = `${data.rating}/5`;

  // Update stars based on rating
  const starsElem = document.getElementById(`lounge-${terminal}-rating`);
  const fullStars = Math.floor(data.rating);
  const halfStar = data.rating % 1 >= 0.5 ? '☆' : '';
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  starsElem.textContent = '★'.repeat(fullStars) + halfStar + '☆'.repeat(emptyStars);
}

// Update story of the month
function updateStory(story) {
  document.getElementById('story-title').textContent = story.title;
  document.getElementById('story-description').textContent = story.description;
}

// Update NPS carousel
function updateNPSCarousel(comments) {
  npsCurrentIndex = 0;
  const carousel = document.getElementById('npsCarousel');
  const dots = document.getElementById('carouselDots');

  // Create carousel content
  carousel.innerHTML = '';
  dots.innerHTML = '';

  comments.forEach((comment, index) => {
    const div = document.createElement('div');
    div.className = 'nps-comment';
    div.style.display = index === 0 ? 'block' : 'none';
    div.innerHTML = `
      <div class="comment-content">
        <div class="comment-text">"${comment.text}"</div>
        <div class="comment-rating">${'★'.repeat(Math.round(comment.rating / 2))}</div>
        <div class="comment-meta">${new Date(comment.date).toLocaleDateString('cs-CZ')}</div>
      </div>
    `;
    carousel.appendChild(div);

    const dot = document.createElement('div');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.onclick = () => showNPSComment(comments, index);
    dots.appendChild(dot);
  });

  // Auto-rotate comments
  setInterval(() => {
    npsCurrentIndex = (npsCurrentIndex + 1) % comments.length;
    showNPSComment(comments, npsCurrentIndex);
  }, 5000);
}

// Show specific NPS comment
function showNPSComment(comments, index) {
  npsCurrentIndex = index;
  const carousel = document.getElementById('npsCarousel');
  const comments_list = carousel.querySelectorAll('.nps-comment');
  const dots = document.querySelectorAll('.dot');

  comments_list.forEach((comment, i) => {
    comment.style.display = i === index ? 'block' : 'none';
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// Update benefits table
function updateBenefitsTable(benefits) {
  const tbody = document.getElementById('benefitsList');
  tbody.innerHTML = benefits
    .map(
      (benefit) => `
    <tr>
      <td class="benefit-name">${benefit.name}</td>
      <td>${benefit.description}</td>
      <td>${benefit.activeUsers.toLocaleString()}</td>
      <td>${benefit.usage}%</td>
      <td class="benefit-rating">${benefit.satisfaction}★</td>
    </tr>
  `
    )
    .join('');
}

// Update SLA metrics
function updateSLA(sla) {
  document.getElementById('sla-20s').textContent = sla.callsAnsweredIn20s + '%';
  document.getElementById('sla-30s').textContent = sla.callsAnsweredIn30s + '%';
  document.getElementById('sla-avg').textContent = sla.averageWaitTime + 's';

  // Update progress bars
  const bars = document.querySelectorAll('.sla-progress');
  bars[0].style.width = sla.callsAnsweredIn20s + '%';
  bars[1].style.width = sla.callsAnsweredIn30s + '%';
}
