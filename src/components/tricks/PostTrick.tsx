import {FC, useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";

import Database from "../../services/database/mainDatabase";
import {Form, Button, InputGroup} from "react-bootstrap";
import {parseTrick, Trick} from "../../types/trick";
import {
  Position,
  StickFrequency,
  ZodPositionEnum,
  ZodPositionEnumValues,
  ZodStickFrequencyEnumValues,
} from "../../types/enums";
import usePatchState from "../hooks/usePatchState";

/**
 * This interface defines the structure of user input which is then turned into a trick
 */
interface PostTrickUserInput {
  alias: string;
  technicalName: string;
  establishedBy: string;
  yearEstablished: number;
  linkToVideo: string;
  startPositionIndex: number;
  endPositionIndex: number;
  difficultyLevel: number;
  description: string;
  tips: string;
  stickFrequencyIndex: number;
}

interface TextInputFieldProps {
  label: string;
  placeholder: string;
  setter: (val: string) => void;
  value: string;
  required?: boolean;
}

const TextInputField = (props: TextInputFieldProps) => {
  return (
    <div className="col-md-6">
      <label className="">{props.label}</label>
      <input
        className="form-control"
        type="text"
        required={props.required ?? false}
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) => props.setter(e.target.value)}
      />
    </div>
  );
};

interface DropdownSingleSelectInputProps {
  label: string;
  required?: boolean;
  setter: (index: number) => void;
  placeholderText: string;
  value: number;
  indexedValues: string[];
}

const DropdownSingleSelectInput = (props: DropdownSingleSelectInputProps) => {
  return (
    <div className="col-md-6">
      <label className="">{props.label}</label>
      <select
        className="form-control"
        required={props.required ?? false}
        value={props.value}
        placeholder={props.placeholderText}
        onChange={(e) => props.setter(Number(e.target.value))} // TODO: Check if this actually returns the Index. I highly doubt that.
      >
        {props.indexedValues.map((e, i) => (
          <option key={i} value={i}>
            {e}
          </option>
        ))}
      </select>
    </div>
  );
};

const PostTrick: FC = () => {
  const location = useLocation();
  const preTrick = location.state?.preTrick as Trick | undefined; // ??? TODO: What is Pretrick, needs a "rich" type-safe representation given all the logic tied to it below.
  const navigate = useNavigate();

  const [userInput, setUserInput] = usePatchState<PostTrickUserInput>({
    alias: "",
    technicalName: "",
    establishedBy: "",
    yearEstablished: new Date().getFullYear(),
    linkToVideo: "",
    startPositionIndex: 0,
    endPositionIndex: 0,
    difficultyLevel: 1,
    description: "",
    tips: "",
    stickFrequencyIndex: 0,
  });

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();

    // Partial allows to delete values here
    const trick = parseTrick({
      id: preId,
      alias: alias,
      technicalName,
      establishedBy,
      yearEstablished,
      linkToVideo,
      startPos,
      endPos,
      difficultyLevel,
      description,
      tips: tips,
      stickFrequency,
    });

    Database.instance.tricks.putUserTrick(trick).then(() => {
      console.log(trick);
      setTimeout(() => {
        navigate("/");
      }, 1);
    });
  };

  return (
    <div className="post">
      <h2>{preTrick ? "Update trick" : "Add a new trick"}</h2>
      <form onSubmit={handleSubmit} className="">
        <div className="row form-row">
          <TextInputField
            label="Alias:"
            placeholder="Darth Vader"
            value={userInput.alias}
            setter={(e) => setUserInput({alias: e})}
          />
          <TextInputField
            label="Technical Name:"
            required
            placeholder="Antihero to feet"
            value={userInput.technicalName}
            setter={(e) => setUserInput({technicalName: e})}
          />
          <TextInputField
            label="Established By:"
            placeholder="Ian Eisenberg"
            value={userInput.establishedBy}
            setter={(e) => setUserInput({establishedBy: e})}
          />
          <div className="col-md-6">
            <label className="">Year Established:</label>
            <input
              min={0}
              max={new Date().getFullYear() + 1}
              className="form-control"
              type="number"
              value={userInput.yearEstablished}
              placeholder={new Date().getFullYear() + ""}
              onChange={(e) => setUserInput({yearEstablished: e.target.valueAsNumber})}
            />
          </div>
          <TextInputField
            label="Link to Video:"
            placeholder="https://youtu.be/Ab2gW1rv5e8?t=91"
            value={userInput.linkToVideo}
            setter={(e) => setUserInput({linkToVideo: e})}
          />
          <DropdownSingleSelectInput
            placeholderText="TODO"
            indexedValues={[...ZodPositionEnumValues]}
            label="Start Position:"
            value={userInput.startPositionIndex}
            setter={(e) => setUserInput({startPositionIndex: e})}
          />
          <DropdownSingleSelectInput
            placeholderText="TODO"
            indexedValues={[...ZodPositionEnumValues]}
            label="End Position:"
            value={userInput.endPositionIndex}
            setter={(e) => setUserInput({endPositionIndex: e})}
          />
          <div className="col-md-6">
            <label className="">Difficulty Level:</label>
            <input
              min={0}
              max={11}
              className="form-control"
              type="number"
              required
              value={userInput.difficultyLevel}
              placeholder="8"
              onChange={(e) => {
                setUserInput({difficultyLevel: e.target.valueAsNumber});
              }}
            />
          </div>
          <div className="col-md-6">
            <label className="">Description:</label>
            <input
              className="form-control"
              type="text"
              required
              value={userInput.description}
              placeholder="From hanging do a front flip motion and land in EXPOSURE"
              onChange={(e) => setUserInput({description: e.target.value})}
            />
          </div>
          <DropdownSingleSelectInput
            placeholderText="TODO"
            indexedValues={[...ZodStickFrequencyEnumValues]}
            label="Stick Frequency:"
            value={userInput.stickFrequencyIndex}
            setter={(e) => setUserInput({stickFrequencyIndex: e})}
          />
          <div className="col-md-6">
            <label>Tips:</label>
            <textarea
              className="form-control"
              value={userInput.tips}
              placeholder={"Here is your first tip\nAnd here is your second"}
              onChange={(e) => setUserInput({tips: e.target.value})}
            />
          </div>
        </div>

        <button className="btn btn-primary">{preTrick ? "Update Trick" : "Add Trick"}</button>
      </form>
    </div>
  );
};

export default PostTrick;
