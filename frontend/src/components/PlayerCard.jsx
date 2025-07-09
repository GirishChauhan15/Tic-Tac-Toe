import { Circle, X } from "lucide-react";

function PlayerCard({ icon, userInfo, active }) {
  return (
    <div
      className={`flex flex-col p-2 max-[300px]:w-14 max-[300px]:h-20 w-24 h-32 justify-center items-center rounded-lg gap-2  ${
        active ? "bg-[#5d5d9c]" : "bg-[#3f3f67]"
      }`}
    >
      <div className="bg-[#1e1e2f] max-[300px]:p-2 p-6 rounded-sm">
        {String(icon)?.toLowerCase() === "x" ? (
          <div className="max-[300px]:size-6 size-8">
            <X className="size-full" />
          </div>
        ) : (
          <div className="max-[300px]:size-6 size-8">
            <Circle className="size-full stroke-red-600" />
          </div>
        )}
      </div>
      <h2 className="max-[300px]:text-[0.60rem] text-sm font-gluten font-light">{`${
        String(userInfo)[0]?.toUpperCase() + String(userInfo)?.slice(1, 7)
      }${String(userInfo)?.length > 6 ? "..." : ""}`}</h2>
    </div>
  );
}

export default PlayerCard;
