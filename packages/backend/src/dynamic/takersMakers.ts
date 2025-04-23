export type TakerMaker = {
    pubkey: string;
    ts: number; 
}

export const takerMakerData: {takers: TakerMaker[], makers: TakerMaker[]}  = {
  takers: [],
  makers: []
};