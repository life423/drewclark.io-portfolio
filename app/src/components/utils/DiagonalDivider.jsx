// import React from 'react';

// /**
//  * A diagonal divider component that creates a slanted visual break between sections
//  */
// const DiagonalDivider = ({
//   position = 'bottom',
//   color = 'bg-brandGray-800',
//   angle = 4,
//   height = 100,
//   className = '',
// }) => {
//   // Calculate skew angle based on the desired visual angle
//   const skewY = `skewY(${-angle}deg)`;

//   // Position the divider appropriately
//   const positionStyles = {
//     top: { top: 0, transform: `${skewY} translateY(-50%)` },
//     bottom: { bottom: 0, transform: `${skewY} translateY(50%)` }
//   };

//   return (
//     <div
//       className={`absolute left-0 w-full overflow-hidden z-10 ${className}`}
//       style={{ 
//         height: `${height}px`, 
//         ...positionStyles[position] 
//       }}
//     >
//       <div
//         className={`absolute inset-0 ${color}`}
//       />
//     </div>
//   );
// };

// export default DiagonalDivider;
