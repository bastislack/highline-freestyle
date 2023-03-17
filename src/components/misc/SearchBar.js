import React from 'react'
import { InputGroup, DropdownButton, Dropdown, Form } from "react-bootstrap";

function SearchBar({ sortingSchema, dropdownHeader, searchPattern, onFilter, onSort }) {
  return (
    <InputGroup>
      <Form.Control
        placeholder="Search"
        value={searchPattern}
        onChange={(e) => {onFilter(e.target.value)}}
      />
      <DropdownButton title="Sort">
        <Dropdown.Header>{dropdownHeader}</Dropdown.Header>
        {sortingSchema.map(scheme => 
          <Dropdown.Item onClick={() => onSort(scheme.id)}>
            {scheme.name}
          </Dropdown.Item>
        )}
      </DropdownButton>
    </InputGroup>
  );
};

export default SearchBar;