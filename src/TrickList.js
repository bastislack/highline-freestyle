import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";

const TrickList = ({ tricks }) => {

  const [data, setData] = useState([]);
  //TODO: do keep sorting state consistent when navigating back
  const [sortType, setSortType] = useState(0); //define here initail sorting from sortOptions

  const sortOptions = [
    {name: "by Id", compfunc: (a,b) => a.id-b.id},
    {name: "by Name", compfunc: (a,b) => a.name.localeCompare(b.name)},
  ];

  const sortings = sortOptions.map((item, i) => {
    return (
      <option value={i}>{item.name}</option>
    )
  });

  useEffect(() => {
    const sorted = [...tricks].sort(sortOptions[sortType].compfunc);
    setData(sorted);
  }, [sortType]);

  //TODO: the sortSelect element can be moved somewhere else
  return (
    <div className="justify-content-evenly">

      <div className="sortSelect">Set your sorting:
        <select onChange={(e) => setSortType(e.target.value)}>
          {sortings}
        </select>
      </div>

      <div className="row">
      {data.map(trick => (
          <Link className="col-md-4 link-to-trick " to={`/tricks/${trick.id}`}>
            <button className=" btn btn-outline-success trick-preview" key={trick.id} freq={trick.skillFreq}>
              <h2>{ trick.name }</h2>
            </button>
          </Link>
      ))}
    </div>
    </div>
  );
}

export default TrickList;
