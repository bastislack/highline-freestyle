import YouTubeEmbed from "./YouTubeEmbed";
import InstagramEmbed from "./InstagramEmbed";
import {Alert} from "react-bootstrap";

export default function VideoEmbed ({link, timeStart, timeEnd}) {
    if (!link) {
        return null;
    }

    // The "be" at the end of "youtu" is missing intentionally to account for shortened "youtu.be" links
    if (link.includes("youtu")) {
        return (<YouTubeEmbed link={link} timeStart={timeStart} timeEnd={timeEnd}/>);
    }

    if (link.includes("instagram")) {
        return (<InstagramEmbed link={link}/>);
    }

    console.warn("Could not embed this link:\n" + link);
    return(<Alert variant="warning">Could not display video :(</Alert>);
}