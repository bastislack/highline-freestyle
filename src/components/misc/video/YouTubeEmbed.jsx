import YouTube from "react-youtube";
import {Ratio} from "react-bootstrap";

const YouTubeEmbed = ({link, timeStart, timeEnd}) => {
  let youtubeOpts = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 0,
      fs: 1,
      rel: 0,
      start: timeStart,
      end: timeEnd
    }
  };

  // "https://www.youtube.com/embed/<videoID>"
  let youtubeId;
  if (link.includes("youtu.be")) {
    youtubeId = link.split("/").pop().split("?")[0];
  } else {
    youtubeId = link.split("/").pop().split("?v=").pop();
    if (youtubeId.includes("&")) {
      youtubeId = youtubeId.split("&")[0];
    }
  }

  const setupYoutubePlayer = (e) => {
    e.target.mute();
  }

  const restartVideo = (e) => {
    e.target.seekTo(timeStart ?? 0);
  }

  return (
    <Ratio aspectRatio="16x9">
      <YouTube
        videoId={youtubeId}
        opts={youtubeOpts}
        onReady={setupYoutubePlayer}
        onEnd={restartVideo}
      />
    </Ratio>
  );
}

export default YouTubeEmbed;