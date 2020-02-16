import React, { useState, useEffect, useRef } from 'react';
import { useUserMedia } from './hooks/useUserMedia';
import { useWindowWidth } from './hooks/useWindowWidth';
import ColorThief from 'colorthief';
import rgbToHex from './utils/rgbToHex';
import { FaCamera } from 'react-icons/fa';
import { GoLogoGithub } from 'react-icons/go';
import './App.css';

const CAPTURE_OPTIONS = {
  audio: false,
  // video: true,
  video: { facingMode: 'environment' },
};

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const imageRef = useRef();
  const mediaStream = useUserMedia(CAPTURE_OPTIONS);
  const windowWidth = useWindowWidth();
  const [imageSource, setImageSource] = useState(null);
  const [dominantColor, setDominantColor] = useState('#fafafa');
  const [colorPalette, setColorPalette] = useState([]);
  const [imageScale, setImageScale] = useState({ width: 420, height: 315 });

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
      setImageScale({ width, height });
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
          <div className="github">
            <a href="https://github.com/jonyonson/dominant-cam-color">
              <GoLogoGithub size="52" color="#fff" />
            </a>
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
              width={imageScale.width}
              height={imageScale.height}
            />
            <div className="color-palette">
              {colorPalette.map((color) => {
                const len = colorPalette.length;
                const height = imageScale.height / len + 'px';
                return (
                  <div
                    key={color}
                    className="color-swatch"
                    style={{
                      background: color,
                      height,
                    }}
                  >
                    {color}
                  </div>
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
