// FILE: app/src/components/drawer/DrawerTester.jsx
import React, { useState } from 'react';
import TopTierDrawer from './TopTierDrawer';

// A simple component to test drawer functionality
export default function DrawerTester() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="fixed bottom-24 right-4 z-50">
      <button
        onClick={() => {
          console.log("Test button clicked, setting drawer to:", !isOpen);
          setIsOpen(prev => !prev);
        }}
        className="bg-brandGreen-500 text-white px-4 py-2 rounded-full shadow-xl"
      >
        {isOpen ? 'Close Drawer' : 'Open Drawer'}
      </button>
      
      <TopTierDrawer 
        isOpen={isOpen} 
        onClose={() => {
          console.log("Drawer onClose callback in tester");
          setIsOpen(false);
        }} 
      />
    </div>
  );
}
