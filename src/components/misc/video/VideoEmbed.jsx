import YouTube from "react-youtube";

function VideoEmbed ({link, timeStart, timeEnd}) {
    if (!link) {
        return (<></>)
    }

    let youtubeOpts = {
        playerVars: {
            autoplay: 0,
            fs: 1,
            rel: 0,
            start: timeStart,
            end: timeEnd
        }
    }

    let youtubeId;
    let instagramLink;
    if (link.includes("youtu")) {
        // "https://www.youtube.com/embed/<videoID>"
        if (link.includes("youtu.be")) {
            youtubeId = link.split("/").pop().split("?")[0];
        } else {
            youtubeId = link.split("/").pop().split("?v=").pop();
            if (youtubeId.includes("&")) {
                youtubeId = youtubeId.split("&")[0];
            }
        }
    }
    else if (link.includes("instagram")) {
        // "https://www.instagram.com/p/<videoID>/embed
        instagramLink = link + "embed";
    }
    else {
        console.log("Could not embed this link:\n" + link);
    }

    const setupYoutubePlayer = (e) => {
        e.target.mute();
    }

    const restartVideo = (e) => {
        e.target.seekTo(timeStart ?? 0);
    }

    return(
        <>
            {youtubeId &&
                <div className="callout video-callout">
                    <YouTube
                        className="video"
                        videoId={youtubeId}
                        opts={youtubeOpts}
                        onReady={setupYoutubePlayer}
                        onEnd={restartVideo}
                    />
                </div>
            }
            {instagramLink &&
                <div className="callout insta-callout">
                    <iframe
                        className="insta-video"
                        src={instagramLink}
                        frameBorder="0"
                        scrolling="no"
                        allowtransparency="true"
                        title="video"
                    ></iframe>
                </div>
            }
        </>
    );
}

export default VideoEmbed;