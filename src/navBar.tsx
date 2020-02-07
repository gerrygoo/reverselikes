import * as React from "react";
import { styles } from "./styles";

export const navBar = (loaded: number, onLoadButton: () => any) => (
    <div style={styles.navbar}>
        {`Reverse tumblr likes browser  loaded ${loaded}`}
        <button onClick={onLoadButton}/>
    </div>
);
