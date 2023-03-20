import {useEffect} from "react";

interface ScrollToTopProps {
  children: React.FC;
}

function ScrollToTop({children}: ScrollToTopProps) {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      //@ts-ignore TODO: instant not assignable
      behavior: "instant",
    });
  }, []);

  return <>{children}</>;
}

export default ScrollToTop;
