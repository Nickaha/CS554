import React from 'react';

const Search = (props) => {
  const handleChange = (e) => {
    console.log(e.target.value)
    console.log('pagenum' +props.pagenum)
    props.searchValue(e.target.value);
  };
  return (
    <form
      method="POST "
      onSubmit={(e) => {
        e.preventDefault();
      }}
      name="formName"
      className="center"
    >
      <label>
        <span>Search: </span>
        <input
          autoComplete="off"
          type="text"
          name="searchTerm"
          onChange={handleChange}
        />
      </label>
    </form>
  );
};

export default Search;