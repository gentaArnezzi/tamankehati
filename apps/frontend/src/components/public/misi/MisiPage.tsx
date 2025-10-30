"use client";

import { MisiHero } from "./MisiHero";
import { MisiTheoryOfChange } from "./MisiTheoryOfChange";
import { MisiCTA } from "./MisiCTA";

export function MisiPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MisiHero />
      <MisiTheoryOfChange />
      <MisiCTA />
    </div>
  );
}
