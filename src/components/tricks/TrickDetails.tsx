import {useState} from "react";
import {useParams} from "react-router-dom";
import {useLiveQuery} from "dexie-react-hooks";
import {useNavigate} from "react-router-dom";
import EditButton from "../buttons/EditButton";
import DeleteButton from "../buttons/DeleteButton";
import FreqList from "../misc/FreqList";
import YouTube, {YouTubeEvent} from "react-youtube";
//import {Trans} from "@lingui/macro";
import DeleteWarning from "../pop-ups/DeleteWarning";
import {IoRocketSharp} from "react-icons/io5";

import Database from "../../services/database/mainDatabase";
import {Trick} from "../../types/trick";

interface TrickWithPrerequisites extends Trick {
  prerequisites?: Trick[];
}

const TrickDetails = () => {
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const {id} = useParams();

  // TODO: Validate ID. If it is "bad", show error
  if (!id || Number.isNaN(parseInt(id))) {
    return null;
  }

  const navigate = useNavigate();

  // TODO: What is a Live Query, and why is it suspiciously similar to a useMemo?
  const trick: TrickWithPrerequisites | undefined = useLiveQuery(async () => {
    const dbTrick = await Database.instance.tricks.getById(parseInt(id));
    if (!dbTrick) {
      return undefined;
    }
    if (!dbTrick.recommendedPrerequisiteIds) {
      return dbTrick; // We skip recommendPrereqs
    }

    const resolvedRecommendations: Trick[] = (
      await Promise.all(dbTrick.recommendedPrerequisiteIds.map((id) => Database.instance.tricks.getById(id)))
    ).filter((e: Trick | undefined) => e !== undefined) as Trick[]; // needs cast because TS assumes this might contain undefined

    const dbTrickWithPrereqs: TrickWithPrerequisites = {
      ...dbTrick,
      prerequisites: resolvedRecommendations,
    };

    return dbTrickWithPrereqs;
  }, [id]);

  if (!trick) return null;

  console.log(trick);

  const selectFreq = (e) => {
    const newFreq = Number(e.target.value);
    let modifiedTrick = Object();
    modifiedTrick.id = trick.id;
    modifiedTrick.stickFrequency = newFreq;
    Database.instance.tricks
      .putUserTrick(modifiedTrick)
      .then((res) => {
        console.log("changed stickFrequency");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  let youtubeId;
  let youtubeOpts;
  var instagramLink;
  if (trick && trick.linkToVideo) {
    if (trick.linkToVideo.includes("youtu")) {
      // "https://www.youtube.com/embed/<videoID>"
      if (trick.linkToVideo.includes("youtu.be")) {
        youtubeId = trick.linkToVideo.split("/").pop().split("?")[0];
      } else {
        youtubeId = trick.linkToVideo.split("/").pop().split("?v=").pop();
        if (youtubeId.includes("&")) {
          youtubeId = youtubeId.split("&")[0];
        }
      }
      youtubeOpts = {
        playerVars: {
          autoplay: 0,
          fs: 1,
          rel: 0,
          start: trick.videoStartTime,
          end: trick.videoEndTime,
        },
      };
    } else if (trick.linkToVideo.includes("instagram")) {
      // "https://www.instagram.com/p/<videoID>/embed
      instagramLink = trick.linkToVideo + "embed";
    } else {
      console.log("Could not embed this link:\n" + trick.linkToVideo);
    }
  }

  const setupYoutubePlayer = (e: YouTubeEvent) => {
    e.target.mute();
  };

  const restartVideo = (e: YouTubeEvent) => {
    e.target.seekTo(trick.videoStartTime ?? 0);
  };

  const editTrick = () => navigate("/posttrick", {state: {preTrick: trick}});

  const deleteTrick = () => {
    Database.instance.tricks
      .deleteUserTrickById(parseInt(id))
      .then(() => {
        console.log("trick deleted");
      })
      .catch((e) => {
        console.log(e);
      });

    navigate("/");
  };

  const toggleBoostSkill = () => {
    trick.boostSkill = !trick.boostSkill;
    Database.instance.tricks
      .putUserTrick(trick)
      .then((res) => {
        console.log("changed boost");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  function TipList(props) {
    const listItems = props.tips.map((tip) => <li key={tip}>{tip}</li>);
    return <ul className="callout">{listItems}</ul>;
  }

  return (
    <div className="trick-details">
      {trick && (
        <article>
          <div className="row align-items-center justify-content-between">
            <h2 className="col-6" align="left">
              {trick.alias || trick.technicalName}
            </h2>

            <div className="col-3" align="center">
              <EditButton call={editTrick} />
            </div>

            <div className="col-3" align="right">
              <DeleteButton setShowDeleteWarning={setShowDeleteWarning} />
            </div>
          </div>
          {trick.alias && trick.technicalName && (
            <div>
              <h3>Technical Name: </h3>
              <div className="callout">{trick.technicalName}</div>
            </div>
          )}

          {trick.startPos && trick.endPos && (
            <div>
              <div className="callout">
                from {trick.startPos} to {trick.endPos}
              </div>
            </div>
          )}

          {trick.difficultyLevel >= 0 && (
            <div>
              <h3>
                {/*<Trans id="trickDetails.level">Level</Trans>:{" "}*/}
                Level
              </h3>
              <div className="callout">{trick.difficultyLevel}</div>
            </div>
          )}

          {trick.description && (
            <div>
              <h3>Description: </h3>
              <div className="callout">{trick.description}</div>
            </div>
          )}

          {trick.tips && trick.tips.length > 0 && (
            <div>
              <h3>Tips: </h3>
              <TipList tips={trick.tips} />
            </div>
          )}

          {trick.yearEstablished && trick.establishedBy && (
            <div>
              <h3>Established by: </h3>
              <div className="callout">
                {trick.establishedBy} in {trick.yearEstablished}
              </div>
            </div>
          )}

          {youtubeId && (
            <div className="callout video-callout">
              <YouTube
                className="video"
                videoId={youtubeId}
                opts={youtubeOpts}
                onReady={setupYoutubePlayer}
                onEnd={restartVideo}
              />
            </div>
          )}
          {instagramLink && (
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
          )}

          {(trick.prerequisites ?? []).length !== 0 && (
            <div className="row">
              <h4>Recommended Prerequisites:</h4>
              {(trick.prerequisites ?? []).map((recommendedTrick) => {
                if (recommendedTrick) {
                  return (
                    <div key={recommendedTrick.id} className="trick-container col-12">
                      <button
                        className="btn trick-preview skillFreq"
                        freq={recommendedTrick.stickFrequency}
                        onClick={() => {
                          navigate(`/tricks/${recommendedTrick.id}`);
                        }}
                      >
                        {recommendedTrick.alias || recommendedTrick.technicalName}
                        {recommendedTrick.boostSkill && (
                          <>
                            <br />
                            <IoRocketSharp />
                          </>
                        )}
                      </button>
                    </div>
                  );
                }
              })}
            </div>
          )}

          <div className="row">
            <h4>Set your success frequency:</h4>
            <div onChange={selectFreq}>
              <FreqList stickable={trick} />
            </div>
          </div>

          <div className="boostSkill row justify-content-center">
            <button
              className={
                trick.boostSkill ? "col-8 col-lg-3 col-xl-2 btn btn-warning" : "col-8 col-lg-3 col-xl-2 btn btn-primary"
              }
              onClick={toggleBoostSkill}
            >
              {trick.boostSkill ? (
                "Unboost this trick"
              ) : (
                <>
                  <IoRocketSharp /> Boost this trick
                </>
              )}
            </button>
          </div>

          {showDeleteWarning && (
            <DeleteWarning
              showDeleteWarning={showDeleteWarning}
              setShowDeleteWarning={setShowDeleteWarning}
              itemName={trick.alias || trick.technicalName}
              call={deleteTrick}
            />
          )}
        </article>
      )}
    </div>
  );
};

export default TrickDetails;
