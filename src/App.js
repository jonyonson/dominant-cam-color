import React, { useState, useEffect, useRef } from 'react';
import { useUserMedia } from './hooks/useUserMedia';
import { useWindowDimensions } from './hooks/useWindowDimensions';
import ColorThief from 'colorthief';
import rgbToHex from './utils/rgbToHex';
import { FaCamera } from 'react-icons/fa';
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
  const [imageSource, setImageSource] = useState(null);
  const [dominantColor, setDominantColor] = useState('#fafafa');
  const [colorPalette, setColorPalette] = useState([]);
  const [imageDimensions, setImageDimensions] = useState({
    width: 640,
    height: 480,
  });
  const windowWidth = useWindowDimensions();
  // const [live, setLive] = useState(false);

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

      const canvas = document.querySelector('.photo');
      const canvasWidth = canvas.clientWidth;
      const canvasHeight = canvas.clientHeight;
      const width = canvasWidth < 640 ? canvasWidth * 0.65 : 640 * 0.65;
      const height = canvasHeight < 480 ? canvasHeight * 0.65 : 480 * 0.65;
      setImageDimensions({ width, height });
    }
  }, [imageSource, windowWidth]);

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  const handleCanPlay = () => videoRef.current.play();

  const takePhoto = () => {
    const data = canvasRef.current.toDataURL('image/jpeg');
    setImageSource(data);
  };

  return (
    <div className="app" style={{ background: [dominantColor] }}>
      <div className="photobooth">
        <div className="canvas-wrapper">
          <div className="controls">
            <FaCamera
              onClick={takePhoto}
              size="32"
              color="#fff"
              style={{ cursor: 'pointer' }}
            />
          </div>
          <canvas className="photo" ref={canvasRef} width={640} height={480} />
        </div>
        <video
          className="player"
          ref={videoRef}
          onCanPlay={handleCanPlay}
          autoPlay
        />
        {imageSource && (
          <div className="photo-results">
            <img
              src={imageSource}
              ref={imageRef}
              className="picture"
              alt=""
              width={imageDimensions.width}
              height={imageDimensions.height}
            />
            <div className="color-palette">
              {colorPalette.map((color) => {
                const len = colorPalette.length;
                const height = imageDimensions.height / len + 'px';
                return (
                  <div
                    key={color}
                    className="color-square"
                    style={{
                      background: color,
                      height,
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
