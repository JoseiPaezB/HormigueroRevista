// // eyes.js - Configuration file for eye sprites

// export const eyes = [
//   {
//     src: '/assets/images/ojos.svg#ojo1_1',
//     type: 'eye1',
//     size: 30,
//     isSprite: true
//   },
//   {
//     src: '/assets/images/ojos.svg#ojo2_1',
//     type: 'eye2',
//     size: 28,
//     isSprite: true
//   },
//   {
//     src: '/assets/images/ojos.svg#ojo3_1',
//     type: 'eye3',
//     size: 32,
//     isSprite: true
//   }
// ];

// // Alternative: Generate all eyes programmatically if you have many
// export const generateEyes = (count = 3) => {
//   return Array.from({ length: count }, (_, i) => ({
//     src: `/assets/images/ojos.svg#ojo${i + 1}_1`,
//     type: `eye${i + 1}`,
//     size: 30,
//     isSprite: true
//   }));
// };

// // If you want to mix with your existing insects
// export const allEyes = [
//   {
//     src: '/assets/images/ojos.svg#ojo1_1',
//     type: 'mosquito', // Keep same type for compatibility
//     size: 30,
//     isSprite: true
//   },
//   {
//     src: '/assets/images/ojos.svg#ojo2_1',
//     type: 'fly',
//     size: 28,
//     isSprite: true
//   },
//   {
//     src: '/assets/images/ojos.svg#ojo3_1',
//     type: 'bee',
//     size: 32,
//     isSprite: true
//   }
// ];

// export default eyes;