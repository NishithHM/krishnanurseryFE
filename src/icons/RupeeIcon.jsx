import React from "react";

function Icon({ isSelected }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 -960 960 960"
      fill={isSelected ? "#fff" : "#000"} // Change the fill based on isSelected
    >
      <path d="M540-172L306-416v-44h114q63 0 116-39.5T588-616H266v-28h320q-11-51-57-83.5T420-760H266v-28h428v28H528q33 17 57 48.5t29 67.5h80v28h-78q2 85-58 134.5T420-432h-90l249 260h-39z"></path>
    </svg>
  );
}

export default Icon;
