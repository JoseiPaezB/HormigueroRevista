import mosquito from '/assets/images/mosquito.svg';
import bee from '/assets/images/ojo3.png';
import fly from '/assets/images/ojo2.png';
import ant from '/assets/images/libelula.svg';
import ant2 from '/assets/uno.svg';


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
      type: 'fly2',
      size: 28
    },
    {
      src: mosquito, // You can reuse the same SVG with different behavior
      type: 'default',
      size: 32
    }
  ];

export { mosquito, ant, bee, fly };
