import { CSSProperties } from "react";

export const styles: { [idx: string]: CSSProperties } = {
    body: {
        backgroundColor: "rgb(54,70,93)",
        display: "flex",
        justifyContent: "center",
    },
    navbar: {
        position: "fixed",
        top: 0,
        height: 20,
        width: "100%",
        backgroundColor: "SteelBlue",
        zIndex: 1,
        flexDirection: "row",
        display: "flex",
    },

    photoPost: {
        backgroundColor: "white",
        // alignItems: "center",
        display: "flex",
        flexDirection: "column",
    },

    postRow: {
        alignSelf: "flex-start",
    },

    image: {
        display: "block",
        width: "inherit",
    },
};
