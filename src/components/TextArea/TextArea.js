import React from "react";
import styles from "./TextArea.module.css";

const TextArea = (props) => {
  return (
    <div>
      <label className={styles.textareatitle}>
        {props.title}{" "}
        {props.required && <span style={{ color: "red" }}>*</span>}
      </label>
      <textarea
        maxLength={100}
        value={props.value}
        onChange={(e) => props.onChange(e, props.id)}
        className={styles.textareastyle}
        name={props.name}
        rows={props.rows}
      ></textarea>
    </div>
  );
};

export default TextArea;
