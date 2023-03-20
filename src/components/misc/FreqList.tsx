import {stickFrequencies} from "../../services/enums";

interface FreqListProps {
  stickable: any;
}

const FreqList = ({stickable}: FreqListProps) => {
  return (
    <>
      {stickFrequencies.map((item, i) => {
        return (
          //@ts-ignore
          <label className="skillFreq" freq={i} key={i}>
            {" "}
            {/** TODO: What is freq? label does not have a 'freq' property. */}
            <input
              type="radio"
              value={i}
              name="stickFrequency"
              checked={stickable.stickFrequency === i}
              readOnly={true}
            />{" "}
            {item}
          </label>
        );
      })}
    </>
  );
};

export default FreqList;
