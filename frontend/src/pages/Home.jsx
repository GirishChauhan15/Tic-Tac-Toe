import { useEffect, useRef, useState } from "react";
import { Circle, SquarePen, Users, X } from "lucide-react";
import gameApis from "../api/gameApi";
import { useGame } from "../context/gameContext";
import { CreatedRoom, Game, GameOver } from "./index";
import { toast } from "react-toastify";

let regex = /^[a-zA-Z0-9 _-]+$/;

function Home() {
  const [userName, setUserName] = useState("");
  const {
    socket,
    setRoomCode,
    roomCode,
    isComplete,
    setIsComplete,
    gameStarted,
    won,
    start,
    popup,
    setPopup,
    resetInfo
  } = useGame();
  const userNameRef = useRef(null);

  useEffect(() => {
    if (popup) {
      userNameRef?.current?.focus();
      setUserName("");
    }
  }, [popup]);

  return (
    <section className="relative flex justify-center items-center flex-col h-screen min-h-[600px] text-center bg-[#1e1e2f] text-white pt-5 pb-[5rem]">
      {won && !start ? (
        <GameOver />
      ) : gameStarted ? (
        <Game />
      ) : isComplete ? (
        <CreatedRoom
          generatedLink={`${
            import.meta.env.VITE_JOIN_ROOM_URL
          }/joinRoom/${userName?.trim()}/${roomCode}`}
        />
      ) : !popup ? (
        <div className="flex flex-col gap-2 sm:gap-4">
          <h1 className="font-gluten text-4xl sm:text-6xl">Tic Tac Toe</h1>
          <p className="tracking-widest text-xs sm:text-lg text-white/80 font-raleway font-extralight">
            Clean. Simple. Competitive. A modern take on a timeless game.
          </p>

          <div className="flex flex-wrap gap-2 sm:gap-8 justify-center items-center my-3">
            <button
              onClick={() => {
                setPopup(true);
              }}
              className="bg-[#4c6ef5] m-0 px-5 py-3 rounded-full text-sm font-raleway font-medium hover:bg-[#3b5bdb] flex justify-center gap-1 items-start flex-wrap"
            >
              <Users className="size-4" />
              Play with a friend
            </button>
          </div>

          {/* <div className="flex justify-center items-center pb-5">
            <div className="grid grid-cols-3 gap-2">
              {[1, 0, 1, 1, 0, 0, 0, 1, 1]?.map((data, i) => (
                <div
                  key={i}
                  className="bg-[#2c2c3e] rounded-sm hover:scale-[1.05] duration-200 cursor-pointer size-14 sm:size-20 flex justify-center items-center"
                >
                  {data === 0 ? <Circle className="stroke-red-600" /> : <X />}
                </div>
              ))}
            </div>
          </div> */}
        </div>
      ) : (
        <div className="absolute left-0 top-0 bg-[#1e1e2f] w-full h-full flex justify-center items-center gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (socket?.id) {
                if (
                  userName &&
                  userName?.trim() !== "" &&
                  userName?.length >= 3
                ) {
                  let data = { id: socket?.id, userName: userName?.trim() };
                  if (roomCode) {
                    data = { ...data, room: roomCode };
                  }
                  gameApis
                    ?.postCreateRoom(data)
                    ?.then((data) => {
                      if (data?.data?.success) {
                        setRoomCode(data?.data?.data?.roomCode);
                        setIsComplete(true);
                      }
                    })
                    ?.catch((err) => {
                      toast.error(err?.response?.data?.message || err?.message);
                      toast?.error(
                        "Redirecting to home screen..."
                      );
                      resetInfo();
                    });
                } else {
                  toast.error("Username is required.");
                }
              } else {
                toast.error("Socket ID not found. Please try again later.");
              }
            }}
            className="relative flex flex-col justify-center items-center gap-6 w-full max-w-sm mx-auto p-6 rounded-xl bg-[#3f3f67] shadow-lg"
          >
            <button
              type="button"
              onClick={() => {
                setPopup(false);
              }}
              className="absolute right-2 top-2 "
            >
              <X className="hover:stroke-[#4c6ef5] duration-300" />
            </button>

            <h1 className="text-3xl font-raleway font-bold">User Info</h1>
            <div className="w-full flex flex-col gap-2 text-left">
              <label
                htmlFor="userName"
                className="text-sm font-medium text-white/80 tracking-wide font-raleway"
              >
                Enter your name :
              </label>
              <input
                ref={userNameRef}
                id="userName"
                placeholder="Your Name"
                type="text"
                value={userName}
                onChange={(e) => {
                  if (regex?.test(e?.target?.value || " ")) {
                    setUserName(String(e?.target?.value));
                  }
                }}
                required
                minLength={3}
                maxLength={20}
                className={`bg-[#343453] text-white text-sm px-5 py-2.5 rounded-full placeholder:text-white/50 placeholder:font-raleway focus:outline-none focus:ring-2 ${
                  userName?.trim() === "" || userName?.length < 3
                    ? "focus:ring-red-500"
                    : "focus:ring-emerald-500"
                } transition-all duration-200`}
              />
            </div>

            <button
              type="submit"
              className="bg-[#4c6ef5] px-6 py-2.5 rounded-full text-sm font-raleway font-medium text-white hover:bg-[#3b5bdb] transition-all duration-200 flex justify-center gap-1 items-center flex-wrap"
            >
              <SquarePen className="size-4" /> Create New Room
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

export default Home;
