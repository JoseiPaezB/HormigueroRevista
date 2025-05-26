import mosquito from '../../src/assets/images/mosquito.svg';
// import ant from '../../assets/images/ant.svg';
import bee from '../../src/assets/images/bee.svg';
import fly from '../../src/assets/images/roach.svg';
import ant from '../../src/assets/images/libelula.svg';
import ant2 from '../../src/assets/uno.svg'


export  const insects = [
    {
      src: ant2,
      type: 'mosquito',
      size: 30,
      // Optional: customize further
      // speed: 2.5,
      // initialPosition: { x: 100, y: 100 }
    },
    {
      src: ant,
      type: 'fly',
      size: 25
    },
    {
      src: bee,
      type: 'bee',
      size: 35
    },
    {
      src: fly,
      type: 'fly',
      size: 28
    },
    {
      src: mosquito, // You can reuse the same SVG with different behavior
      type: 'default',
      size: 32
    }
  ];

export { mosquito, ant, bee, fly };
