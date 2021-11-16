import { useLocation } from 'react-router-dom';
import { pages } from '../../services/enums';

const Visibility = ({ visiblePages, children, elseContent }) => {

  const path = useLocation().pathname.toString().toLowerCase();

  let isVisible = false;

  visiblePages.map(page => {
    if ((page === pages.TRICKLIST && path === "/") || (page === pages.TRICKDETAILS && path.includes("/tricks/")) || (page === pages.COMBOLIST && path === "/combos") || (page === pages.COMBODETAILS && path.includes("/combos/")) || (page === pages.POSTTRICK && path === "/posttrick") || (page === pages.POSTCOMBO && path === "/postcombo") || (page === pages.GENERATOR && path === "/generator")) {
      isVisible = true;
    }
  });

  if (isVisible === true) {
    return (
      <>
        {children}
      </>
    );
  } else if (elseContent !== null) {
    return (
      <>
        {elseContent}
      </>
    );
  }

  return (null);
};

export default Visibility;
