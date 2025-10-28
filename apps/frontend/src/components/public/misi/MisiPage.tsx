'use client';

import { MisiHero } from './MisiHero';
import { MisiTheoryOfChange } from './MisiTheoryOfChange';
import { MisiTechnology } from './MisiTechnology';
import { MisiTeam } from './MisiTeam';
import { MisiTimeline } from './MisiTimeline';
import { MisiCTA } from './MisiCTA';

export function MisiPage() {
  return (
    <div className="min-h-screen bg-white">
      <MisiHero />
      <MisiTheoryOfChange />
      <MisiTechnology />
      <MisiTeam />
      <MisiTimeline />
      <MisiCTA />
    </div>
  );
}
