// src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLinkedin, FaInstagram, FaEnvelope, FaBars, FaTimes } from "react-icons/fa";
import logo from "./assets/rabnexlogo.png";
import logo1 from "./assets/Rlogo.png"
import neel from "./assets/neel.jpg";
import bhushan from "./assets/bhushan.jpg"
import atharav from "./assets/atharav.jpg"
import ratan from "./assets/ratan.jpg"
import project1 from './assets/smartgrid.png'
import project2 from './assets/homeautomation.png'
import project3 from './assets/bsf.png'
/**
 * RABNEX Innovations - Single-file App (cleaned)
 * - Canvas particle background
 * - Contact form posts to http://localhost:4000/send
 * - TailwindCSS expected in project
 */

export default function App() {
  // mobile nav
  const [openNav, setOpenNav] = useState(false);

  // contact form state
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ state: "idle", text: "" }); // idle | sending | success | error

  // toast visibility
  const [showToast, setShowToast] = useState(false);

  // canvas ref for animated background
  const canvasRef = useRef(null);

  // team and project sample data
 const team = [
  { name: "Neel Gholkar", img: neel },
  { name: "Ratan Danavale",  img: ratan},
  { name: "Atharav Mali", img: atharav  },
  { name: "Bhushan Patil", img: bhushan},
];


  const projects = [
    { id: 1, title: "Smart Grid Campus", desc: "AI-driven campus energy orchestration", img: project1 },
    { id: 2, title: "Smart Home Automation Hub", desc: "IoT + Cloud Integration for a Smarter Lifestyle", img:project2},
    { id: 3, title: "BSF Smart Tracker", desc: "Seamless VHF, GSM & Satellite Integration for Border Operations", img: project3 },
  ];

  // -------------------------
  // Canvas particle animation
  // -------------------------
  useEffect(() => {
    let raf;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles = [];
    const PARTICLE_COUNT = Math.floor((w * h) / 90000) + 30; // scales with screen size

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function createParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.2, 0.2),
          vy: rand(-0.2, 0.2),
          r: rand(0.6, 2.6),
          hue: rand(200, 220), // bluish hues
          life: rand(80, 300),
        });
      }
    }

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      createParticles();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      // subtle gradient overlay
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "rgba(6,10,20,0.65)");
      grad.addColorStop(0.6, "rgba(3,6,18,0.75)");
      grad.addColorStop(1, "rgba(3,5,10,0.85)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // draw faint grid lines / circuits
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = "#007BFF";
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const y = (h / 12) * i;
        ctx.beginPath();
        ctx.moveTo(0, y + (Math.sin(Date.now() * 0.0005 + i) * 4));
        ctx.lineTo(w, y + (Math.cos(Date.now() * 0.0007 + i) * 4));
        ctx.stroke();
      }
      ctx.restore();

      // particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // wrap
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // glow
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, 0.11)`;
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 90%, 50%, 0.9)`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // connect near particles
      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.strokeStyle = `rgba(0,123,255,${0.12 - d / 1200})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }

    createParticles();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // -----------------------------------------------------
  // Contact form submit (POST to backend, clear on success)
  // -----------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", text: "Sending..." });

    // simple validation
    if (!form.name || !form.email || !form.message) {
      setStatus({ state: "error", text: "Please fill all fields." });
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setStatus({ state: "success", text: "Message sent successfully!" });
        setForm({ name: "", email: "", message: "" }); // CLEAR form
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3500);
      } else {
        setStatus({ state: "error", text: data?.message || "Failed to send" });
      }
    } catch (err) {
      console.error(err);
      setStatus({ state: "error", text: "Network error. Try again." });
    }
  };

  // small helper for input change
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // quick scroll helper (close mobile nav)
  const goto = (id) => {
    setOpenNav(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // motion variants
  const cardVariants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="relative min-h-screen overflow-x-hidden text-white antialiased">
      {/* animated canvas background */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0" />

      {/* top thin gold line */}
      <div className="fixed left-0 right-0 top-0 h-1 z-40 bg-gradient-to-r from-transparent via-[#007BFF] to-[#D4AF37] opacity-40" />

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between backdrop-blur-md bg-black/30 border border-white/5 rounded-b-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#071026] flex items-center justify-center ring-1 ring-[#007BFF]/20 overflow-hidden">
            <img src={logo1} alt="Rabnex Logo" className="w-full h-full object-contain" />
          </div>
            <div>
              <div className="font-semibold">RABNEX</div>
              <div className="text-xs text-gray-300">Innovations</div>
            </div>
          </div>

          <nav className="hidden md:flex gap-8 items-center text-sm">
            <button onClick={() => goto("home")} className="hover:text-[#007BFF]">Home</button>
            <button onClick={() => goto("about")} className="hover:text-[#007BFF]">About</button>
            <button onClick={() => goto("services")} className="hover:text-[#007BFF]">Services</button>
            <button onClick={() => goto("projects")} className="hover:text-[#007BFF]">Projects</button>
            <button onClick={() => goto("team")} className="hover:text-[#007BFF]">Team</button>
            <button onClick={() => goto("contact")} className="hover:text-[#007BFF]">Contact</button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="mailto:rabnexx@outlook.com" className="px-3 py-1 text-sm rounded-md border border-[#1f2937] hover:bg-[#071026]">rabnexx@outlook.com</a>
            <div className="flex items-center gap-3 text-gray-300">
              <a href="https://www.linkedin.com/company/rabnexxinnovation" target="_blank" rel="noreferrer" className="hover:text-[#007BFF]"><FaLinkedin /></a>
              <a href="https://www.instagram.com/rabnexxinnovation?igsh=aHhmenQ3dmo3eDcz" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37]"><FaInstagram /></a>
              <a href="mailto:rabnexx@outlook.com" className="hover:text-[#007BFF]"><FaEnvelope /></a>
            </div>
          </div>

          <button className="md:hidden p-2" onClick={() => setOpenNav(!openNav)} aria-label="toggle navigation">
            {openNav ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* mobile nav drawer */}
        {openNav && (
          <div className="md:hidden max-w-7xl mx-auto px-6 py-4 bg-black/60 backdrop-blur-md border-t border-white/5">
            <div className="flex flex-col gap-4">
              <button onClick={() => goto("home")} className="text-left">Home</button>
              <button onClick={() => goto("about")} className="text-left">About</button>
              <button onClick={() => goto("services")} className="text-left">Services</button>
              <button onClick={() => goto("projects")} className="text-left">Projects</button>
              <button onClick={() => goto("team")} className="text-left">Team</button>
              <button onClick={() => goto("contact")} className="text-left">Contact</button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10">
        {/* HERO */}
        <section id="home" className="min-h-[80vh] flex items-center justify-center px-6 pt-28 pb-16">
          <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Building the Next Generation of <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#007BFF] to-[#D4AF37]">Smart Tech</span>
              </h1>
              <p className="mt-4 text-gray-300 max-w-lg">
                Empowering innovation through intelligent software and hardware solutions — Web, IoT, AI, Automation.
              </p>

              <div className="mt-6 flex gap-4 items-center">
                <button onClick={() => goto("projects")} className="px-6 py-3 rounded-md bg-[#007BFF] text-black font-semibold hover:scale-[1.02] transition">Explore Projects</button>
                <button onClick={() => goto("contact")} className="px-6 py-3 rounded-md bg-transparent border border-[#D4AF37] text-[#D4AF37] font-medium hover:bg-[#D4AF37]/10 transition">Contact Us</button>
              </div>

              <div className="mt-6 flex items-center gap-3 text-sm text-gray-400">
                <div className="px-3 py-1 rounded-md bg-white/5 text-[#D4AF37] font-medium">Your Vision. Our Innovation.</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9 }} className="rounded-2xl p-6 bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center">
              <motion.img
                src={logo}
                alt="Rabnex Logo"
                className="w-[320px] h-[320px] object-contain drop-shadow-lg"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              />
            </motion.div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.h2 initial={{opacity:0, y:6}} whileInView={{opacity:1, y:0}} className="text-2xl font-semibold">About RABNEX</motion.h2>
            <motion.p initial={{opacity:0}} whileInView={{opacity:1}} className="mt-4 text-gray-300 max-w-3xl">
              We build integrated software and hardware solutions for modern campuses and enterprises. From web and mobile,
              to embedded systems and AI, we deliver production-ready products that scale.
            </motion.p>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="py-16 px-6 bg-black/30 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold">Services</h2>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Web & App Development", desc: "Modern web and mobile apps." },
                { title: "IoT & Smart Hardware", desc: "Connected devices & firmware." },
                { title: "AI & Automation", desc: "Predictive models and pipelines." },
                { title: "Cloud & Embedded Systems", desc: "Scalable backend & edge compute." },
              ].map((s) => (
                <motion.div key={s.title} whileHover={{ y: -6 }} className="p-5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-xs text-gray-400">Service</div>
                  <h3 className="mt-2 font-semibold text-[#007BFF]">{s.title}</h3>
                  <p className="mt-2 text-sm text-gray-300">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold">Projects</h2>
            <p className="mt-2 text-gray-400 max-w-2xl">Selected work — each card shows a project preview and short description.</p>

            <div className="mt-6 grid md:grid-cols-3 gap-6">
              {projects.map((p) => (
                <motion.div key={p.id} variants={cardVariants} initial="hidden" whileInView="show" className="relative rounded-xl overflow-hidden border border-white/5 shadow-lg">
                  <img src={p.img} alt={p.title} className="w-full h-44 object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition flex items-end p-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#D4AF37]">{p.title}</h3>
                      <p className="text-sm text-gray-300">{p.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TEAM */}
   <section id="team" className="py-16 px-6 bg-black/20 border-t border-white/5">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-2xl font-semibold">Team</h2>
    <p className="mt-2 text-gray-400">Meet the engineers and creatives behind Rabnex.</p>

    <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
      {team.map((m) => (
        <motion.div
          key={m.name}
          whileHover={{ y: -8 }}
          className="p-6 rounded-xl bg-black/40 border border-white/5 text-center"
        >
          <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-[#007BFF]">
            <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
          </div>

          <h3 className="mt-4 font-semibold text-[#D4AF37]">{m.name}</h3>
          <p className="text-sm text-gray-300">{m.role}</p>

          {/* ✅ Show icons only if links exist */}
          {(m.linkedin || m.insta) && (
            <div className="mt-3 flex items-center justify-center gap-4 text-gray-300">
              {m.linkedin && (
                <a
                  href={m.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#007BFF]"
                >
                  <FaLinkedin />
                </a>
              )}
              {m.insta && (
                <a
                  href={m.insta}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#D4AF37]"
                >
                  <FaInstagram />
                </a>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  </div>
</section>


        {/* CONTACT */}
        <section id="contact" className="py-16 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-start">
            <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} className="p-6 rounded-xl bg-black/40 border border-white/5">
              <h2 className="text-2xl font-semibold">Contact</h2>
              <p className="mt-2 text-gray-300">Send us a message and we'll reply to your email. We typically respond within 24–48 hours.</p>

              <div className="mt-6 text-sm text-gray-300">
                <div className="flex items-center gap-3"><FaEnvelope /> <a className="hover:text-[#007BFF]" href="mailto:rabnexx@outlook.com">rabnexx@outlook.com</a></div>
                <div className="mt-3">LinkedIn: <a className="hover:text-[#007BFF]" href="https://linkedin.com/company/rabnex" target="_blank" rel="noreferrer">rabnex</a></div>
                <div className="mt-3">Instagram: <a className="hover:text-[#D4AF37]" href="https://instagram.com/rabnex" target="_blank" rel="noreferrer">rabnex</a></div>
              </div>
            </motion.div>

            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} className="p-6 rounded-xl bg-black/40 border border-white/5">
              <label className="block text-sm text-gray-300">Name</label>
              <input name="name" value={form.name} onChange={onChange} required className="mt-2 w-full p-3 rounded-md bg-transparent border border-white/10 placeholder-gray-500" />

              <label className="block text-sm text-gray-300 mt-4">Email</label>
              <input name="email" type="email" value={form.email} onChange={onChange} required className="mt-2 w-full p-3 rounded-md bg-transparent border border-white/10 placeholder-gray-500" />

              <label className="block text-sm text-gray-300 mt-4">Message</label>
              <textarea name="message" rows="5" value={form.message} onChange={onChange} required className="mt-2 w-full p-3 rounded-md bg-transparent border border-white/10 placeholder-gray-500"></textarea>

              <div className="mt-4 flex items-center gap-4">
                <button type="submit" className="px-5 py-2 rounded-md bg-[#007BFF] text-black font-semibold">Send Message</button>
                <div className="text-sm text-gray-300">{status.text}</div>
              </div>
            </motion.form>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-8 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm">© 2025 RABNEX Innovations</div>
            <div className="text-sm text-[#D4AF37] font-medium">Your Vision. Our Innovation.</div>
            <div className="flex items-center gap-4 text-gray-300">
              <a href="https://linkedin.com/company/rabnex" target="_blank" rel="noreferrer" className="hover:text-[#007BFF]"><FaLinkedin /></a>
              <a href="https://instagram.com/rabnex" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37]"><FaInstagram /></a>
              <a href="mailto:rabnexx@outlook.com" className="hover:text-[#007BFF]"><FaEnvelope /></a>
            </div>
          </div>
        </footer>
      </main>

      {/* TOAST: success */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.35 }} className="fixed right-6 bottom-6 z-50">
            <div className="px-4 py-3 bg-emerald-500 rounded-lg text-black font-semibold shadow-lg">✅ Message sent successfully!</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* small inline style */}
      <style>{`
        canvas { pointer-events: none; }
      `}</style>
    </div>
  );
}
