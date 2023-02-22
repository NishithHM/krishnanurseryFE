import React, { useState } from "react";
import styles from "./Search.module.css"
import { ImSearch } from "react-icons/im";

const Search = ({title, onChange, value})=>{
    return(
        <div className={styles.wrapper}>
            <div className={styles.searchContainer}>
            <input
            value={value}
            onChange={onChange}
            placeholder={title}
            className={styles.searchInput}
          />
          <ImSearch size={22} color="#4f4e4e" className={styles.searchIcon} />
            </div>
        </div>
    )
}

export default Search