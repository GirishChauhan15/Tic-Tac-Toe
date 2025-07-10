import { useEffect, useRef, useState } from "react";
import { GameContextProvider } from "./context/gameContext";
import { Outlet } from "react-router-dom";
import { io } from "socket.io-client";
import { Loader2Icon } from "lucide-react";
import { toast } from "react-toastify";

let socket;

function Layout() {
  const [layout, setLayout] = useState([]);
  const [start, setStart] = useState(true);
  const [won, setWon] = useState(null);
  const [user, setUser] = useState({});
  const [userTwo, setUserTwo] = useState({});
  const [roomCode, setRoomCode] = useState("");
  const [gameData, setGameData] = useState({});
  const [rematchData, setRematchData] = useState({});
  let [timer, setTimer] = useState(30);
  let [playerTimer, setPlayerTimer] = useState(30);
  let [reset, setReset] = useState(false);
  let [playing, setPlaying] = useState(false);
  let timerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [popup, setPopup] = useState(false);

  const [redirectUser, setRedirectUser] = useState(false);
  const [disableBtns, setDisableBtns] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(import.meta.env.VITE_BACKEND_URL);

      if (!socket?.connected) {
        socket.connect();
      }
    }

    let finishLoading = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => {
      clearInterval(finishLoading);
    };
  }, []);

  useEffect(() => {
    socket.on("play again", (data) => {
      setRematchData({});
    });

    socket.on("new game", (data) => {
      setStart(true);
      setWon(null);
      setRematchData({});
      setTimer(30);
      setPlayerTimer(30);
      setPlaying(true);

      if (data) {
        setGameData(data);
      }
      if (data?.gameBoard) {
        setLayout(data?.gameBoard);
      }
      if (data?.playerOne?.userId && data?.playerTwo?.userId) {
        if (data?.playerOne?.userId === socket?.id) {
          setUser({ userId: data?.playerOne?.userId, symbol: "x", id: 0, userName: data?.playerOne?.userName });
          setUserTwo({ userId: data?.playerTwo?.userId, symbol: "o", id: 1, userName: data?.playerTwo?.userName });
        } else if (data?.playerTwo?.userId === socket?.id) {
          setUser({ userId: data?.playerTwo?.userId, symbol: "o", id: 1, userName: data?.playerTwo?.userName });
          setUserTwo({ userId: data?.playerOne?.userId, symbol: "x", id: 0, userName: data?.playerOne?.userName });
        }
      }
    });

    socket.on("waiting to play", (data) => {
      if (data) {
        setRematchData(data);
      }
    });

    socket.on("in room", (data) => {
      setIsComplete(false);
      setGameStarted(true);
      setRoomCode(data?.roomCode);
      setPlaying(true);
      if (data && data?.playerTwo?.userId !== undefined) {
        setGameData(data);
      }
      if (data?.gameBoard) {
        setLayout(data?.gameBoard);
      }
      if (data?.playerOne?.userId && data?.playerTwo?.userId) {
       if (data?.playerOne?.userId === socket?.id) {
          setUser({ userId: data?.playerOne?.userId, symbol: "x", id: 0, userName: data?.playerOne?.userName });
          setUserTwo({ userId: data?.playerTwo?.userId, symbol: "o", id: 1, userName: data?.playerTwo?.userName });
        } else if (data?.playerTwo?.userId === socket?.id) {
          setUser({ userId: data?.playerTwo?.userId, symbol: "o", id: 1, userName: data?.playerTwo?.userName });
          setUserTwo({ userId: data?.playerOne?.userId, symbol: "x", id: 0, userName: data?.playerOne?.userName });
        }
      }
    });

    socket.on(`moves`, ({ move, isPlaying, updatedAt, won }) => {
      setPlayerTimer(30);
      setPlaying(true);
      setGameData((prev) => ({ ...prev, isPlaying, updatedAt }));
      setLayout((prev) =>
        prev.map((temp) =>
          temp.id === move?.id && temp?.isActive === false ? move : temp
        )
      );
      if (won) {
        setWon(won);
        setStart(false);
      }
    });

    socket.on("opponentLeft", (data) => {
      if (data) {
        if (data?.start === true) {
          setRoomCode(null);
          setRedirectUser(true);
          toast.success("Opponent left the game. You win!");
          toast.success("Redirecting to home screen in 20 seconds...");
          setDisableBtns(true);
          setStart(false);
          setWon(data?.symbol === 0 ? "x" : "o");
        } else {
          toast.success("Opponent left the game.");
          setDisableBtns(true);
        }
      }
    });

    socket.on("game timeout", (data) => {
      if (data) {
        setRoomCode(null);
        setRedirectUser(true);
        setStart(false);
        setDisableBtns(true);
        setWon(data?.symbol === 0 ? "x" : "o");
        toast.success("Opponent ran out of time. Victory is yours!");
        toast.success("Redirecting to home screen in 20 seconds...");
      }
    });

    return () => {
      socket?.off("play again");
      socket?.off("new game");
      socket?.off("waiting to play");
      socket?.off("in room");
      socket?.off("moves");
      socket?.off("opponentLeft");
      socket?.off("game timeout");
    };
  }, []);

  function resetInfo() {
    setDisableBtns(false);
    setPopup(false);
    setStart(true);
    setGameStarted(false);
    setIsComplete(false);
    setRedirectUser(false);

    setWon(null);
    setRematchData({});
    setLayout((prev) =>
      prev?.map((temp) => ({
        ...temp,
        isActive: false,
        guess: null,
        owner: null,
      }))
    );
    setGameData({});
    setUser({});
    setUserTwo({});
    setTimer(30);
    setReset(false);
    setPlayerTimer(30);
    setRoomCode(null);
  }

  useEffect(() => {
    let timeOutData = null;
    if (redirectUser) {
      timeOutData = setTimeout(() => {
        resetInfo();
      }, 20 * 1000);
    }
    return () => {
      clearTimeout(timeOutData);
    };
  }, [redirectUser]);

  return (
    <GameContextProvider
      value={{
        socket,
        layout,
        setLayout,
        start,
        setStart,
        won,
        setWon,
        user,
        setUser,
        userTwo,
        setUserTwo,
        roomCode,
        setRoomCode,
        gameData,
        setGameData,
        rematchData,
        setRematchData,
        timer,
        setTimer,
        playerTimer,
        setPlayerTimer,
        reset,
        setReset,
        playing,
        setPlaying,
        isComplete,
        setIsComplete,
        gameStarted,
        setGameStarted,
        timerRef,
        popup,
        setPopup,
        disableBtns,
        setDisableBtns,
        redirectUser,
        setRedirectUser,
        resetInfo,
      }}
    >
      {loading ? (
        <section className="flex justify-center w-full items-center flex-col h-screen min-h-[600px] text-center bg-[#1e1e2f] py-10">
          <Loader2Icon className="animate-spin size-10 sm:size-14 stroke-[#4c6ef5]" />
        </section>
      ) : (
        <Outlet />
      )}
    </GameContextProvider>
  );
}

export default Layout;
