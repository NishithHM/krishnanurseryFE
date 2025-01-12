import React, { useRef, useEffect } from "react";
import ReactHlsPlayer from 'react-hls-player';

const VideoPlayer = ({ videoUrl }) => {
  

  return (
    <div>
       <ReactHlsPlayer
    src={videoUrl}
    autoPlay={false}
    controls={true}
    hlsConfig={{}}
    width="100%"
    height="auto"
  />,
    </div>
  );
};

export default VideoPlayer;
