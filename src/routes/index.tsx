import {ReactElement} from "react";
import {useOutletContext} from "react-router-dom";
import TrickList from "../components/tricks/TrickList";
import {RootContextData} from "./root";

export function Index(): ReactElement {
  const rootContextData = useOutletContext<RootContextData>();
  return <TrickList rootContext={rootContextData} />;
}
