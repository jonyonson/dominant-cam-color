import React, { useState, useEffect, useRef } from 'react';
import { useUserMedia } from './hooks/useUserMedia';
import './App.css';
import ColorThief from 'colorthief';

const CAPTURE_OPTIONS = {
  audio: false,
  video: true,
  // video: { facingMode: "environment" },
};

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const imageRef = useRef();
  const mediaStream = useUserMedia(CAPTURE_OPTIONS);
  // const [height, setHeight] = useState();
  // const [width, setwidth] = useState();
  const [imageSrc, setImageSrc] = useState(null);
  const [dominantColor, setDominantColor] = useState('#FFFFFF');
  const [colorPalette, setColorPalette] = useState([]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    console.log('runnin');

    const intervalId = setInterval(() => {
      ctx.drawImage(videoRef.current, 0, 0);
    }, 16);

    return () => clearInterval(intervalId);
  });

  const rgbToHex = (rgb) => {
    const [r, g, b] = rgb;
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  useEffect(() => {
    console.log(imageSrc);
    if (imageSrc) {
      // ColorThief.getColor(imageSrc)
      //   .then((color) => console.log(color))
      //   .catch((err) => console.log(err));
      const colorThief = new ColorThief();

      const color = colorThief.getColor(imageRef.current);
      const palette = colorThief.getPalette(imageRef.current);
      console.log(rgbToHex(color));
      console.log(palette);

      setDominantColor(rgbToHex(color));
      setColorPalette(palette.map((x) => rgbToHex(x)));

      // .then((color) => console.log(color))
      // .catch((err) => console.log(err));

      // const img = new Image(640, 480);
      // img.src = imageSrc;
      // img.addEventListener('load', function() {
      //   colorThief.getColor(img);
      //   console.log(colorThief.getColor());
      // });

      // colorThief
      //   .getColorFromUrl(imageSrc)
      //   .then((color) => console.log(color))
      //   .catch((err) => console.log(err));

      // console.log(img);
    }
  }, [imageSrc]);

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
    console.log(videoRef.current);
    console.log(videoRef.current.height);
  }

  function handleCanPlay() {
    videoRef.current.play();
  }

  // fuction paintToCanvas() {
  //   setWidth(videoRef)
  // }

  const takePhoto = () => {
    const data = canvasRef.current.toDataURL('image/jpeg');
    // console.log(data);
    setImageSrc(data);
  };

  return (
    <div className="app" style={{ background: [dominantColor] }}>
      <div className="photobooth">
        <div className="controls">
          <button onClick={takePhoto}>Take Photo</button>
        </div>

        <canvas
          className="photo"
          ref={canvasRef}
          width={640}
          height={480}
        ></canvas>
        <video
          className="player"
          ref={videoRef}
          onCanPlay={handleCanPlay}
          autoPlay
        ></video>
        <div className="strip"></div>
        {imageSrc && (
          <img
            src={imageSrc}
            ref={imageRef}
            className="picture"
            alt=""
            height={240}
            width={320}
          />
        )}
        <div className="color-palette">
          {colorPalette.map((color) => (
            <div
              key={color}
              className="color-square"
              style={{ background: color }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
