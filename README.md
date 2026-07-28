# 🏀 Basketbola Arcade

A fast-paced, modern 2D basketball arcade game built for the web using HTML5 Canvas, Vanilla CSS, and JavaScript.

![Basketbola Banner](https://img.shields.io/badge/Game-Basketball%20Arcade-orange?style=for-the-badge&logo=basketball)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

---

## 🌟 Features

- **2-Pointer & 3-Pointer Shooting Spots**: Toggle between mid-range (+2 PTS) and long-range 3-point line (+3 PTS).
- **Hold-to-Charge Shooting Mechanics**: Press and hold `Spacebar` or `Enter` to charge launch power, then release to shoot.
- **Adjustable Trajectory Arc**: Fine-tune shot angle with `Up` and `Down` arrow keys.
- **Physics Engine & Collisions**: Sub-step physics simulating gravity, backboard bounces, rim collisions, and net swish deformation.
- **Scoreboard & Streak Tracking**: Tracks total score, shot accuracy percentage, streak multipliers (with flame visual effects), and persists high scores in `localStorage`.
- **Web Audio API Sound Synth**: Pure JavaScript sound synthesis for bounce, rim clang, net swish, and crowd cheer effects.
- **Responsive & Touch Friendly**: Plays seamlessly on desktop keyboards and mobile touchscreen displays.

---

## 🕹️ Controls

| Action | Keyboard | Touch / On-Screen |
| :--- | :--- | :--- |
| **Shoot Ball** | **`Spacebar`** or **`Enter`** (Hold & Release) | **`Hold to Shoot`** Button |
| **Switch Spot** | **`1`**, **`2`**, **`←`**, or **`→`** | **`Switch to 2PT / 3PT`** Button |
| **Adjust Angle** | **`↑`** / **`↓`** Arrows | **`Angle +`** / **`Angle -`** Buttons |
| **Reset Ball** | **`R`** | Automatic reset on shot completion |

---

## 🚀 Quick Start

No build tools or installation required! Simply clone and open `index.html` in any web browser.

```bash
# Clone the repository
git clone https://github.com/<your-username>/basketbola.git

# Navigate into directory
cd basketbola

# Open index.html in browser or serve locally
python3 -m http.server 8080
```

Open `http://localhost:8080` in your web browser.

---

## 🎨 Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5 Canvas 2D Context, CSS3 (Glassmorphism, Flexbox/Grid, Animations).
- **Audio**: Web Audio API (Synthesized Oscillators & Noise Buffers).
- **Storage**: Browser `localStorage` for High Score tracking.

---

## 📄 License

MIT License &copy; 2026
