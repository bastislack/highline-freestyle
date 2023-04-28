import {IoRocketSharp} from "react-icons/io5";

const ClickableSkillItem = ({name, stickFreq, isBoosted, onClick, compact=false}) => {
  function adjustedClassName() {
    let base = "btn skillFreq w-100 h-100 m-1 border border-1 mx-auto text-wra text-wrap text-break ";
    return `${base} ${compact ? "mx-1 my-0" : "m-1"}`;
  }

  return (
    <button
      className={adjustedClassName()}
      freq={stickFreq}
      onClick={onClick}
    >
      {name}
      {isBoosted && (
        <>
          <br/>
          <IoRocketSharp />
        </>)}
    </button>
  );
};

export default ClickableSkillItem;