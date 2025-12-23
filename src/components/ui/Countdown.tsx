'use client';

import * as React from 'react';

export default function Countdown({ endsAt }: { endsAt: number }) {
  const [left, setLeft] = React.useState(Math.max(0, endsAt - Date.now()));

  React.useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, endsAt - Date.now())), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const total = Math.floor(left / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');

  return <span className="font-mono tabular-nums">{h}:{m}:{s}</span>;
}
