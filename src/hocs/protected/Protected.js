import React, { useContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context";
import { Test } from "../../pages";
import { isEmpty } from "lodash";
const Protected = ({})=>{
    const [context] = useContext(AuthContext)
    const [isAuthorised, setAuthorised]  = useState(false)
    const navigate = useNavigate()
    // console.log(context)
    useEffect(()=>{
        if(!isEmpty(context)){
            setAuthorised(true)
        }else{
            setAuthorised(false)
            navigate("/")
        }
    }, [context])
    if(isAuthorised){
    return (
    
        <Routes>
          <Route path="/components" exact element={<Test />} />
      </Routes>
    )}

}

export default Protected