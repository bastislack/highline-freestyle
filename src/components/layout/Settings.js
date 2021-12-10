import { Menu, MenuItem, MenuButton, SubMenu, MenuRadioGroup, MenuDivider, MenuHeader } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import { BsGearFill } from 'react-icons/bs';
import { useLocation } from 'react-router-dom';

import Database from "../../services/db";
const db = new Database();

const Settings = ({ sortingSchemes, sortOpt, setSortOpt, setShowAboutPage }) => {

  const path = useLocation().pathname.toString().toLowerCase();

  const inTrickList = path === "/" ? true : false;
  const inComboList = path === "/combos" ? true : false;

  return (
    <Menu menuButton={<button className="btn"><BsGearFill/></button>} transition>
      <MenuHeader>Sorting</MenuHeader>
      <MenuRadioGroup value={sortOpt} onRadioChange={e => setSortOpt(e.value)}>
        {inTrickList && sortingSchemes[0].map(scheme => <MenuItem value={scheme.id} key={"scheme" + scheme.id} >{scheme.name}</MenuItem>)}
        {inComboList && sortingSchemes[1].map(scheme => <MenuItem value={scheme.id} key={"scheme" + scheme.id} >{scheme.name}</MenuItem>)}
      </MenuRadioGroup>
      <MenuDivider />
      <MenuItem onClick={db.populateTricks} >Reset predefined tricks</MenuItem>
      <MenuItem onClick={db.dropUserTricks} >Delete all added tricks</MenuItem>
      <MenuItem onClick={() => setShowAboutPage(true)} >About</MenuItem>
    </Menu>
  );
}

export default Settings;
