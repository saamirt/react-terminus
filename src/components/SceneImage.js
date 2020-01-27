import React from "react";
import { NavLink } from "react-router-dom";

const SceneImage = ({ image = "none.gif" }) => {
	return (
		<img
			className="location-image d-flex m-4 mb-5 mx-auto"
			src={process.env.PUBLIC_URL + "/img/" + image}
		/>
	);
};

export default SceneImage;
