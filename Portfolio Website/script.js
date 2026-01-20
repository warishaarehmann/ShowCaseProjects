const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Close menu when clicking any nav link (mobile)
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});

// // Contact form demo message (no backend)
// const contactForm = document.getElementById("contactForm");
// const formMsg = document.getElementById("formMsg");

// contactForm.addEventListener("submit", (e) => {
//   e.preventDefault();
//   formMsg.textContent = "Message sent! (Demo - connect backend to receive emails)";
//   contactForm.reset();
// });

// Scroll reveal animation
const revealElements = document.querySelectorAll(".section, .hero-left, .hero-right, .project-card, .skill-card");

revealElements.forEach((el) => el.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((el) => observer.observe(el));

const bars = document.querySelectorAll(".skill-bar span");

const barObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.transition = "width 1.2s ease";
    }
  });
}, { threshold: 0.4 });

bars.forEach((bar) => barObserver.observe(bar));

const typingText = document.getElementById("typingText");

const roles = [
  "Frontend Developer ✨",
  "React Learner 💜",
  "UI/UX Enthusiast 🌸",
  "Problem Solver 💡"
];

let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function typeEffect() {
  const currentRole = roles[roleIndex];

  if (!deleting) {
    typingText.textContent = currentRole.slice(0, charIndex++);
    if (charIndex > currentRole.length) {
      deleting = true;
      setTimeout(typeEffect, 900);
      return;
    }
  } else {
    typingText.textContent = currentRole.slice(0, charIndex--);
    if (charIndex < 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      charIndex = 0;
    }
  }

  setTimeout(typeEffect, deleting ? 45 : 70);
}

typeEffect();

const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    if (scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navItems.forEach((a) => {
    a.classList.remove("active");
    if (a.getAttribute("href") === `#${current}`) {
      a.classList.add("active");
    }
  });
});

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 350) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const glow = document.createElement("div");
glow.className = "cursor-glow";
document.body.appendChild(glow);

window.addEventListener("mousemove", (e) => {
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

function tiltCard(card) {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `rotateX(${rotateX * -1}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0px)";
  });
}

document.querySelectorAll(".project-card, .skill-card").forEach(tiltCard);
