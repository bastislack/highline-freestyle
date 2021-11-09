import { Link } from 'react-router-dom';
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Menu, MenuItem, MenuButton, SubMenu, MenuRadioGroup } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

import Database from "../services/db";
const db = new Database();

const TrickList = () => {

  const [sortOpt, setSortOpt] = useState(0);

  // the schemes with the sorting function, the sorting name and a function to the attribute
  const schemes = [
    {"name": "Level Upwards",
      "id": 0,
      "sortFunc": (a, b) => (a.difficultyLevel - b.difficultyLevel),
      "catName": "Level",
      "attributeFunc": (a) => a.difficultyLevel,
      "showCategory": true,
    },
    {"name": "Level Downwards",
      "id": 1,
      "sortFunc": (a, b) => (b.difficultyLevel - a.difficultyLevel),
      "catName": "Level",
      "attributeFunc": (a) => a.difficultyLevel,
      "showCategory": true,
    },
    {"name": "StickFrequency Upwards",
      "id": 2,
      "sortFunc": (a, b) => {if (a.stickFrequency) return (a.stickFrequency - b.stickFrequency);return 0.1;},
      "catName": "StickFrequency",
      "attributeFunc": (a) => a.stickFrequency,
      "showCategory": false,
    },
    {"name": "StickFrequency Downwards",
      "id": 3,
      "sortFunc": (a, b) => {if (a.stickFrequency) return (b.stickFrequency - a.stickFrequency);return 1;},
      "catName": "StickFrequency",
      "attributeFunc": (a) => a.stickFrequency,
      "showCategory": false,
    },
  ];

  // tricks query with react hooks -- means it refreshes automaticly
  // and sorts it according to the sortOpt
  const tricks = useLiveQuery(() => db.getAllTricks().then(t => t.sort(schemes[sortOpt].sortFunc)), [sortOpt]);
  if (!tricks) {return null} else console.log(tricks);


  let current;

  // TODO: move the Settings Menu  somewhere where it makes more sense
  return (
    <div className="justify-content-evenly">

      <Menu menuButton={<MenuButton>Settings</MenuButton>} transition>
        <SubMenu label="Sort Options">
          <MenuRadioGroup value={sortOpt} onRadioChange={e => setSortOpt(e.value)}>
            {schemes.map(scheme => <MenuItem value={scheme.id} key={"scheme" + scheme.id} >{scheme.name}</MenuItem>)}
          </MenuRadioGroup>
        </SubMenu>
        <MenuItem onClick={db.populateTricks} >Reset predefined tricks</MenuItem>
        <MenuItem onClick={db.dropUserTricks} >Delete all added tricks</MenuItem>
        <MenuItem onClick={db.dropUserAtributes} >Reset stickFrequencies</MenuItem>
        <MenuItem onClick={() => alert("coming soon")} >About</MenuItem>
      </Menu>

      <div className="row">
        {tricks.map(trick => {

          let isFirst = (schemes[sortOpt].attributeFunc(trick) !== current);
          current = schemes[sortOpt].attributeFunc(trick);

          return (
            <div key={trick.id}>
              {isFirst && schemes[sortOpt].showCategory && <div>{schemes[sortOpt].catName} {current}</div>}
              <div>
                <Link className="link-to-trick " to={`/tricks/${trick.id}`} key={"trick" + trick.id} >
                  <button className=" btn btn-outline-success trick-preview skillFreq" freq={trick.stickFrequency}>
                    <h2>{trick.alias || trick.technicalName}</h2>
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TrickList;
