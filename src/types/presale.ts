// src/types/presale.ts
export interface PresaleStage {
  id: string;
  name: string;
  soldUSD?: number;
  hardCapUSD?: number;
  bonusPercent?: number;
  endsAtIso?: string;
  slotsLeft?: number;
  price: number; // Add this line
}