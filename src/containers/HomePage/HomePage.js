import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import SceneImage from "../../components/SceneImage";
// import * as Cmd from  Cmds;
import Rooms from "./Rooms";

let historyIndex = -1;
let prevCmd = "";
const HomePage = props => {
	const [output, setOutput] = useState([
		'Welcome! If you are new to the game, here are some tips:\n\nLook at your surroundings with the command "ls".\nMove to a new location with the command "cd LOCATION"\nYou can backtrack with the command "cd ..".\nInteract with things in the world with the command "less ITEM"\n\nIf you forget where you are, type "pwd"\n\nGo ahead, explore. We hope you enjoy what you find. Do `ls` as your first command.\n'.split(
			"\n"
		)
	]);
	const [history, setHistory] = useState([]);
	const [cmd, setCmd] = useState("");
	const [dir, setDir] = useState(Rooms.Home);
	const [item, setItem] = useState(null);
	const [cmdRef, setCmdRef] = useState(null);

	useEffect(() => {
		if (cmdRef) {
			cmdRef.scrollIntoView({ behavior: "auto" });
		}
	}, [output]);

	const iterateThroughPath = (currentRoom, fullPath) => {
		return new Promise(function(resolve, reject) {
			let error = "";
			let path = fullPath.slice(0);
			while (path.length > 0) {
				let newRoom = path.shift();
				if (!newRoom || newRoom === ".") {
					continue;
				}
				if (newRoom === "..") {
					if (!currentRoom.parent) {
						break;
					}
					currentRoom = currentRoom.parent;
				} else {
					let result = currentRoom.children.find(
						i => i.key === newRoom
					);
					if (!result) {
						error = `There is no room at '${fullPath.join("/")}'`;
						reject(error);
					} else if (!result.isEnterable && path.length === 1) {
						error = `Could not enter this room. ${result.desc}`;
						reject(error);
					} else {
						currentRoom = result;
					}
				}
			}
			resolve(currentRoom);
		});
	};

	const autoCompleteInput = async () => {
		let lastIndex = cmd.lastIndexOf(" ") + 1;
		let dirStr = cmd.substr(lastIndex).trim();

		//iterate through path
		let last = dirStr.substr(dirStr.lastIndexOf("/") + 1);
		try {
			let currentRoom = await iterateThroughPath(
				dir,
				dirStr.split("/").slice(0, -1)
			);
			//check if last term in path matches anything in that directory

			if (
				currentRoom.children.find(
					i => i.key.toLowerCase() === last.toLowerCase()
				)
			) {
				if (currentRoom.children.length > 1) {
					let index =
						Math.max(cmd.lastIndexOf(" "), cmd.lastIndexOf("/")) +
						1;
					return (
						cmd.substr(0, index) +
						currentRoom.children[
							(currentRoom.children.indexOf(
								currentRoom.children.find(
									i =>
										i.key.toLowerCase() ===
										last.toLowerCase()
								)
							) +
								1) %
								currentRoom.children.length
						]
					);
				}
				return cmd;
			} else if (last) {
				let options = currentRoom.children.filter(i =>
					i.key.toLowerCase().startsWith(last.toLowerCase())
				);
				if (options.length > 0) {
					return (
						cmd.substr(0, lastIndex) +
						dirStr.substr(0, dirStr.lastIndexOf("/") + 1) +
						options.sort()[0]
					);
				}
				return cmd;
			} else {
				if (currentRoom.children.length) {
					return cmd + currentRoom.children.sort()[0].key;
				}
				return cmd;
			}
		} catch (err) {
			return cmd;
		}
	};

	const handleInputChange = event => {
		const target = event.target;
		const value =
			target.type === "checkbox" ? target.checked : target.value;

		setCmd(value);
	};

	const handleKeyDown = async event => {
		switch (event.key) {
			case "Enter":
				historyIndex = -1;
				handleCmdSubmit(cmd);
				setHistory([cmd, ...history]);
				setCmd("");
				break;

			case "Tab":
				event.preventDefault();
				setCmd(await autoCompleteInput());
				break;

			case "ArrowUp":
				if (historyIndex === -1) {
					prevCmd = cmd;
				}
				if (historyIndex < history.length - 1) {
					setCmd(history[++historyIndex]);
				}
				break;

			case "ArrowDown":
				if (historyIndex >= 0) {
					setCmd(history[--historyIndex]);
				}
				if (historyIndex === -1) {
					setCmd(prevCmd);
				}
				break;

			default:
				break;
		}
	};

	const handleCmdSubmit = async text => {
		setItem(null);
		const addToOutput = output => {
			if (!Array.isArray(output)) {
				output = output
					.toString()
					.trim()
					.split("\n");
			}
			group.push(...output);
		};

		let [cmd, ...terms] = text.trim().split(" ");
		let group = [];
		addToOutput(`> ${text}`);
		let error = "";
		switch (cmd.toLowerCase()) {
			case "cd":
				if (terms.length == 0 || terms[0] == "~") {
					setDir(Rooms.Home);
					addToOutput("You have come Home!");
				} else {
					let path = terms[0].split("/");
					try {
						let currentRoom = await iterateThroughPath(dir, path);
						if (!currentRoom.isEnterable) {
							addToOutput(
								`Could not enter this room. ${currentRoom.desc}`
							);
							break;
						}
						setDir(currentRoom);
						addToOutput(`You have moved to ${currentRoom}`);
						addToOutput(currentRoom.desc);
					} catch (error) {
						addToOutput(error);
					}
				}
				break;

			case "less":
				if (terms.length === 1) {
					let path = terms[0].split("/");

					try {
						let currentRoom = await iterateThroughPath(
							dir,
							path.slice(0, -1)
						);
						let last = terms[0].substr(
							terms[0].lastIndexOf("/") + 1
						);
						let result = currentRoom.items.find(
							i => i.key === last
						);
						if (!result) {
							addToOutput(`There is no '${last}' item here.`);
						} else {
							setItem(result);
							addToOutput(result.desc);
						}
					} catch (error) {
						addToOutput(error);
					}
				} else {
					addToOutput("Choose an item to use less on.");
				}
				break;

			case "ls":
				let path = (terms[0] && terms[0].split("/")) || "";
				try {
					let currentRoom = await iterateThroughPath(dir, path);
					addToOutput(currentRoom.ls());
				} catch (error) {
					addToOutput(error);
				}
				break;

			case "mv":
				if (terms.length === 2) {
					let srcPath = terms[0].split("/");
					try {
						let srcRoom = await iterateThroughPath(
							dir,
							srcPath.slice(0, -1)
						);
						let last = terms[0].substr(
							terms[0].lastIndexOf("/") + 1
						);

						//make sure src item exists
						let srcItem =
							srcRoom.items[
								Object.keys(srcRoom.items).find(i => i === last)
							];
						if (!srcItem) {
							addToOutput(
								`Could not find an item called '${last}'.`
							);
							break;
						}
						if (srcItem.moveableTo.length <= 1) {
							addToOutput(`The item '${last}' is not moveable.`);
							break;
						}

						//get destination room
						let destPath = terms[1].split("/");
						let destRoom = await iterateThroughPath(dir, destPath);
						if (destRoom === srcItem.location) {
							addToOutput(
								`The item '${last}' is already in ${destRoom}.`
							);
							break;
						} else if (!srcItem.moveableTo.includes(destRoom)) {
							addToOutput(
								`The item '${last}' cannot be moved to ${destRoom}.`
							);
							break;
						}

						//Move item to new room
						srcItem.location.removeItem(srcItem.key);
						srcItem.location = destRoom;
						destRoom.addItem(srcItem);
						addToOutput(`Moved ${last} to ${destRoom}`);
					} catch (error) {
						addToOutput(error);
					}
				} else if (terms.length === 1) {
					addToOutput("Choose a location to move the object.");
				} else {
					addToOutput(
						"You need to specifiy an object and a location to move it to. Use `mv [Thing A] to [Place B]`."
					);
				}
				break;

			case "pwd":
				addToOutput(dir.pwd().split("\n"));
				break;

			case "tellme":
				let valid_rooms = ["MIT", "AthenaCluster", "StataCenter"];
				if (valid_rooms.includes(dir.key)) {
					if (
						terms.length === 1 &&
						terms[0].toLowerCase() === "combo"
					) {
						addToOutput(
							"The combination is 'terminus' (without the quotes)."
						);
					} else {
						addToOutput(
							"Incorrect syntax. Ask the OldMan for help with the `man` command."
						);
					}
					break;
				}

			case "terminus":
				if (dir.key === "MIT") {
					addToOutput(
						"You have correctly entered the cluster combo. Entering the AthenaCluster."
					);
					let newDir = dir.children.find(
						i => i.key === "AthenaCluster"
					);
					setDir(newDir);
					break;
				}

			default:
				addToOutput(`'${text}' is not recognized as a command.`);
				break;
		}
		setOutput([...output, group]);
	};

	return (
		<div className="h-100">
			<Helmet>
				<title>Terminus</title>
				<meta
					name="description"
					content="A React.js based linux terminal learning game"
				/>
			</Helmet>

			<div
				style={{ display: "flex", flexFlow: "column", height: "100%" }}
			>
				<h1 className="text-center">Terminus</h1>
				<SceneImage image={(item && item.img) || dir.img} />
				<div id="term" className="terminal d-flex">
					<div className="terminal-output">
						{output.map((group, i) => (
							<div className="terminal-output-group" key={i}>
								{group.map((line, j) => (
									<pre
										className="terminal-output-line"
										key={j}
									>
										{line}
									</pre>
								))}
							</div>
						))}
					</div>
					<div className="cmd">
						<span className="prompt">&gt;</span>
						<span></span>
						<span className="cursor inverted">&nbsp;</span>
						<span></span>
						<input
							autoFocus
							maxLength="280"
							className="clipboard"
							value={cmd}
							onChange={handleInputChange}
							onKeyDown={handleKeyDown}
							ref={el => {
								setCmdRef(el);
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HomePage;
