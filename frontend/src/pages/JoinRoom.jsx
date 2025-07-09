import { Gamepad2, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import gameApis from "../api/gameApi";
import { toast } from "react-toastify";
import { useGame } from "../context/gameContext";

let regex = /^[a-zA-Z0-9 _-]+$/;

function JoinRoom() {
  const { roomCode, playerName } = useParams();

  const [userName, setUserName] = useState("");
  const userNameRef = useRef(null);
  const {
    socket,
    setLayout,
    setUser,
    setUserTwo,
    setRoomCode,
    setGameData,
    setPlaying,
    setIsComplete,
    setGameStarted,
    resetInfo,
  } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    userNameRef?.current?.focus();
    setUserName("");
  }, []);

  return (
    <section className="relative flex justify-center w-full items-center flex-col h-screen min-h-[600px] text-center bg-[#1e1e2f] text-white py-10 gap-5">
      <h1 className="font-raleway text-balance sm:text-xl font-light">
        {playerName
          ? `${playerName} wants to play with you!`
          : "User wants to play with you!"}
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (socket?.id && roomCode) {
            if (userName && userName?.trim() !== "" && userName?.length >= 3) {
              let data = {
                id: socket?.id,
                userName: userName?.trim(),
                roomCode,
              };

              gameApis
                ?.patchJoinRoom(data)
                ?.then((data) => {
                  if (data?.data?.success) {
                    let gameData = data?.data?.data;

                    setIsComplete(false);
                    setGameStarted(true);
                    setRoomCode(gameData?.roomCode);
                    setPlaying(true);
                    if (gameData && gameData?.playerTwo?.userId !== undefined) {
                      setGameData(gameData);
                    }
                    if (gameData?.gameBoard) {
                      setLayout(gameData?.gameBoard);
                    }
                    if (
                      gameData?.playerOne?.userId &&
                      gameData?.playerTwo?.userId
                    ) {
                      if (gameData?.playerOne?.userId === socket?.id) {
                        setUser({
                          userId: gameData?.playerOne?.userId,
                          symbol: "x",
                          id: 0,
                          userName: gameData?.playerOne?.userName,
                        });
                        setUserTwo({
                          userId: gameData?.playerTwo?.userId,
                          symbol: "o",
                          id: 1,
                          userName: gameData?.playerTwo?.userName,
                        });
                      } else if (gameData?.playerTwo?.userId === socket?.id) {
                        setUser({
                          userId: gameData?.playerTwo?.userId,
                          symbol: "o",
                          id: 1,
                          userName: gameData?.playerTwo?.userName,
                        });
                        setUserTwo({
                          userId: gameData?.playerOne?.userId,
                          symbol: "x",
                          id: 0,
                          userName: gameData?.playerOne?.userName,
                        });
                      }
                    }

                    navigate("/");
                  }
                })
                ?.catch((err) => {
                  toast?.error(err?.response?.data?.message || err?.message);
                  toast?.error(
                    "Redirecting to home screen..."
                  );
                  resetInfo();
                });
            } else {
              toast.error("Username is required.");
            }
          } else {
            toast.error(
              "Socket ID or Room code not found. Please try again later."
            );
          }
        }}
        className="flex flex-col justify-center items-center gap-6"
      >
        <div className="w-full flex flex-col gap-2 text-left">
          <label
            htmlFor="userName"
            className="text-sm font-medium text-white/80 tracking-wide font-raleway"
          >
            Room code :
          </label>
          <input
            id="code"
            placeholder="Room code"
            readOnly
            value={roomCode}
            type="text"
            className="bg-[#343453] text-white text-sm px-5 py-2.5 rounded-full focus:outline-none focus:ring-2 transition-all duration-200 ring-emerald-500"
          />
        </div>

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

        <button className="bg-[#4c6ef5] m-0 px-5 py-2 rounded-full text-sm font-raleway font-medium hover:bg-[#3b5bdb] flex justify-center gap-1 items-center flex-wrap">
          <Gamepad2 className="size-4" /> Play
        </button>
      </form>

      <Link
        to={"/"}
        onClick={() => {
          resetInfo();
        }}
        className="absolute left-0 sm:left-10 bottom-2 bg-[#4c6ef5] m-0 px-5 py-2 rounded-full text-sm font-raleway font-medium hover:bg-[#3b5bdb] flex justify-center gap-1 items-center flex-wrap"
      >
        <LogOut className="size-4" /> Leave Room
      </Link>
    </section>
  );
}

export default JoinRoom;
