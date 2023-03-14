import { CssBaseline } from "@mui/material";
import { green } from '@mui/material/colors';
import { Experimental_CssVarsProvider as CssVarsProvider, experimental_extendTheme as extendTheme } from '@mui/material/styles';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { WalletConnectClientContextProvider } from "./chia-walletconnect/contexts/WalletConnectClientContext";
import { WalletConnectRpcContextProvider } from "./chia-walletconnect/contexts/WalletConnectRpcContext";
import { SearchContextProvider } from "./spriggan-shared/contexts/SearchContext";
import { SprigganRpcContextProvider } from './spriggan-shared/contexts/SprigganRpcContext';

const theme = extendTheme({
	colorSchemes: {
		dark: { // palette for dark mode
			palette: {
				primary: {
					main: green[500]
				},
				secondary: {
					main: green[500]
				}
			}
		}
	}
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<React.StrictMode>
		<CssVarsProvider theme={theme}>
			<WalletConnectClientContextProvider>
				<WalletConnectRpcContextProvider>
					<SprigganRpcContextProvider>
						<SearchContextProvider>
							<CssBaseline />
							<App />
						</SearchContextProvider>
					</SprigganRpcContextProvider>
				</WalletConnectRpcContextProvider>
			</WalletConnectClientContextProvider>
		</CssVarsProvider>
	</React.StrictMode>
);

