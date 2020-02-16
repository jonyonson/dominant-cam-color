import React, { useState, useEffect, useRef } from 'react';
import { useUserMedia } from './hooks/useUserMedia';
import ColorThief from 'colorthief';
import rgbToHex from './utils/rgbToHex';
import './App.css';

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
  const [imageSource, setimageSource] = useState(null);
  const [dominantColor, setDominantColor] = useState('#FFFFFF');
  const [colorPalette, setColorPalette] = useState([]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');

    const intervalId = setInterval(() => {
      ctx.drawImage(videoRef.current, 0, 0);
    }, 16);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (imageSource) {
      const colorThief = new ColorThief();

      const color = colorThief.getColor(imageRef.current);
      const palette = colorThief.getPalette(imageRef.current);

      setDominantColor(rgbToHex(color));
      setColorPalette(palette.map((x) => rgbToHex(x)));
    }
  }, [imageSource]);

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
    // console.log(videoRef.current);
    // console.log(videoRef.current.height);
  }

  function handleCanPlay() {
    videoRef.current.play();
  }

  const takePhoto = () => {
    const data = canvasRef.current.toDataURL('image/jpeg');
    setimageSource(data);
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
        {imageSource && (
          <img
            src={imageSource}
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
