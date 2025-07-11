import { useGame } from "../context/gameContext";
import { BadgeX, Crown, LogOut, RefreshCw } from "lucide-react";

import gameApis from "../api/gameApi";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { Button } from "../components";

function GameOver() {
  const {
    socket,
    setLayout,
    start,
    setStart,
    won,
    setWon,
    user,
    setUser,
    setUserTwo,
    roomCode,
    setGameData,
    rematchData,
    setRematchData,
    timer,
    setTimer,
    setPlayerTimer,
    reset,
    setPlaying,
    disableBtns,
    setDisableBtns,
    setRedirectUser,
    resetInfo,
  } = useGame();

  const leaveRoomFn = (roomCode, id, start) => {
    let data = {
      userId: id,
      roomCode,
      start,
    };

    if (data) {
      gameApis
        ?.deleteLeaveRoom(data)
        ?.then((data) => {
          if (data?.data?.success) {
            if (start) {
              setRedirectUser(true);
              toast.success("Redirecting to home screen in 20 seconds...");
              setDisableBtns(true);
              setStart(false);
              setWon(data?.data?.playerLost?.symbol === 0 ? "o" : "x");
            } else {
              resetInfo();
            }
          }
        })
        ?.catch((err) => {
          toast.error(err?.response?.data?.message || err?.message);
          toast?.error("Redirecting to home screen...");
          resetInfo();
        });
    }
  };

  useEffect(() => {
    let timeoutFun;

    if (reset) {
      setTimer(0);
      if (timeoutFun) {
        clearTimeout(timeoutFun);
      }
    }

    if (!start && timer > 0) {
      timeoutFun = setInterval(() => {
        if (timer > 0) {
          setTimer((prev) => (prev === 0 ? 0 : prev - 1));
        }
      }, 1000);
    }

    return () => {
      if (timeoutFun) {
        clearTimeout(timeoutFun);
      }
    };
  }, [start, reset]);

  useEffect(() => {
    if (timer === 0) {
      resetInfo();
    }
  }, [timer]);

  return (
    <section className="flex justify-center w-[90%] mx-auto flex-col items-center h-screen min-h-[600px] text-center bg-[#1e1e2f] text-white gap-5">
      <div className="flex justify-center items-center rounded-lg bg-[#2c2c3e] max-[300px]:p-4 p-10">
        <div className="flex flex-col gap-2 justify-between">
          <div className="flex flex-col gap-4 justify-center items-center">
            {won !== "Draw" ? (
              won === user?.symbol ? (
                <Crown className="size-10 stroke-amber-400 sm:size-12" />
              ) : (
                <BadgeX className="size-10 stroke-red-600 sm:size-12" />
              )
            ) : (
              <Crown className="size-10 stroke-amber-400 sm:size-12" />
            )}

            <h1 className="text-center font-gluten text-2xl sm:text-3xl">
              {won !== "Draw"
                ? won === user?.symbol
                  ? "You won! 🎉"
                  : "Nice try!"
                : "It’s a tie!"}
            </h1>
          </div>
          <h3 className="text-center animate-pulse text-red-500 text-xs tracking-widest font-raleway font-bold">
            {rematchData?.receiverId === socket?.id &&
              rematchData?.receiverMessage}
          </h3>
          <div className="flex max-[400px]:justify-center justify-between items-center gap-4 flex-wrap">
            <button
              disabled={rematchData?.senderId === socket?.id || disableBtns}
              className="bg-emerald-600 disabled:bg-emerald-800 disabled:cursor-not-allowed hover:bg-emerald-700 shadow-sm transition text-white px-4 py-2 rounded-full mt-4 font-raleway text-sm flex max-[200px]:justify-center justify-between items-center gap-2 flex-wrap"
              onClick={() => {
                if (socket?.id && roomCode) {
                  let data = { roomCode, userId: socket?.id };

                  gameApis
                    ?.patchPlayAgain(data)
                    ?.then((data) => {
                      if (data?.data?.success && data?.data?.data?.roomCode) {
                        let gameData = data?.data?.data;
                        setStart(true);
                        setWon(null);
                        setRematchData({});
                        setTimer(30);
                        setPlayerTimer(30);
                        setPlaying(true);

                        if (gameData) {
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
                          } else if (
                            gameData?.playerTwo?.userId === socket?.id
                          ) {
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
                      }
                    })
                    ?.catch((err) => {
                      toast?.error(
                        err?.response?.data?.message || err?.message
                      );
                      toast?.error(
                        "Game ended due to an error. Redirecting to home screen..."
                      );
                      resetInfo();
                    });
                } else {
                  toast.error(
                    "Socket ID or Room code not found. Please try again later."
                  );
                }
              }}
            >
              <RefreshCw
                className={`size-4 ${
                  rematchData?.senderId === socket?.id
                    ? "animate-spin"
                    : "animate-none"
                }`}
              />
              {rematchData?.senderId === socket?.id
                ? rematchData?.senderMessage
                : "Restart"}
            </button>

            <button
              disabled={disableBtns}
              className="bg-rose-600 disabled:bg-rose-800 disabled:cursor-not-allowed hover:bg-rose-700 shadow-sm transition text-white px-4 py-2 rounded-full mt-4 text-sm font-raleway flex max-[200px]:justify-center justify-between items-center gap-2 flex-wrap"
              onClick={() => {
                if (roomCode && !disableBtns) {
                  leaveRoomFn(roomCode, socket?.id, false);
                }
              }}
            >
              <LogOut className="size-4" />
              Leave room {!disableBtns ? timer : ""}
            </button>
          </div>
        </div>
      </div>

      <Button
        clickHandler={() => {
          if (roomCode) {
            leaveRoomFn(roomCode, socket?.id, false);
          } else {
            resetInfo();
          }
        }}
      ></Button>
    </section>
  );
}

export default GameOver;
