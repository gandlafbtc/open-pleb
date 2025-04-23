import { takerMakerData } from "../dynamic/takersMakers"

export const updateConnected = () => {
    const now = Date.now()
    takerMakerData.makers = takerMakerData.makers.filter((maker) => maker.ts < now - 15 * 1000)
    takerMakerData.takers = takerMakerData.takers.filter((maker) => maker.ts < now - 15 * 1000)
}