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
      <path d="M312-172q-25 0-42.5-17.5T252-232v-488h-40v-28h148v-28h240v28h148v28h-40v488q0 26-17 43t-43 17H312zm368-548H280v488q0 14 9 23t23 9h336q12 0 22-10t10-22v-488zM402-280h28v-360h-28v360zm128 0h28v-360h-28v360zM280-720v520-520z"></path>
    </svg>
  );
}

export default Icon;