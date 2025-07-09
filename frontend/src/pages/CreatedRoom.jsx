import { Files, LogOut } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import gameApis from "../api/gameApi";
import { useGame } from "../context/gameContext";

function CreatedRoom({ generatedLink }) {
  const { socket, roomCode, resetInfo } = useGame();

  const leaveRoomFn = (roomCode, userId) => {
    let data = {
      userId,
      roomCode,
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
          toast?.error(err?.response?.data?.message || err?.message);
          toast?.error("Redirecting to home screen...");
          resetInfo();
        });
    }
  };

  return (
    <section className="relative flex justify-center w-full items-center flex-col h-screen min-h-[600px] text-center bg-[#1e1e2f] text-white py-10 gap-5">
      <h1 className="font-raleway text-balance sm:text-xl font-light">
        Share this link with a friend
      </h1>

      <button
        onClick={() => {
          if (generatedLink) {
            navigator?.clipboard?.writeText(generatedLink);
            toast.success("Link copied to clipboard!");
          } else {
            toast.error("Failed to copy the link.");
          }
        }}
        className="bg-[#4c6ef5] cursor-pointer duration-300 hover:bg-[#4c54f5] rounded-sm px-4 py-2 flex gap-2 flex-wrap justify-center items-center relative group"
      >
        <p className="font-raleway text-xs sm:text-sm">{generatedLink}</p>{" "}
        <Files className="size-3 sm:size-4 group-hover:scale-[1.05]" />
        <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-600 text-white text-xs rounded py-2 px-5 z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          Click to copy
        </div>
      </button>

      <div className="w-36 sm:w-52 pt-2">
        <QRCode
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={generatedLink}
          fgColor="#c4c4c4"
          bgColor="#1e1e2f"
        />
      </div>

      <button
        onClick={() => {
          leaveRoomFn(roomCode, socket?.id);
        }}
        className="absolute left-0 sm:left-10 bottom-2 bg-[#4c6ef5] m-0 px-5 py-2 rounded-full text-sm font-raleway font-medium hover:bg-[#3b5bdb] flex justify-center gap-1 items-center flex-wrap"
      >
        <LogOut className="size-4" /> Leave Room
      </button>
    </section>
  );
}

export default CreatedRoom;
