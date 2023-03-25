import {useLocation} from "react-router-dom";

import {Page} from "../../types/enums";

interface VisibilityProps {
  visiblePages: Page[];
  children: JSX.Element | JSX.Element[];
  elseContent?: JSX.Element;
}

const Visibility = ({visiblePages, children, elseContent}: VisibilityProps) => {
  const path = useLocation().pathname.toString().toLowerCase();

  let isVisible = false;

  for (const page of visiblePages) {
    const conditions = [
      page === "TrickList" && path === "/",
      page === "TrickDetails" && path.includes("/tricks/"),
      page === "ComboList" && path === "/combos",
      page === "PostTrick" && path === "/posttrick",
      page === "PostCombo" && path === "/postcombo",
      page === "ComboGenerator" && path === "/generator",
    ];
    if (conditions.some((e) => e === true)) {
      isVisible = true;
      break;
    }
  }

  if (!isVisible) {
    return <>{elseContent}</>;
  }
  return <>{children}</>;
};

export default Visibility;
