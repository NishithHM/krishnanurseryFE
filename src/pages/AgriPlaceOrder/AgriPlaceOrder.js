import React from "react";
import { AgriVarinatsAddition } from "../../components";

const AgriPlaceOrder = ()=>{
    return(
        <div>
              <AgriVarinatsAddition onChange={e=>console.log(e)} />
        </div>
      
    )
}

export default AgriPlaceOrder