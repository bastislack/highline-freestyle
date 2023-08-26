import { Menu, MenuItem, SubMenu, MenuDivider } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import { BsGearFill } from 'react-icons/bs';
import LanguageSelector from "../buttons/LanguageSelector"
import { useNavigate } from 'react-router';

import Database from "../../services/db";
const db = new Database();

const Settings = ({ setShowAboutPage, setShowResetWarning }) => {
  const navigate = useNavigate();

  const selectImportFile = (e) => {
    db.importDatabase(e.target.files[0]);
  };

  return (
    <Menu menuButton={<button className="btn btn-secondary btn-outline-secondary"><BsGearFill/></button>} transition>
      <MenuItem onClick={() => setShowResetWarning("tricks")} >Reset all tricks</MenuItem>
      <MenuItem onClick={() => setShowResetWarning("combos")} >Reset all combos</MenuItem>

      <MenuDivider />

      <MenuItem onClick={() => db.exportDatabase()} >Export Database</MenuItem>
      <SubMenu label="Import Database File">
        <MenuItem onChange={selectImportFile} ><input type="file" /></MenuItem>
      </SubMenu>

      <MenuDivider />

      <MenuItem><LanguageSelector /></MenuItem>

      <MenuDivider />
      <MenuItem onClick={() => self.open("https://forms.gle/Kg1Kydh8tqG4f7Vv8")} >Propose new trick</MenuItem>
      <MenuItem onClick={() => setShowAboutPage(true)} >About</MenuItem>
    </Menu>
  );
}

export default Settings;
