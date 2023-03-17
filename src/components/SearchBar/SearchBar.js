import React from 'react'
import { IoSearchSharp } from 'react-icons/io5';
import { DropdownButton, Dropdown } from "react-bootstrap";
import "./SearchBar.css"

function SearchBar({ sortingSchema, dropdownHeader, searchPattern, onFilter, onSort }) {
  return (
    <div id="search-bar">
      <div className="text-filter">
        <IoSearchSharp size={24}/>
        <input
            type="search"
            value={searchPattern}
            placeholder="Search"
            onChange={(e) => {
              console.log('CHANGED')
              console.log(e.target.value)
              onFilter(e.target.value)
            }}
            // onChange={(e) => setSearchPattern(e.target.value)}
        />
      </div>
      <DropdownButton title="Sort">
        <Dropdown.Header>{dropdownHeader}</Dropdown.Header>
        {sortingSchema.map(scheme => 
            // <Dropdown.Item onClick={() => setSortOpt(scheme.id)}>
            <Dropdown.Item onClick={() => onSort(scheme.id)}>
            {scheme.name}
            </Dropdown.Item>
        )}
      </DropdownButton>
    </div>
  )
}

export default SearchBar