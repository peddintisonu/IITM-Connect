import React from 'react';
import ReactPlayer from 'react-player';

const VideoBackground: React.FC = () => {
  // Cast ReactPlayer to any to suppress React 19 type incompatibilities with this library
  const Player: any = ReactPlayer;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
      {/* Video Player */}
      <Player
        url="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        playing={true}
        loop={true}
        muted={true}
        width="100%"
        height="100%"
        className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover scale-150 transform filter blur-md opacity-30 player-wrapper"
        config={{
          file: {
            attributes: {
              style: { objectFit: 'cover', width: '100%', height: '100%' }
            }
          }
        }}
      />
      {/* Abstract Overlay for Visura-like feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-black/80 to-orange-900/30 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>
    </div>
  );
};

export default VideoBackground;
