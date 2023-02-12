import React from "react";
import styles from "./landingTile.module.css";
import cx from "classnames";
const LandingTile = (props) => {
  const { image, title, isDisabled = false, onClick = () => null } = props;
  return (
    <div
      onClick={onClick}
      className={cx(styles.card, { [`${styles.disabled}`]: isDisabled })}
    >
      <img src={image} alt={title} className={styles.image} />
      <p className={styles.title}>{title}</p>
    </div>
  );
};

export default LandingTile;
