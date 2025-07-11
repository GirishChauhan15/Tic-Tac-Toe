# 🎮 Real-Time Multiplayer Tic Tac Toe

A modern reimagining of a timeless game — built from scratch to support real-time, peer-vs-peer gameplay with a clean UI and a smooth multiplayer experience.

This project brings together frontend and backend technologies to create a responsive, room-based Tic Tac Toe platform where two users can play live, track each other's moves, and even request rematches — all in real time.

---

## 🌟 Key Features

- 🔗 **Room-based matchmaking**  
  Users can instantly generate a shareable link or QR code to invite a friend.

- ⚡ **Real-time gameplay**  
  Powered by Socket.IO, every move is synced live between players with minimal latency.

- ⏱️ **Timers and turn logic**  
  Each player gets a countdown for their turn, encouraging fast-paced play.

- 🔁 **Rematch & disconnect handling**  
  Handles disconnects gracefully and supports immediate rematches with preserved state.

- 📱 **Fully responsive design**  
  Built with TailwindCSS to work seamlessly across devices and screen sizes.

---

## 🧠 How It Works

- The backend uses **Express.js** and **Socket.IO** to manage connections, game rooms, and real-time updates.
- The frontend is built with **React**, leveraging context APIs to manage game state and UI interactions.
- Players can:
  - Enter a username
  - Generate or join a room
  - Receive real-time feedback on moves, wins, and disconnects
  - Share game links via text or QR code

---

## 🛠 Tech Stack

### Frontend
- React 19 + Vite
- TailwindCSS
- React Router
- React Toastify
- Socket.IO Client
- Lucide Icons
- React QR Code

### Backend
- Node.js + Express
- Socket.IO
- dotenv & cors
- shortid (room code generation)

---

## 📌 Notes

- The app supports **only two players per room**
- There is no persistent database — all sessions are managed in memory
- Built primarily as a learning + demo project around real-time concepts
- Supports full rematch cycles, and automatically detects if a user disconnects or times out

---

## 🙌 Why This Project?

This wasn’t just about building a game — it was about exploring the challenges of **real-time web experiences**.  
It required careful handling of synchronization, UI state, connection stability, and user flow — all with simplicity at the core.

---

## 🧠 Author

Made with care by [Girish Chauhan](https://github.com/GirishChauhan15)
Feel free to connect, collaborate, or suggest ideas to extend the game.
