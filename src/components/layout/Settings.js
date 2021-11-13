import { Menu, MenuItem, MenuButton, SubMenu, MenuRadioGroup } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import { BsGearFill } from 'react-icons/bs';
import { useLocation } from 'react-router-dom';

import Database from "../../services/db";
const db = new Database();

const Settings = ({ sortingSchemes, sortOpt, setSortOpt }) => {

  const path = useLocation().pathname.toString().toLowerCase();

  var buttonVisible = false
  if (path === "/") {
    buttonVisible = true
  }

  if (buttonVisible === true) {
    return (
      <Menu menuButton={<button className="btn"><BsGearFill/></button>} transition>
        <SubMenu label="Sort Options">
          <MenuRadioGroup value={sortOpt} onRadioChange={e => setSortOpt(e.value)}>
            {sortingSchemes.map(scheme => <MenuItem value={scheme.id} key={"scheme" + scheme.id} >{scheme.name}</MenuItem>)}
          </MenuRadioGroup>
        </SubMenu>
        <MenuItem onClick={db.populateTricks} >Reset predefined tricks</MenuItem>
        <MenuItem onClick={db.dropUserTricks} >Delete all added tricks</MenuItem>
        <MenuItem onClick={db.dropUserAtributes} >Reset stickFrequencies</MenuItem>
        <MenuItem onClick={() => alert("coming soon")} >About</MenuItem>
      </Menu>
    );
  }

  return (null)

}

export default Settings;
