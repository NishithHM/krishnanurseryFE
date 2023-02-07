import React from "react";
import styles from "./Search.module.css"
import search from "../../assets/images/search.png"
import { useState } from "react";

const Search = ({placeholder})=>{
    return(
        <div>
            <input className={styles.searchBox} type="text" placeholder={placeholder}/>
        </div>
    )
}

export default Search