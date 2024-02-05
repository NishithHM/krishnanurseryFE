import React from "react";
function Icon({status}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 -960 960 960"
      fill={status? "#ffff" :"#038819 "}
    >
      <path d="M160-200h132v-320h376v320h132v-426L480-754 160-626v426zm-28 28v-473l348-139 348 139v473H640v-320H320v320H132zm257 0v-56h56v56h-56zm63-120v-56h56v56h-56zm63 120v-56h56v56h-56zM292-520h376-376z"></path>
    </svg>
  );
}

export default Icon;