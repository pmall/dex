import React, { useEffect, useState } from 'react'
import Web3 from 'web3'

declare global {
    interface Window {
        ethereum: any;
        web3: Web3;
    }
}

type Pending = {
    state: 'PENDING',
}

type Connected = {
    state: 'CONNECTED',
    web3: Web3,
}

type Denied = {
    state: 'DENIED',
}

type Absent = {
    state: 'ABSENT',
}

type Result = Pending | Connected | Denied | Absent

const connect = async (): Promise<Result> => {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.enable()
            return { state: 'CONNECTED', web3 }
        } catch (e) {
            return { state: 'DENIED' }
        }
    }
    else if (window.web3) {
        const web3 = new Web3(window.web3.currentProvider);
        return { state: 'CONNECTED', web3 }
    }
    else {
        return { state: 'ABSENT' }
    }
}

const App: React.FC = () => {
    const [result, setResult] = useState<Result>({ state: 'PENDING' })

    useEffect(() => { connect().then(setResult) }, [])

    switch (result.state) {
        case 'PENDING': {
            return <div>Waiting for web3 provider.</div>
        }
        case 'DENIED': {
            return <div>You must allow the website to connect to your metamask account.</div>
        }
        case 'ABSENT': {
            return <div>You must install metamask to use this website.</div>
        }
        case 'CONNECTED': {
            return <ConnectedSection web3={result.web3} />
        }
    }
}

const ConnectedSection: React.FC<{ web3: Web3 }> = ({ web3 }) => {
    const [account, setAccount] = useState<string | null>(null)

    useEffect(() => {
        web3.eth.getAccounts().then(accounts => setAccount(accounts[0]))
    }, [web3])

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => setAccount(accounts[0]))
        }
    }, [])

    return account === null ? null : <p>Connected with account: {account}</p>
}

export default App;
