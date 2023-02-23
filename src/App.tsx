import { useEffect, useState } from "react";
import './App.css';

import { Box, Button } from "@mui/material";
import MainTopBar from "./components/MainTopBar";
import { Media } from "./spriggan-shared/types/Media";

import { useWalletConnectClient } from "./chia-walletconnect/WalletConnectClientContext";
import { useWalletConnectRpc, WalletConnectRpcParams } from "./chia-walletconnect/WalletConnectRpcContext";
import GameGrid from "./components/GameGrid";
import { useSearch } from "./contexts/SearchContext";
import { SearchParams } from "./spriggan-shared/types/SearchTypes";

function App() {
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout>(setTimeout(async () => {}, 100));
	const [activeOffer, setActiveOffer] = useState<string>("");

	const { search, mostRecent } = useSearch()
	
	const [searchResults, setSearchResults] = useState<Media[]>([]);
	useEffect(() => {
		if (searchTerm !== "") {
			clearTimeout(searchDebounce)
			setSearchDebounce(setTimeout(async () => {
				setSearchResults(await search({titleTerm: searchTerm} as SearchParams))
			}, 300));
		}
	}, [searchTerm]);

	const [mostRecentResults, setMostRecentResults] = useState<Media[]>([]);
	useEffect(() => {
		async function fetchData() {
			setMostRecentResults(await mostRecent({} as SearchParams));
		}
		fetchData();
	}, [mostRecent]);


	useEffect(() => {
		document.title = `Spriggan Marketplace`;
	}, [searchResults]);


	// Initialize the WalletConnect client.
	const {
		client,
		pairings,
		session,
		connect,
		disconnect,
		isInitializing,
	} = useWalletConnectClient();

	// Use `JsonRpcContext` to provide us with relevant RPC methods and states.
	const {
		ping,
		walletconnectRpc,
	} = useWalletConnectRpc();


	useEffect(() => {
		async function testConnection() {
			try {
				const connected = await ping();
				if (!connected) {
					disconnect()
				}
				return connected
			} catch (e) {
				console.log("ping fail", e)
				disconnect();
			}
		}

		if (!isInitializing) {
			testConnection()
		}

		const interval = setInterval(() => {
			// This will run every 10 mins
			console.log("Ping: ", testConnection());
		}, 1000 * 60 * 1);

		return () => clearInterval(interval)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session]);

	const onConnect = () => {
		if (typeof client === "undefined") {
			throw new Error("WalletConnect is not initialized");
		}
		// Suggest existing pairings (if any).
		if (pairings.length) {
			connect(pairings[pairings.length-1]);
		} else {
			// If no existing pairings are available, trigger `WalletConnectClient.connect`.
			connect();
		}
	};


	const executeOffer = async () => {
		if (session && activeOffer) {
			var x = session.namespaces.chia.accounts[0].split(":");
			console.log(x[0] + ':' + x[1], x[2]);
			await walletconnectRpc.takeOffer({ fingerprint: x[2], offer: activeOffer, fee: 1 } as WalletConnectRpcParams);
		}
	};

	
	return (
			<Box>
				<Button onClick={async () => {
					if (session) {
						var x = session.namespaces.chia.accounts[0].split(":");
						await walletconnectRpc.getNFTs({ fingerprint: x[2] } as WalletConnectRpcParams);
					}
				}}>Execute test</Button>
				{MainTopBar(session, onConnect, disconnect, (event) => {setSearchTerm(event.target.value)})}
				{GameGrid("Search Results", searchResults, executeOffer, setActiveOffer)}
				{GameGrid("Recently Updated", mostRecentResults, executeOffer, setActiveOffer)}
			</Box>
	);
}

export default App;
