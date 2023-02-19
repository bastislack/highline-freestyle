import { Menu, MenuItem, MenuButton, SubMenu, MenuRadioGroup, MenuDivider, MenuHeader } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import { BsGearFill } from 'react-icons/bs';
import { useLocation } from 'react-router-dom';
import { trickSortingSchemes, comboSortingSchemes } from '../../services/sortingSchemes';
import { useLingui } from "@lingui/react"
import LanguageSelector from "../buttons/LanguageSelector"

import Database from "../../services/db";
const db = new Database();

const Settings = ({ sortOpt, setSortOpt, setShowAboutPage, setShowResetWarning }) => {

  const path = useLocation().pathname.toString().toLowerCase();

  const inTrickList = path === "/" ? true : false;
  const inComboList = path === "/combos" ? true : false;

  return (
    <Menu menuButton={<button className="btn btn-secondary btn-outline-secondary"><BsGearFill/></button>} transition>
    {(inTrickList || inComboList) &&
      <>
      <MenuHeader>Sorting</MenuHeader>
      <MenuRadioGroup value={sortOpt} onRadioChange={e => setSortOpt(e.value)}>
        {inTrickList && trickSortingSchemes.map(scheme => <MenuItem value={scheme.id} key={"scheme" + scheme.id} >{scheme.name}</MenuItem>)}
        {inComboList && comboSortingSchemes.map(scheme => <MenuItem value={scheme.id} key={"scheme" + scheme.id} >{scheme.name}</MenuItem>)}
      </MenuRadioGroup>
      <MenuDivider />
      </>
    }

      <MenuItem onClick={() => setShowResetWarning("tricks")} >Reset all tricks</MenuItem>
      <MenuItem onClick={() => setShowResetWarning("combos")} >Reset all combos</MenuItem>

      <MenuDivider />

      <MenuItem onClick={() => db.exportDatabase()} >Export Database</MenuItem>

      <MenuDivider />

      <MenuItem><LanguageSelector /></MenuItem>

      <MenuDivider />

      <MenuItem onClick={() => setShowAboutPage(true)} >About</MenuItem>
    </Menu>
  );
}

export default Settings;
