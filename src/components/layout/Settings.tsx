import {Menu, MenuItem, SubMenu, MenuRadioGroup, MenuDivider, MenuHeader} from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import {BsGearFill} from "react-icons/bs";
import {useLocation} from "react-router-dom";
import {trickSortingSchemes, comboSortingSchemes} from "../../services/sortingSchemes";
import LanguageSelector from "../buttons/LanguageSelector";
import {useNavigate} from "react-router";

import Database from "../../services/db";
const db = new Database();

interface SettingsProps {
  sortOpt: unknown;
  setSortOpt: (sortOpt: unknown) => void;
  setShowAboutPage: (showAboutPage: boolean) => void;
  setShowResetWarning: (showResetWarning: string) => void; // TODO: why is this of type String?
}

const Settings = ({sortOpt, setSortOpt, setShowAboutPage, setShowResetWarning}: SettingsProps) => {
  const navigate = useNavigate();

  const path = useLocation().pathname.toString().toLowerCase();

  const inTrickList = path === "/";
  const inComboList = path === "/combos";

  const selectImportFile: React.FormEventHandler<HTMLInputElement> = (e) => {
    if (!e.target) {
      console.log("TODO: Proper Handling");
      return;
    }
    const files: FileList | null = (e.target as any).files;
    if (!files || files.length === 0) {
      console.log("TODO: No Files found");
      return;
    }
    const firstFile = files[0];

    const fileReader = new FileReader();
    fileReader.readAsText(firstFile, "UTF-8");
    fileReader.onload = (e) => {
      console.log("importing", e.target!.result);
      db.importDatabase(e.target!.result);
      // TODO: fix this navigate, fire instead Dexie.on.storagemutated
      navigate(0);
    };
  };

  return (
    <Menu
      menuButton={
        <button className="btn btn-secondary btn-outline-secondary">
          <BsGearFill />
        </button>
      }
      transition
    >
      {(inTrickList || inComboList) && (
        <>
          <MenuHeader>Sorting</MenuHeader>
          <MenuRadioGroup value={sortOpt} onRadioChange={(e) => setSortOpt(e.value)}>
            {inTrickList &&
              trickSortingSchemes.map((scheme) => (
                <MenuItem value={scheme.id} key={"scheme" + scheme.id}>
                  {scheme.name}
                </MenuItem>
              ))}
            {inComboList &&
              comboSortingSchemes.map((scheme) => (
                <MenuItem value={scheme.id} key={"scheme" + scheme.id}>
                  {scheme.name}
                </MenuItem>
              ))}
          </MenuRadioGroup>
          <MenuDivider />
        </>
      )}

      <MenuItem onClick={() => setShowResetWarning("tricks")}>Reset all tricks</MenuItem>
      <MenuItem onClick={() => setShowResetWarning("combos")}>Reset all combos</MenuItem>

      <MenuDivider />

      <MenuItem onClick={() => db.exportDatabase()}>Export Database</MenuItem>
      <SubMenu label="Import Database File">
        <MenuItem onChange={selectImportFile}>
          <input type="file" />
        </MenuItem>
      </SubMenu>

      <MenuDivider />

      <MenuItem>
        <LanguageSelector />
      </MenuItem>

      <MenuDivider />
      <MenuItem onClick={() => self.open("https://forms.gle/Kg1Kydh8tqG4f7Vv8")}>Propose new trick</MenuItem>
      <MenuItem onClick={() => setShowAboutPage(true)}>About</MenuItem>
    </Menu>
  );
};

export default Settings;
