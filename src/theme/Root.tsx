import React from 'react';
import BottomNav from '@site/src/components/BottomNav';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
