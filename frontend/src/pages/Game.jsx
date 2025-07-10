import { useEffect } from "react";
import { PlayerCard } from "../components";
import { Circle, LogOut, X } from "lucide-react";
import { useGame } from "../context/gameContext";
import gameApis from "../api/gameApi";
import { toast } from "react-toastify";

function Game() {
  const {
    socket,
    layout,
    setLayout,
    setStart,
    setWon,
    user,
    userTwo,
    roomCode,
    gameData,
    setGameData,
    playerTimer,
    setPlayerTimer,
    playing,
    setPlaying,
    timerRef,
    setRedirectUser,
    setDisableBtns,
    resetInfo,
  } = useGame();

  const handleClick = (id, data) => {
    if (id && !data?.isActive) {
      if (
        (gameData?.isPlaying === gameData?.playerOne?.symbol &&
          socket?.id === gameData?.playerOne?.userId) ||
        (gameData?.isPlaying === gameData?.playerTwo?.symbol &&
          socket?.id === gameData?.playerTwo?.userId)
      ) {
        clearInterval(timerRef?.current);
        setPlayerTimer(30);

        setLayout((prev) =>
          prev.map((temp) =>
            temp.id === id && temp?.isActive === false
              ? {
                  ...temp,
                  isActive: true,
                  owner: socket?.id,
                  guess:
                    gameData?.isPlaying === gameData?.playerOne?.symbol
                      ? "x"
                      : "o",
                }
              : temp
          )
        );

        setGameData((prev) => ({
          ...prev,
          isPlaying: prev.isPlaying === 0 ? 1 : 0,
        }));

        let data = {
          userId: socket?.id,
          roomCode,
          move: {
            id,
            isActive: true,
            owner: socket?.id,
            guess:
              gameData?.isPlaying === gameData?.playerOne?.symbol ? "x" : "o",
          },
          isPlaying: gameData?.isPlaying === 1 ? 0 : 1,
          updatedAt: new Date(),
        };

        if (data) {
          gameApis
            ?.patchPlayerMoves(data)
            ?.then((data) => {})
            ?.catch((err) => {
              leaveRoomFn(roomCode, socket?.id, true);
              toast.error(err?.response?.data?.message || err?.message);
              toast?.error(
                "Game ended due to an error. Redirecting to home screen..."
              );
            });
        }

        setPlaying(false);
      }
    }
  };

  const leaveRoomFn = (roomCode, id, start) => {
    let data = {
      userId: id,
      roomCode,
      start
    };

    if (data) {
      gameApis
        ?.deleteLeaveRoom(data)
        ?.then((data) => {
          if (data?.data?.success) {
            resetInfo();
          }
        })
        ?.catch((err) => {
          toast.error(err?.response?.data?.message || err?.message);
          toast?.error(
            "Game ended due to an error. Redirecting to home screen..."
          );
          resetInfo();
        });
    }
  };

  useEffect(() => {
    if (playing) {
      if (playerTimer > 0 && gameData?.playerTwo?.userId !== undefined) {
        timerRef.current = setInterval(() => {
          if (playerTimer > 0) {
            setPlayerTimer((prev) => (prev === 0 ? 0 : prev - 1));
          }
        }, 1000);
      }
    }

    return () => clearInterval(timerRef?.current);
  }, [playing, gameData?.isPlaying]);

  useEffect(() => {
    let playerTimerEnded;
    if (playerTimer === 0) {
      if (timerRef?.current) {
        clearTimeout(timerRef?.current);
      }
      let lostUserId =
        user?.id === gameData?.isPlaying ? user?.userId : userTwo?.userId;

      if (lostUserId === socket?.id) {
        let data = {
          roomCode,
          lostUserId,
        };

        if (data) {
          gameApis
            ?.deletePlayerTimeOut(data)
            ?.then((data) => {
              if (data?.data?.data?.playerLost) {
                setWon(data?.data?.data?.playerLost?.symbol === 0 ? "o" : "x");
                setRedirectUser(true);
                setStart(false);
                setDisableBtns(true);
                toast.success("Redirecting to home screen in 20 seconds...");
              }
            })
            ?.catch((err) => {
              leaveRoomFn(roomCode, socket?.id, true);
              toast.error(err?.response?.data?.message || err?.message);
              toast?.error("Game ended due to an error.");
            });
        }
      } else {
        playerTimerEnded = setTimeout(() => {
          leaveRoomFn(roomCode, socket?.id, false);
          toast?.error(
            "Game ended due to an error. Redirecting to home screen..."
          );
          resetInfo()
        }, 10 * 1000);
      }
    }

    return () => {
      clearTimeout(playerTimerEnded);
    };
  }, [playerTimer]);

  return (
    <section className="relative flex justify-center w-[90%] mx-auto flex-col items-center h-screen min-h-[600px] text-center bg-[#1e1e2f] text-white gap-5">
      <h1 className="font-gluten text-4xl sm:text-6xl pb-2 sm:pb-10">
        Tic Tac Toe
      </h1>
      <div className="grid grid-cols-3 sm:grid-cols-5 justify-items-center items-center gap-4">
        <div className=" sm:row-start-1  flex gap-2 flex-col">
          <PlayerCard
            icon={user?.symbol}
            userInfo={user?.userName ? user?.userName : "you"}
            active={user?.id === gameData?.isPlaying}
          />
          <span
            className={`font-gluten font-medium max-[300px]:text-xs text-lg ${
              user?.id === gameData?.isPlaying ? "block" : "opacity-0"
            } ${playerTimer < 10 ? "text-red-500" : "text-zinc-400"}`}
          >
            {playerTimer}
          </span>
        </div>
        <div className="col-start-3 sm:col-start-5 sm:row-start-1 flex gap-2 flex-col">
          <PlayerCard
            icon={userTwo?.symbol}
            userInfo={userTwo?.userName ? userTwo?.userName : "opponent"}
            active={userTwo?.id === gameData?.isPlaying}
          />
          <span
            className={`font-gluten font-medium max-[300px]:text-xs text-lg ${
              userTwo?.id === gameData?.isPlaying ? "block" : "opacity-0"
            } ${playerTimer < 10 ? "text-red-500" : "text-zinc-400"}`}
          >
            {playerTimer}
          </span>
        </div>

        <div className="col-span-full sm:col-span-3 sm:col-start-2">
          <div className="grid grid-cols-3 gap-2">
            {layout?.map((data, i) => (
              <button
                onClick={() => handleClick(data?.id, data)}
                key={data?.id}
                className={`size-10 min-[300px]:size-16 sm:size-20 flex justify-center items-center bg-[#2c2c3e] rounded-sm duration-200 cursor-pointer ${
                  data?.isActive ? "" : "hover:scale-[1.05]"
                }`}
              >
                {data?.isActive &&
                  (data?.guess === "o" ? (
                    <Circle className="stroke-red-600" />
                  ) : (
                    <X />
                  ))}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={() => leaveRoomFn(roomCode, socket?.id)}
        className="absolute left-0 sm:left-10 bottom-2 bg-[#4c6ef5] m-0 px-5 py-2 rounded-full text-sm font-raleway font-medium hover:bg-[#3b5bdb] flex justify-center gap-1 items-center flex-wrap"
      >
        <LogOut className="size-4" /> Leave Room
      </button>
    </section>
  );
}

export default Game;
