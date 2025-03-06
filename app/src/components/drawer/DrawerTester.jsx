import React from 'react'
import useNavigationState from '../../hooks/useNavigationState'

export default function DrawerTester() {
  const { drawerOpen, toggleDrawer } = useNavigationState()

  return (
    <div className="fixed bottom-4 left-4 z-[100]">
      <button 
        onClick={toggleDrawer}
        className="bg-brandGreen-500 hover:bg-brandGreen-600 text-white font-bold py-2 px-4 rounded"
      >
        {drawerOpen ? 'Close Drawer' : 'Open Drawer'}
      </button>
      <div className="mt-2 text-xs text-white bg-black/50 p-1 rounded">
        Drawer is: {drawerOpen ? 'OPEN' : 'CLOSED'}
      </div>
    </div>
  )
}
