import { LogOut } from "lucide-react";

function Button({clickHandler}) {
  return (
    <button onClick={clickHandler} className="absolute left-0 sm:left-10 bottom-2 bg-[#4c6ef5] m-0 px-5 py-2 rounded-full text-sm font-raleway font-medium hover:bg-[#3b5bdb] flex justify-center gap-1 items-center flex-wrap">
      <LogOut className="size-4" /> Leave Room
    </button>
  );
}

export default Button;
