import {
  Anton,
  Bangers,
  Bebas_Neue,
  Knewave,
  League_Spartan,
  Montserrat,
  Poetsen_One,
  Poppins,
  Noto_Sans_Devanagari,
} from "next/font/google";

export const anton = Anton({ subsets: ["latin"], weight: "400" });
export const bangers = Bangers({ subsets: ["latin"], weight: "400" });
export const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400" });

export const knewave = Knewave({ subsets: ["latin"], weight: "400" });
export const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: "400",
});
export const montserrat = Montserrat({ subsets: ["latin"], weight: "400" });
export const poetsenOne = Poetsen_One({ subsets: ["latin"], weight: "400" });
export const poppins = Poppins({ subsets: ["latin"], weight: "400" });

export const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: "400", // pick weights you need
});

export const fontMap: any = {
  Anton: anton.className,
  Bangers: bangers.className,
  BebasNeue: bebasNeue.className,
  Impact: "font-impact",
  Knewave: knewave.className,
  LeagueSpartan: leagueSpartan.className,
  Montserrat: montserrat.className,
  PoetsenOne: poetsenOne.className,
  Poppins: poppins.className,
  NotoSansDevanagari: notoSansDevanagari.className,
};
