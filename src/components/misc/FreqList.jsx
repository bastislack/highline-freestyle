import {stickFrequencies} from "../../services/enums";

const FreqList = ({stickable}) => {
  return (
    <>
      {stickFrequencies.map((item, i) => {
        return (
          <label className="skillFreq" freq={i} key={i}>
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
