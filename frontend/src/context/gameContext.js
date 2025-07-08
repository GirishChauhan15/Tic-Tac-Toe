import { createContext, useContext } from "react";

const GameContext = createContext()

export const GameContextProvider = GameContext.Provider;

export const useGame = () => {
    return useContext(GameContext)
}